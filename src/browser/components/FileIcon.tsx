import React, { useMemo } from "react";
import mapping from "@/browser/assets/catppuccin-icons/mapping.json";
import { cn } from "@/common/lib/utils";

// Import all SVGs as URLs
// The keys will be like "@/browser/assets/catppuccin-icons/name.svg"
const iconUrls = import.meta.glob("@/browser/assets/catppuccin-icons/*.svg", {
  eager: true,
  import: "default",
});

// Helper to get URL from relative icon name (e.g., "angular.svg")
export const getCatppuccinIconUrl = (iconName: string): string | undefined => {
  const key = `@/browser/assets/catppuccin-icons/${iconName}`;
  const url = iconUrls[key] as string;

  // Debug logging
  if (!url) {
    console.warn(`[FileIcon] Icon not found: ${iconName}`);
    console.log('[FileIcon] Available keys:', Object.keys(iconUrls).slice(0, 10));
  } else {
    console.log(`[FileIcon] Loaded icon: ${iconName} -> ${url}`);
  }

  return url;
};

// Types from mapping.json
interface IconMapping {
  fileExtensions?: Record<string, string>;
  fileNames?: Record<string, string>;
  languageIds?: Record<string, string>;
  defaultFile?: string;
  defaultFolder?: string;
}

const iconMapping = mapping as IconMapping;

const resolveIconName = (fileName: string): string | undefined => {
  const lowerName = fileName.toLowerCase();

  // 1. Check exact filename (case-insensitive mostly, but mapping has specific keys)
  if (iconMapping.fileNames?.[fileName]) return iconMapping.fileNames[fileName];
  if (iconMapping.fileNames?.[lowerName]) return iconMapping.fileNames[lowerName];

  // 2. Check extensions
  const parts = fileName.split(".");
  if (parts.length > 1) {
    // Try matching all possible extensions from longest to shortest
    // e.g. "foo.test.ts" -> "test.ts", "ts"
    for (let i = 1; i < parts.length; i++) {
      const ext = parts.slice(i).join(".");
      if (iconMapping.fileExtensions?.[ext]) {
        return iconMapping.fileExtensions[ext];
      }
    }
  }

  // 3. Fallback to default file
  return iconMapping.defaultFile;
};

export interface FileIconProps {
  fileName?: string | null;
  filePath?: string | null;
  className?: string;
  style?: React.CSSProperties;
  /**
   * If true, treat as a folder.
   * Currently FileIcon is mostly for files, but we support folder defaults.
   */
  isFolder?: boolean;
}

export const FileIcon: React.FC<FileIconProps> = ({
  fileName,
  filePath,
  className,
  style,
  isFolder,
}) => {
  const targetName = fileName ?? (filePath ? (filePath.split("/").pop() ?? "") : "");

  const iconSrc = useMemo(() => {
    if (isFolder) {
      // TODO: Handle folder open/closed states if needed, for now just default folder
      const folderIcon = iconMapping.defaultFolder;
      return folderIcon ? getCatppuccinIconUrl(folderIcon) : undefined;
    }

    const iconName = resolveIconName(targetName);
    return iconName ? getCatppuccinIconUrl(iconName) : undefined;
  }, [targetName, isFolder]);

  if (!iconSrc) {
    return null;
  }

  return (
    <img
      src={iconSrc}
      alt={targetName}
      className={cn("select-none w-[1em] h-[1em]", className)}
      style={{
        // Ensure it behaves like an icon
        display: "inline-block",
        verticalAlign: "middle",
        ...style,
      }}
    />
  );
};
