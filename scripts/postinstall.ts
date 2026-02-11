
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import os from 'node:os';

// Config
const SCRIPT_DIR = __dirname;
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');
const ELECTRON_PATH = path.join(PROJECT_ROOT, 'node_modules', 'electron');
const NODE_PTY_PATH = path.join(PROJECT_ROOT, 'node_modules', 'node-pty');
const STAMP_DIR = path.join(PROJECT_ROOT, 'node_modules', '.cache', 'mux-native');

// Helper to clean exit
function exit(msg?: string, code = 0) {
    if (msg) console.log(msg);
    process.exit(code);
}

// 1) Skip in headless/benchmark mode
if (process.env.MUX_HEADLESS === '1') {
    exit('🖥️  Headless mode – skipping native rebuild', 0);
}

// 2) Skip if installed as dependency (simple check)
// In Bun, INIT_CWD might not be set the same way, but checking if we are in the project root is good.
// If the current working directory is not the project root, we might be installed as a dep.
// But mostly we care if we are running from within this repo.
// We'll skip this check for now or assume if package.json name matches.

// 3) Skip if Electron or node-pty missing
if (!fs.existsSync(ELECTRON_PATH) || !fs.existsSync(NODE_PTY_PATH)) {
    exit('🌐 Server mode detected or Electron/node-pty missing – skipping native rebuild', 0);
}

// 4) Build cache key
function getVersion(p: string) {
    try {
        const pkg = JSON.parse(fs.readFileSync(path.join(p, 'package.json'), 'utf-8'));
        return pkg.version;
    } catch (e) {
        return 'unknown';
    }
}

const ELECTRON_VERSION = getVersion(ELECTRON_PATH);
const NODE_PTY_VERSION = getVersion(NODE_PTY_PATH);
const PLATFORM = os.platform(); // 'win32', 'darwin', 'linux'
const ARCH = os.arch(); // 'x64', 'arm64'

const stampName = `node-pty-${ELECTRON_VERSION}-${NODE_PTY_VERSION}-${PLATFORM}-${ARCH}.stamp`;
const STAMP_FILE = path.join(STAMP_DIR, stampName);

fs.mkdirSync(STAMP_DIR, { recursive: true });

// 5) Skip if already rebuilt
if (fs.existsSync(STAMP_FILE)) {
    exit(`✅ node-pty already rebuilt for Electron ${ELECTRON_VERSION} on ${PLATFORM}/${ARCH} – skipping`, 0);
}

console.log(`🔧 Rebuilding node-pty for Electron ${ELECTRON_VERSION} on ${PLATFORM}/${ARCH}...`);

// 6) Run rebuild
try {
    // Use bunx or npx. Since we are in bun environment, try bunx first.
    const cmd = `bunx @electron/rebuild -f -m node_modules/node-pty`;
    console.log(`> ${cmd}`);
    execSync(cmd, { stdio: 'inherit', cwd: PROJECT_ROOT });

    // 7) Mark done
    fs.writeFileSync(STAMP_FILE, '');
    console.log(`✅ Native modules rebuilt successfully (cached at ${STAMP_FILE})`);
} catch (error) {
    console.error('⚠️  Failed to rebuild native modules');
    console.error('   Terminal functionality may not work in desktop mode.');
    console.error('   Run "make rebuild-native" manually to fix.');
    process.exit(0); // Exit 0 to not break install, just warn
}
