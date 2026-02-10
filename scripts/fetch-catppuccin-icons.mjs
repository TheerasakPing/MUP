import fs from "fs";
import path from "path";
import https from "https";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VSIX_URL =
  "https://github.com/catppuccin/vscode-icons/releases/download/v1.26.0/catppuccin-vsc-icons-1.26.0.vsix";
const TEMP_DIR = path.join(__dirname, "../temp_catppuccin_icons");
const VSIX_PATH = path.join(TEMP_DIR, "icons.zip");
const ASSETS_DIR = path.resolve(__dirname, "../src/browser/assets/catppuccin-icons");

// Cleanup and ensure directories
if (fs.existsSync(TEMP_DIR)) {
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
}
fs.mkdirSync(TEMP_DIR);
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

const downloadVsix = () => {
  return new Promise((resolve, reject) => {
    console.log(`Downloading VSIX from ${VSIX_URL}...`);

    const get = (url) => {
      https
        .get(url, (response) => {
          if (response.statusCode === 302 || response.statusCode === 301) {
            const redirectUrl = response.headers.location;
            console.log(`Redirecting to ${redirectUrl}...`);
            get(redirectUrl);
            return;
          }

          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download VSIX: ${response.statusCode}`));
            return;
          }

          const file = fs.createWriteStream(VSIX_PATH);
          response.pipe(file);
          file.on("finish", () => {
            file.close(() => {
              console.log("Download complete.");
              resolve();
            });
          });
        })
        .on("error", (err) => {
          if (fs.existsSync(VSIX_PATH)) fs.unlink(VSIX_PATH, () => {});
          reject(err);
        });
    };

    get(VSIX_URL);
  });
};

const processVsixPython = () => {
  console.log("Processing VSIX using Python...");

  // Python script to read zip, parse theme, and extract only needed icons
  const pythonScript = `
import zipfile
import json
import os
import sys
import shutil

zip_path = sys.argv[1]
assets_dir = sys.argv[2]

print(f"Reading {zip_path}...")

try:
    with zipfile.ZipFile(zip_path, 'r') as z:
        # 1. Find and read theme.json
        # path in zip: extension/dist/mocha/theme.json
        theme_path = 'extension/dist/mocha/theme.json'
        
        try:
            with z.open(theme_path) as f:
                theme_content = json.load(f)
        except KeyError:
            print(f"Error: {theme_path} not found in zip")
            # List files to debug
            # for n in z.namelist():
            #    if 'theme.json' in n: print(n)
            sys.exit(1)

        icon_definitions = theme_content.get('iconDefinitions', {})
        mapping = {
            'fileExtensions': {},
            'fileNames': {},
            'languageIds': {},
            'defaultFile': None,
            'defaultFolder': None
        }
        
        used_icons = set()
        
        def process_def(def_id):
            if not def_id or def_id not in icon_definitions:
                return None
            
            definition = icon_definitions[def_id]
            icon_path = definition.get('iconPath')
            if not icon_path:
                return None
            
            # Resolve relative path from theme.json location
            # theme_path is 'extension/dist/mocha/theme.json'
            # icon_path is like './icons/name.svg'
            
            theme_dir = os.path.dirname(theme_path)
            # Simple join since zip uses /
            if icon_path.startswith('./'):
                rel_path = icon_path[2:]
                source_path = f"{theme_dir}/{rel_path}"
            else:
                source_path = f"{theme_dir}/{icon_path}"
            
            # Extract basename for destination
            icon_filename = os.path.basename(icon_path)
            
            # Check if file exists in zip
            try:
                z.getinfo(source_path)
                
                # Extract to assets_dir
                target_path = os.path.join(assets_dir, icon_filename)
                if icon_filename not in used_icons:
                    with z.open(source_path) as source, open(target_path, 'wb') as target:
                        shutil.copyfileobj(source, target)
                    used_icons.add(icon_filename)
                
                return icon_filename
            except KeyError:
                print(f"Warning: Icon {source_path} not found in zip")
                return None

        # Build Mapping
        if 'fileExtensions' in theme_content:
            for ext, def_id in theme_content['fileExtensions'].items():
                name = process_def(def_id)
                if name: mapping['fileExtensions'][ext] = name

        if 'fileNames' in theme_content:
            for filename_key, def_id in theme_content['fileNames'].items():
                icon_name = process_def(def_id)
                if icon_name: mapping['fileNames'][filename_key] = icon_name

        if 'languageIds' in theme_content:
            for lang, def_id in theme_content['languageIds'].items():
                name = process_def(def_id)
                if name: mapping['languageIds'][lang] = name
        
        if 'file' in theme_content:
            name = process_def(theme_content['file'])
            if name: mapping['defaultFile'] = name
            
        if 'folder' in theme_content:
            name = process_def(theme_content['folder'])
            if name: mapping['defaultFolder'] = name

        # Write mapping.json
        mapping_path = os.path.join(assets_dir, 'mapping.json')
        with open(mapping_path, 'w') as f:
            json.dump(mapping, f, indent=2)
            
        print(f"Extracted {len(used_icons)} icons.")
        print(f"Mapping saved to {mapping_path}")

except Exception as e:
    print(f"Python Error: {e}")
    sys.exit(1)
`;

  const pyScriptPath = path.join(TEMP_DIR, "process_icons.py");
  fs.writeFileSync(pyScriptPath, pythonScript);

  execSync(`python3 "${pyScriptPath}" "${VSIX_PATH}" "${ASSETS_DIR}"`, { stdio: "inherit" });
};

const cleanup = () => {
  console.log("Cleaning up...");
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
};

const main = async () => {
  try {
    await downloadVsix();
    processVsixPython();
    cleanup();
    console.log("Success!");
  } catch (error) {
    console.error("Script failed:", error);
    process.exit(1);
  }
};

main();
