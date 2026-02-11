
import fs from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');

// Determine source directories
const STATIC_DIR = path.join(PROJECT_ROOT, 'static');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');

// Ensure dist exists
fs.mkdirSync(DIST_DIR, { recursive: true });

// 1. Copy splash.html
const splashSrc = path.join(STATIC_DIR, 'splash.html');
const splashDest = path.join(DIST_DIR, 'splash.html');
if (fs.existsSync(splashSrc)) {
    console.log(`Copying ${splashSrc} -> ${splashDest}`);
    fs.copyFileSync(splashSrc, splashDest);
} else {
    console.warn(`Warning: ${splashSrc} not found`);
}

// 2. Copy public/* to dist/
if (fs.existsSync(PUBLIC_DIR)) {
    console.log(`Copying ${PUBLIC_DIR} -> ${DIST_DIR}`);
    fs.cpSync(PUBLIC_DIR, DIST_DIR, { recursive: true });
}

// 3. Copy TypeScript libs (simulating make build-static)
// Original: cp node_modules/typescript/lib/lib.es*.d.ts dist/typescript-lib/
const TS_LIB_DIR = path.join(PROJECT_ROOT, 'node_modules', 'typescript', 'lib');
const DIST_TS_LIB_DIR = path.join(DIST_DIR, 'typescript-lib');

fs.mkdirSync(DIST_TS_LIB_DIR, { recursive: true });

if (fs.existsSync(TS_LIB_DIR)) {
    const files = fs.readdirSync(TS_LIB_DIR);
    // Filter for lib.es*.d.ts
    // Original loop: es5, es2015..es2023
    const patterns = [
        /^lib\.es5\.d\.ts$/,
        /^lib\.es20\d\d.*\.d\.ts$/
    ];

    files.forEach(file => {
        if (patterns.some(p => p.test(file))) {
            const src = path.join(TS_LIB_DIR, file);
            // Rename to .d.ts.txt to bypass electron-builder ignore
            const destName = file + '.txt';
            const dest = path.join(DIST_TS_LIB_DIR, destName);
            fs.copyFileSync(src, dest);
            console.log(`Copied lib: ${file}`);
        }
    });
}

console.log('✅ Static assets copied successfully');
