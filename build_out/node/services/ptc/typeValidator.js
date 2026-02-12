"use strict";
/**
 * TypeScript Type Validator for PTC
 *
 * Validates agent-generated JavaScript code against generated type definitions.
 * Catches type errors before execution:
 * - Wrong property names
 * - Missing required arguments
 * - Wrong types for arguments
 * - Calling non-existent tools
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WRAPPER_PREFIX = void 0;
exports.validateTypes = validateTypes;
/* eslint-disable local/no-sync-fs-methods -- TypeScript's CompilerHost API requires synchronous file operations */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const typescript_1 = __importDefault(require("typescript"));
/**
 * In production builds, lib files are copied to dist/typescript-lib/ with .d.ts.txt extension
 * because electron-builder ignores .d.ts files by default (hardcoded, cannot override):
 * https://github.com/electron-userland/electron-builder/issues/5064
 *
 * These constants are computed once at module load time.
 */
const BUNDLED_LIB_DIR = path_1.default.resolve(__dirname, "../../../typescript-lib");
const IS_PRODUCTION = fs_1.default.existsSync(path_1.default.join(BUNDLED_LIB_DIR, "lib.es2023.d.ts.txt"));
const LIB_DIR = IS_PRODUCTION
    ? BUNDLED_LIB_DIR
    : path_1.default.dirname(require.resolve("typescript/lib/lib.d.ts"));
exports.WRAPPER_PREFIX = "function __agent__() {\n";
const MUX_TYPES_FILE = "mux.d.ts";
const ROOT_FILE_NAMES = ["agent.ts", MUX_TYPES_FILE];
// Cache lib and mux type SourceFiles across validations to avoid re-parsing.
const libSourceFileCache = new Map();
const muxSourceFileCache = new Map();
function wrapAgentCode(code) {
    return `${exports.WRAPPER_PREFIX}${code}\n}\n`;
}
const getLibCacheKey = (fileName, languageVersion) => `${languageVersion}:${fileName}`;
function getCachedLibSourceFile(fileName, languageVersion, readFile) {
    const key = getLibCacheKey(fileName, languageVersion);
    const cached = libSourceFileCache.get(key);
    if (cached)
        return cached;
    const contents = readFile();
    if (!contents)
        return undefined;
    const sourceFile = typescript_1.default.createSourceFile(fileName, contents, languageVersion, true);
    libSourceFileCache.set(key, sourceFile);
    return sourceFile;
}
function getCachedMuxSourceFile(muxTypes, languageVersion) {
    const key = `${languageVersion}:${muxTypes}`;
    const cached = muxSourceFileCache.get(key);
    if (cached)
        return cached;
    const sourceFile = typescript_1.default.createSourceFile(MUX_TYPES_FILE, muxTypes, languageVersion, true);
    muxSourceFileCache.set(key, sourceFile);
    return sourceFile;
}
/** Resolve lib file path, accounting for .d.ts rename in production */
const resolveLibPath = (fileName) => {
    const libFileName = path_1.default.basename(fileName);
    const actualName = IS_PRODUCTION ? toProductionLibName(libFileName) : libFileName;
    return path_1.default.join(LIB_DIR, actualName);
};
function createProgramForCode(wrappedCode, muxTypes, compilerOptions) {
    const scriptTarget = compilerOptions.target ?? typescript_1.default.ScriptTarget.ES2020;
    let sourceFile = typescript_1.default.createSourceFile("agent.ts", wrappedCode, scriptTarget, true);
    const muxSourceFile = getCachedMuxSourceFile(muxTypes, scriptTarget);
    const setSourceFile = (newWrappedCode) => {
        sourceFile = typescript_1.default.createSourceFile("agent.ts", newWrappedCode, scriptTarget, true);
    };
    const host = typescript_1.default.createCompilerHost(compilerOptions);
    // Override to read lib files from our bundled directory
    host.getDefaultLibLocation = () => LIB_DIR;
    host.getDefaultLibFileName = (options) => path_1.default.join(LIB_DIR, typescript_1.default.getDefaultLibFileName(options));
    const originalGetSourceFile = host.getSourceFile.bind(host);
    const originalFileExists = host.fileExists.bind(host);
    const originalReadFile = host.readFile.bind(host);
    host.getSourceFile = (fileName, languageVersionOrOptions, onError, shouldCreateNewSourceFile) => {
        // languageVersionOrOptions can be ScriptTarget or CreateSourceFileOptions
        const target = typeof languageVersionOrOptions === "number" ? languageVersionOrOptions : scriptTarget;
        if (fileName === "agent.ts")
            return sourceFile;
        if (fileName === MUX_TYPES_FILE)
            return muxSourceFile;
        const isLibFile = fileName.includes("lib.") && fileName.endsWith(".d.ts");
        if (isLibFile) {
            const cached = getCachedLibSourceFile(fileName, target, () => {
                if (IS_PRODUCTION) {
                    const libPath = resolveLibPath(fileName);
                    return fs_1.default.existsSync(libPath) ? fs_1.default.readFileSync(libPath, "utf-8") : undefined;
                }
                return originalReadFile(fileName) ?? undefined;
            });
            if (cached)
                return cached;
        }
        return originalGetSourceFile(fileName, languageVersionOrOptions, onError, shouldCreateNewSourceFile);
    };
    host.fileExists = (fileName) => {
        if (fileName === "agent.ts" || fileName === MUX_TYPES_FILE)
            return true;
        // In production, check bundled lib directory for lib files
        if (IS_PRODUCTION && fileName.includes("lib.") && fileName.endsWith(".d.ts")) {
            return fs_1.default.existsSync(resolveLibPath(fileName));
        }
        return originalFileExists(fileName);
    };
    host.readFile = (fileName) => {
        if (fileName === MUX_TYPES_FILE)
            return muxTypes;
        // In production, read lib files from bundled directory
        if (IS_PRODUCTION && fileName.includes("lib.") && fileName.endsWith(".d.ts")) {
            const libPath = resolveLibPath(fileName);
            if (fs_1.default.existsSync(libPath)) {
                return fs_1.default.readFileSync(libPath, "utf-8");
            }
        }
        return originalReadFile(fileName);
    };
    const program = typescript_1.default.createProgram(ROOT_FILE_NAMES, compilerOptions, host);
    return { program, host, getSourceFile: () => sourceFile, setSourceFile };
}
/** Convert lib filename for production: lib.X.d.ts → lib.X.d.ts.txt */
function toProductionLibName(fileName) {
    return fileName + ".txt";
}
/**
 * Validate JavaScript code against mux type definitions using TypeScript.
 *
 * @param code - JavaScript code to validate
 * @param muxTypes - Generated `.d.ts` content from generateMuxTypes()
 * @returns Validation result with errors if any
 */
/**
 * Check if a TS2339 diagnostic is for a property WRITE on an empty object literal.
 * Returns true only for patterns like `results.foo = x` where `results` is typed as `{}`.
 * Returns false for reads like `return results.foo` or `fn(results.foo)`.
 */
function isEmptyObjectWriteError(d, sourceFile) {
    if (d.code !== 2339 || d.start === undefined)
        return false;
    const message = typescript_1.default.flattenDiagnosticMessageText(d.messageText, "");
    if (!message.includes("on type '{}'"))
        return false;
    // Find the node at the error position and walk up to find context
    const token = findTokenAtPosition(sourceFile, d.start);
    if (!token)
        return false;
    // Walk up to find PropertyAccessExpression containing this token
    let propAccess;
    let node = token;
    while (node.parent) {
        if (typescript_1.default.isPropertyAccessExpression(node.parent)) {
            propAccess = node.parent;
            break;
        }
        node = node.parent;
    }
    if (!propAccess)
        return false;
    // Check if this PropertyAccessExpression is on the left side of an assignment
    const parent = propAccess.parent;
    if (typescript_1.default.isBinaryExpression(parent) &&
        parent.operatorToken.kind === typescript_1.default.SyntaxKind.EqualsToken &&
        parent.left === propAccess) {
        return true;
    }
    return false;
}
/** Find the innermost token at a position in the source file */
function findTokenAtPosition(sourceFile, position) {
    function find(node) {
        if (position < node.getStart(sourceFile) || position >= node.getEnd()) {
            return undefined;
        }
        // Try to find a more specific child
        const child = typescript_1.default.forEachChild(node, find);
        return child ?? node;
    }
    return find(sourceFile);
}
/** Returns true if the type resolves to a non-tuple never[] (including unions). */
function isNeverArrayType(type, checker) {
    const nonNullable = checker.getNonNullableType(type);
    if (nonNullable.isUnion()) {
        return nonNullable.types.every((member) => isNeverArrayType(member, checker));
    }
    if (checker.isTupleType(nonNullable)) {
        return false;
    }
    if (!checker.isArrayType(nonNullable)) {
        return false;
    }
    const elementType = checker.getIndexTypeOfType(nonNullable, typescript_1.default.IndexKind.Number);
    return elementType !== undefined && (elementType.flags & typescript_1.default.TypeFlags.Never) !== 0;
}
/**
 * Check if an empty array literal is in a position where adding `as any[]` would be invalid.
 * If true, we should NOT add `as any[]`.
 *
 * Note: We only check valid JavaScript patterns here. TypeScript-specific syntax
 * (type annotations, `as` expressions, etc.) cannot reach QuickJS execution, so
 * handling them here would be dead code.
 */
function hasInvalidAssertionContext(node) {
    const parent = node.parent;
    // Skip: `const [] = x` (destructuring pattern - array is on LHS)
    if (typescript_1.default.isArrayBindingPattern(parent))
        return true;
    // Skip: `([] = foo)` (destructuring assignment - array on LHS of =)
    // Adding `as any[]` here would produce invalid syntax: `([] as any[] = foo)`
    if (typescript_1.default.isBinaryExpression(parent) &&
        parent.operatorToken.kind === typescript_1.default.SyntaxKind.EqualsToken &&
        parent.left === node) {
        return true;
    }
    // Skip: `for ([] of items)` / `for ([] in obj)` (array literal as loop LHS)
    // Adding `as any[]` here would produce invalid syntax in the loop header.
    if ((typescript_1.default.isForOfStatement(parent) || typescript_1.default.isForInStatement(parent)) && parent.initializer === node) {
        return true;
    }
    return false;
}
function getNeverArrayLiteralStarts(code, sourceFile, checker) {
    const codeStart = exports.WRAPPER_PREFIX.length;
    const codeEnd = codeStart + code.length;
    const starts = new Set();
    function visit(node) {
        if (typescript_1.default.isArrayLiteralExpression(node) && node.elements.length === 0) {
            const start = node.getStart(sourceFile);
            if (start >= codeStart && node.end <= codeEnd) {
                const contextualType = checker.getContextualType(node);
                const type = contextualType ?? checker.getTypeAtLocation(node);
                if (isNeverArrayType(type, checker)) {
                    starts.add(start - codeStart);
                }
            }
        }
        typescript_1.default.forEachChild(node, visit);
    }
    visit(sourceFile);
    return starts;
}
/**
 * Preprocess agent code to add type assertions to empty array literals.
 *
 * TypeScript infers `[]` as `never[]` when `strictNullChecks: true` and `noImplicitAny: false`.
 * This is documented behavior (GitHub issues #36987, #13140, #50505, #51979).
 * The TypeScript team recommends using type assertions: `[] as any[]`.
 *
 * This function transforms `[]` → `[] as any[]` for untyped empty arrays, enabling
 * all array operations (push, map, forEach, etc.) to work without type errors.
 */
function preprocessEmptyArrays(code, neverArrayStarts) {
    if (neverArrayStarts.size === 0) {
        return code;
    }
    const sourceFile = typescript_1.default.createSourceFile("temp.ts", code, typescript_1.default.ScriptTarget.Latest, true);
    const edits = [];
    function visit(node) {
        if (typescript_1.default.isArrayLiteralExpression(node) && node.elements.length === 0) {
            const start = node.getStart(sourceFile);
            if (neverArrayStarts.has(start) && !hasInvalidAssertionContext(node)) {
                const parent = node.parent;
                // `as` binds looser than unary operators, so wrap to keep the assertion on the literal.
                const needsParens = typescript_1.default.isPropertyAccessExpression(parent) ||
                    typescript_1.default.isPropertyAccessChain(parent) ||
                    typescript_1.default.isElementAccessExpression(parent) ||
                    typescript_1.default.isElementAccessChain(parent) ||
                    (typescript_1.default.isCallExpression(parent) && parent.expression === node) ||
                    (typescript_1.default.isCallChain(parent) && parent.expression === node) ||
                    typescript_1.default.isPrefixUnaryExpression(parent) ||
                    typescript_1.default.isPostfixUnaryExpression(parent) ||
                    typescript_1.default.isTypeOfExpression(parent) ||
                    typescript_1.default.isVoidExpression(parent) ||
                    typescript_1.default.isDeleteExpression(parent) ||
                    typescript_1.default.isAwaitExpression(parent) ||
                    typescript_1.default.isYieldExpression(parent);
                if (needsParens) {
                    edits.push({ pos: node.getStart(sourceFile), text: "(" });
                    edits.push({ pos: node.end, text: " as any[])" });
                }
                else {
                    edits.push({ pos: node.end, text: " as any[]" });
                }
            }
        }
        typescript_1.default.forEachChild(node, visit);
    }
    visit(sourceFile);
    // Apply edits in reverse order to preserve positions
    let result = code;
    for (const edit of edits.sort((a, b) => b.pos - a.pos)) {
        result = result.slice(0, edit.pos) + edit.text + result.slice(edit.pos);
    }
    return result;
}
function validateTypes(code, muxTypes) {
    const compilerOptions = {
        noEmit: true,
        strict: false, // Don't require explicit types on everything
        strictNullChecks: true, // Enable discriminated union narrowing (e.g., `if (!result.success) { result.error }`)
        noImplicitAny: false, // Allow any types
        skipLibCheck: true,
        target: typescript_1.default.ScriptTarget.ES2020,
        module: typescript_1.default.ModuleKind.ESNext,
        // ES2023 needed for Array.at(), findLast(), toSorted(), Object.hasOwn(), String.replaceAll()
        // QuickJS 0.31+ supports these features at runtime
        lib: ["lib.es2023.d.ts"],
    };
    // Preprocess empty arrays to avoid never[] inference without overriding contextual typing.
    const originalWrappedCode = wrapAgentCode(code);
    const { program: originalProgram, host, getSourceFile, setSourceFile, } = createProgramForCode(originalWrappedCode, muxTypes, compilerOptions);
    const originalSourceFile = getSourceFile();
    const neverArrayStarts = getNeverArrayLiteralStarts(code, originalSourceFile, originalProgram.getTypeChecker());
    const preprocessedCode = preprocessEmptyArrays(code, neverArrayStarts);
    // Wrap code in function to allow return statements (matches runtime behavior)
    // Note: We don't use async because Asyncify makes mux.* calls appear synchronous
    // Types live in a separate virtual file so error line numbers match agent code directly.
    const wrappedCode = wrapAgentCode(preprocessedCode);
    let program = originalProgram;
    if (wrappedCode !== originalWrappedCode) {
        setSourceFile(wrappedCode);
        program = typescript_1.default.createProgram(ROOT_FILE_NAMES, compilerOptions, host, originalProgram);
    }
    const sourceFile = program.getSourceFile("agent.ts") ?? getSourceFile();
    const diagnostics = typescript_1.default.getPreEmitDiagnostics(program);
    // Filter to errors in our code only (not lib files)
    // Also filter console redeclaration warning (our minimal console conflicts with lib.dom)
    const errors = diagnostics
        .filter((d) => d.category === typescript_1.default.DiagnosticCategory.Error)
        .filter((d) => !d.file || d.file.fileName === "agent.ts")
        .filter((d) => !typescript_1.default.flattenDiagnosticMessageText(d.messageText, "").includes("console"))
        // Allow dynamic property WRITES on empty object literals - Claude frequently uses
        // `const results = {}; results.foo = mux.file_read(...)` to collate parallel reads.
        // Only suppress when the property access is on the LEFT side of an assignment.
        // Reads like `return results.typo` must still error.
        .filter((d) => !isEmptyObjectWriteError(d, sourceFile))
        .map((d) => {
        const message = typescript_1.default.flattenDiagnosticMessageText(d.messageText, " ");
        // Extract line number if available
        if (d.file && d.start !== undefined) {
            const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
            // TS line is 0-indexed. Wrapper adds 1 line before agent code, so:
            // TS line 0 = wrapper, TS line 1 = agent line 1, TS line 2 = agent line 2, etc.
            // This means TS 0-indexed line number equals agent 1-indexed line number.
            // Only report if within agent code bounds (filter out wrapper and muxTypes)
            const agentCodeLines = code.split("\n").length;
            if (line >= 1 && line <= agentCodeLines) {
                return { message, line, column: character + 1 };
            }
        }
        return { message };
    });
    return { valid: errors.length === 0, errors, sourceFile: originalSourceFile };
}
//# sourceMappingURL=typeValidator.js.map