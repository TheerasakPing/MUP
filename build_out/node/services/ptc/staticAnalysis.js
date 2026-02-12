"use strict";
/**
 * Static Analysis for PTC Code
 *
 * Analyzes agent-generated JavaScript code before execution to catch:
 * - Syntax errors (via QuickJS parser)
 * - Unavailable constructs (import(), require())
 * - Unavailable globals (process, window, etc.)
 *
 * The runtime also wraps ReferenceErrors with friendlier messages as a backstop.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNAVAILABLE_IDENTIFIERS = void 0;
exports.analyzeCode = analyzeCode;
exports.disposeAnalysisContext = disposeAnalysisContext;
const typescript_1 = __importDefault(require("typescript"));
const quickjs_emscripten_core_1 = require("quickjs-emscripten-core");
const ffi_1 = require("@jitl/quickjs-wasmfile-release-asyncify/ffi");
const typeValidator_1 = require("./typeValidator");
/**
 * Identifiers that don't exist in QuickJS and will cause ReferenceError.
 * Used by static analysis to block execution, and by runtime for friendly error messages.
 */
exports.UNAVAILABLE_IDENTIFIERS = new Set([
    // Node.js globals
    "process",
    "require",
    "module",
    "exports",
    "__dirname",
    "__filename",
    // Browser globals
    "window",
    "document",
    "navigator",
    "fetch",
    "XMLHttpRequest",
]);
const WRAPPER_LINE_OFFSET = typeValidator_1.WRAPPER_PREFIX.split("\n").length - 1;
// ============================================================================
// Pattern Definitions
// ============================================================================
// NOTE: We intentionally avoid regex scanning for substrings like "require(" or "import("
// because those can appear inside string literals and cause false positives.
//
// Instead, we use the TypeScript AST in detectUnavailableGlobals() to detect actual
// call expressions (require(), import()) and real global references.
// ============================================================================
// QuickJS Context Management
// ============================================================================
let cachedContext = null;
/**
 * Get or create a QuickJS context for syntax validation.
 * We reuse the context to avoid repeated WASM initialization.
 */
async function getValidationContext() {
    if (cachedContext) {
        return cachedContext;
    }
    const variant = {
        type: "async",
        importFFI: () => Promise.resolve(ffi_1.QuickJSAsyncFFI),
        // eslint-disable-next-line @typescript-eslint/require-await
        importModuleLoader: async () => {
            // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
            const mod = require("@jitl/quickjs-wasmfile-release-asyncify/emscripten-module");
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
            return mod.default ?? mod;
        },
    };
    const QuickJS = await (0, quickjs_emscripten_core_1.newQuickJSAsyncWASMModuleFromVariant)(variant);
    cachedContext = QuickJS.newContext();
    return cachedContext;
}
// ============================================================================
// Analysis Functions
// ============================================================================
/**
 * Validate JavaScript syntax using QuickJS parser.
 * Returns syntax error if code is invalid.
 */
async function validateSyntax(code) {
    const ctx = await getValidationContext();
    // Wrap in function to allow return statements (matches runtime behavior)
    const wrappedCode = `(function() { ${code} })`;
    // Use evalCode with compile-only flag to parse without executing.
    const result = ctx.evalCode(wrappedCode, "analysis.js", {
        compileOnly: true,
    });
    if (result.error) {
        const errorObj = ctx.dump(result.error);
        result.error.dispose();
        // QuickJS error object has: { name, message, stack, fileName, lineNumber }
        let message = typeof errorObj.message === "string" ? errorObj.message : JSON.stringify(errorObj);
        // Enhance obtuse "expecting ';'" error when await expression is detected.
        // In non-async context, `await foo()` parses as identifier `await` + stray `foo()`,
        // giving unhelpful "expecting ';'". Detect this pattern and give a clearer message.
        if (message === "expecting ';'" && /\bawait\s+\w/.test(code)) {
            message =
                "`await` is not supported - mux.* functions return results directly (no await needed)";
        }
        const rawLine = typeof errorObj.lineNumber === "number" ? errorObj.lineNumber : undefined;
        // Only report line if it's within agent code bounds.
        // The wrapper is `(function() { ${code} })` - all on one line with code inlined.
        // So QuickJS line N = agent line N for lines within the code.
        // Errors detected at the closing wrapper (missing braces, incomplete expressions)
        // will have line numbers beyond the agent's code - don't report those.
        const codeLines = code.split("\n").length;
        const line = rawLine !== undefined && rawLine >= 1 && rawLine <= codeLines ? rawLine : undefined;
        return {
            type: "syntax",
            message,
            line,
            column: undefined, // QuickJS doesn't provide column for syntax errors
        };
    }
    result.value.dispose();
    return null;
}
/**
 * Detect references to unavailable globals (process, window, fetch, etc.)
 * using TypeScript AST to avoid false positives on object keys and string literals.
 */
function detectUnavailableGlobals(code, sourceFile) {
    const errors = [];
    const seen = new Set();
    const parsedSourceFile = sourceFile ?? typescript_1.default.createSourceFile("code.ts", code, typescript_1.default.ScriptTarget.ES2020, true);
    const codeStartOffset = sourceFile ? typeValidator_1.WRAPPER_PREFIX.length : 0;
    const codeEnd = codeStartOffset + code.length;
    const lineOffset = sourceFile ? WRAPPER_LINE_OFFSET : 0;
    function visit(node) {
        // If the node isn't within the user-authored code region (e.g., inside the wrapper prefix),
        // keep traversing but don't report errors for it.
        const nodeStart = node.getStart(parsedSourceFile);
        const nodeEnd = node.end;
        if (nodeStart < codeStartOffset || nodeEnd > codeEnd) {
            typescript_1.default.forEachChild(node, visit);
            return;
        }
        // Detect forbidden constructs via AST (avoids false positives inside string literals).
        //
        // - dynamic import(): ts.CallExpression whose expression is the ImportKeyword
        // - require(): ts.CallExpression whose expression is identifier "require"
        if (typescript_1.default.isCallExpression(node)) {
            if (node.expression.kind === typescript_1.default.SyntaxKind.ImportKeyword) {
                if (!seen.has("import()")) {
                    seen.add("import()");
                    const { line } = parsedSourceFile.getLineAndCharacterOfPosition(node.expression.getStart(parsedSourceFile));
                    errors.push({
                        type: "forbidden_construct",
                        message: "Dynamic import() is not available in the sandbox",
                        line: line - lineOffset + 1,
                    });
                }
                typescript_1.default.forEachChild(node, visit);
                return;
            }
            if (typescript_1.default.isIdentifier(node.expression) && node.expression.text === "require") {
                if (!seen.has("require()")) {
                    seen.add("require()");
                    const { line } = parsedSourceFile.getLineAndCharacterOfPosition(node.expression.getStart(parsedSourceFile));
                    errors.push({
                        type: "forbidden_construct",
                        message: "require() is not available in the sandbox - use mux.* tools instead",
                        line: line - lineOffset + 1,
                    });
                }
                typescript_1.default.forEachChild(node, visit);
                return;
            }
        }
        // Only check identifier nodes
        if (!typescript_1.default.isIdentifier(node)) {
            typescript_1.default.forEachChild(node, visit);
            return;
        }
        const start = nodeStart;
        const name = node.text;
        // Skip 'require' identifier references - we only want to error on require() calls.
        // (Keyword substrings inside strings should never trigger any error.)
        if (name === "require") {
            return;
        }
        // Skip if not an unavailable identifier
        if (!exports.UNAVAILABLE_IDENTIFIERS.has(name)) {
            return;
        }
        // Skip if already reported
        if (seen.has(name)) {
            return;
        }
        const parent = node.parent;
        // Skip property access on RHS (e.g., obj.process)
        if (parent && typescript_1.default.isPropertyAccessExpression(parent) && parent.name === node) {
            return;
        }
        // Skip object literal property keys (e.g., { process: ... })
        if (parent && typescript_1.default.isPropertyAssignment(parent) && parent.name === node) {
            return;
        }
        // Skip shorthand property assignments (e.g., { process } where process is a variable)
        // This is actually a reference, so we don't skip it
        // Skip variable declarations (e.g., const process = ...)
        if (parent && typescript_1.default.isVariableDeclaration(parent) && parent.name === node) {
            return;
        }
        // Skip function declarations (e.g., function process() {})
        if (parent && typescript_1.default.isFunctionDeclaration(parent) && parent.name === node) {
            return;
        }
        // Skip parameter declarations
        if (parent && typescript_1.default.isParameter(parent) && parent.name === node) {
            return;
        }
        // This is a real reference to an unavailable global
        seen.add(name);
        const { line } = parsedSourceFile.getLineAndCharacterOfPosition(start);
        errors.push({
            type: "unavailable_global",
            message: `'${name}' is not available in the sandbox`,
            line: line - lineOffset + 1, // 1-indexed
        });
    }
    visit(parsedSourceFile);
    return errors;
}
// ============================================================================
// Main Analysis Function
// ============================================================================
/**
 * Analyze JavaScript code before execution.
 *
 * Performs:
 * 1. Syntax validation via QuickJS parser
 * 2. Forbidden construct + unavailable global detection via TypeScript AST (require(), import(), process, window, etc.)
 * 3. TypeScript type validation (if muxTypes provided)
 *
 * @param code - JavaScript code to analyze
 * @param muxTypes - Optional .d.ts content for type validation
 * @returns Analysis result with errors
 */
async function analyzeCode(code, muxTypes) {
    const errors = [];
    // 1. Syntax validation
    const syntaxError = await validateSyntax(code);
    if (syntaxError) {
        errors.push(syntaxError);
        // If syntax is invalid, skip other checks (they'd give false positives)
        return { valid: false, errors };
    }
    let typeResult;
    if (muxTypes) {
        typeResult = (0, typeValidator_1.validateTypes)(code, muxTypes);
    }
    // 2. Forbidden construct + unavailable global detection (process, window, require(), import(), etc.)
    errors.push(...detectUnavailableGlobals(code, typeResult?.sourceFile));
    // 3. TypeScript type validation (if muxTypes provided)
    if (typeResult) {
        for (const typeError of typeResult.errors) {
            errors.push({
                type: "type_error",
                message: typeError.message,
                line: typeError.line,
                column: typeError.column,
            });
        }
    }
    return { valid: errors.length === 0, errors };
}
/**
 * Clean up the cached validation context.
 * Call this when shutting down to free resources.
 *
 * TODO: Wire into app/workspace shutdown to free QuickJS context (Phase 6)
 */
function disposeAnalysisContext() {
    if (cachedContext) {
        cachedContext.dispose();
        cachedContext = null;
    }
}
//# sourceMappingURL=staticAnalysis.js.map