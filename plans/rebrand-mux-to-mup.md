# Mux to Mup Rebranding Plan

This plan outlines the steps to rebrand the codebase from "Mux" to "Mup".

## 1. Project Ecosystem & Metadata

### Root Project
- [ ] Update `package.json`:
    - `name`: "mup"
    - `description`: "mup - coder multiplexer"
    - `bin`: `{"mup": "dist/cli/index.js"}`
    - `build.productName`: "mup"
    - `build.appId`: "com.mup.app"
    - `build.protocols.name`: "Mup"
    - `build.protocols.schemes`: ["mup"]
    - **Remove `repository` field entirely.**

### VS Code Extension (`vscode/`)
- [ ] Update `vscode/package.json`:
    - `name`: "mup"
    - `displayName`: "mup"
    - `description`: "Open mup workspaces directly from VS Code"
    - `contributes.commands`: Rename `mux.*` to `mup.*` (e.g., `mup.openWorkspace`)
    - `contributes.viewsContainers`: `id: "mupSecondary"`, `title: "mup"`
    - `contributes.views`: `id: "mup.chatView"`
    - `contributes.configuration`: `title: "mup"`, properties `mup.connectionMode`, `mup.serverUrl`
    - **Remove `repository` field entirely.**
- [ ] Update `vscode/README.md` and `vscode/CHANGELOG.md`.

## 2. Build System & Scripts

- [ ] Update `Makefile`:
    - Rename target `mux:` to `mup:`
    - Rename variables `MUX_VITE_HOST` -> `MUP_VITE_HOST`, `MUX_ROOT` -> `MUP_ROOT`
- [ ] Update `scripts/` folder:
    - Scan all scripts for `mux` references and update to `mup`.
    - Rename `scripts/check_eager_imports.sh` (if it contains specific mux checks).

## 3. Global Search & Replace Strategy

### Rules
- **Case-Sensitive Replacement:**
    - `Mux` -> `Mup`
    - `mux` -> `mup`
    - `MUX` -> `MUP`
- **Exclusions (False Positives):**
    - `mutex` (found in `src/node/utils/concurrency/`)
    - `tmux` (check context)
    - `demux`
    - `linux`
    - `redux`

### Scope
- `src/` (Recursive)
- `vscode/` (Recursive)
- `tests/` (Recursive)
- `static/`
- `scripts/`

## 4. File System Renaming

### Directories
- [ ] `.mux` -> `.mup` (in documentation and path logic, actual `.mux` folders are user data and won't be renamed on disk by this script, but the code *looking* for them will change).
- [ ] `src/node/constants/muxChat.ts` -> `mupChat.ts` (and similar files)

### Files
- [ ] `mux.config.ts` -> `mup.config.ts` (if exists)
- [ ] `vscode/src/muxConfig.ts` -> `vscode/src/mupConfig.ts`
- [ ] `vscode/media/muxChatView.js` -> `vscode/media/mupChatView.js`
- [ ] `vscode/media/muxChatView.css` -> `vscode/media/mupChatView.css`

## 5. Configuration & Constants

- [ ] `src/constants/appAttribution.ts`:
    - `MUX_APP_ATTRIBUTION_TITLE = "mup"`
    - `MUX_APP_ATTRIBUTION_URL = "https://mup.coder.com"`
- [ ] `src/common/constants/paths.ts`:
    - Update default paths (e.g., `~/.mup`)
- [ ] Remove all GitHub URL references:
    - `vscode/README.md`: Remove/replace `https://github.com/coder/mux`
    - `README.md`: Remove/replace `https://github.com/coder/mux`
    - `src/cli/index.ts`: Remove/replace `https://github.com/coder/mux/releases`
    - `src/node/builtinSkills/mux-docs.md`: Remove GitHub link.
    - `src/node/services/tools/web_fetch.ts`: Remove GitHub URL from User-Agent.

## 6. DevOps & CI/CD

- [ ] **Delete `.github/` directory** entirely (workflows, actions, etc.).
- [ ] Update `Dockerfile` (if applicable) to remove any GitHub cloning/downloading steps if they exist.

## 7. Verification

- [ ] Run `make build` to ensure no build errors.
- [ ] Run `make test` to ensure no regressions.
- [ ] Verify VS Code extension builds and activates.
