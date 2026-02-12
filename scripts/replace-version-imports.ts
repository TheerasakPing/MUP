import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const files = [
  "src/cli/server.ts",
  "src/cli/server.test.ts",
  "src/desktop/main.ts",
  "src/node/orpc/server.ts",
  "src/cli/proxifyOrpc.test.ts",
  "src/cli/index.ts",
  "src/node/config.ts",
  "src/common/utils/runtimeCompatibility.ts",
  "src/node/services/serverService.ts",
  "src/node/services/ptc/typeGenerator.ts",
  "src/node/services/telemetryService.ts",
  "src/node/runtime/runtimeFactory.ts",
  "src/node/runtime/runtimeFactory.test.ts",
  "src/node/services/tools/code_execution.ts",
  "src/common/orpc/schemas/workspace.ts",
  "src/browser/utils/messages/retryEligibility.ts",
  "src/browser/stores/MapStore.test.ts",
  "src/browser/utils/messages/retryEligibility.test.ts",
  "src/browser/hooks/usePersistedState.ts",
  "src/browser/components/ChatInputToasts.test.ts",
  "src/browser/components/AIView.tsx",
  "src/browser/components/TitleBar.tsx",
];

for (const file of files) {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, "utf8");
    // Replace from "version" or from 'version' or from "./version" or from "../version"
    // But be careful not to match other things like "version-check"
    // Most common are from "../version" or from "./version"
    content = content.replace(/from\s+["'](\.\.?\/)version["']/g, 'from "$1version_gen"');
    content = content.replace(/require\(["'](\.\.?\/)version["']\)/g, 'require("$1version_gen")');
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${file}`);
  } else {
    console.warn(`File not found: ${file}`);
  }
}
