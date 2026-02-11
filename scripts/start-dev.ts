
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

// Force node options for memory
process.env.NODE_OPTIONS = "--max-old-space-size=4096";

const APIDir = path.join(__dirname, '..');

// 1. Build Version (Pre-requisite)
console.log('📦 Generating version...');
const genVersion = spawn('bun', ['scripts/generate-version.ts'], { stdio: 'inherit', cwd: APIDir, shell: true });

genVersion.on('close', (code) => {
    if (code !== 0) {
        console.error(`Version generation failed with code ${code}`);
        process.exit(code || 1);
    }

    console.log('🚀 Starting dev servers...');

    // 2. Concurrently
    // Use bun x concurrently for better cross-platform support
    // We spawn 'bun' with args ['x', 'concurrently', ...]
    const cmd = 'bun';
    const cmdArgs = ['x', 'concurrently', '-k', '--raw'];

    // Arguments for concurrently commands
    // We pass them as strings to concurrently
    const args = [
        // 1. Nodemon for Main Process (Backend)
        `"bun x nodemon --watch src --watch tsconfig.main.json --watch tsconfig.json --ext ts,tsx,json --ignore dist --ignore node_modules --exec node scripts/build-main-watch.js"`,

        // 2. ESBuild for CLI API
        `"bun x esbuild src/cli/api.ts --bundle --format=esm --platform=node --target=node20 --outfile=dist/cli/api.mjs --external:zod --external:commander --external:jsonc-parser --external:@trpc/server --external:ssh2 --external:cpu-features --banner:js=\\"import{createRequire}from'module';globalThis.require=createRequire(import.meta.url);\\" --watch"`,

        // 3. Vite (Renderer)
        `"bun x vite"`
    ];

    const finalArgs = [...cmdArgs, ...args];

    const devProc = spawn(cmd, finalArgs, {
        stdio: 'inherit',
        cwd: APIDir,
        shell: true,
        env: { ...process.env }
    });

    devProc.on('close', (code) => {
        process.exit(code || 0);
    });
});
