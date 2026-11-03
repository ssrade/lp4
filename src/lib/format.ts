/**
 * Format a file size in bytes to a human-readable string.
 */
export function formatSize(bytes: number): string {
  if (bytes === 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Format an ISO date string to a relative or absolute date string.
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Get a human-readable file type label from extension.
 */
export function getFileTypeLabel(extension: string, type: "file" | "directory"): string {
  if (type === "directory") return "Folder";

  const typeMap: Record<string, string> = {
    ".ipynb": "Notebook",
    ".py": "Python",
    ".js": "JavaScript",
    ".ts": "TypeScript",
    ".jsx": "React JSX",
    ".tsx": "React TSX",
    ".json": "JSON",
    ".csv": "CSV",
    ".txt": "Text",
    ".md": "Markdown",
    ".html": "HTML",
    ".css": "CSS",
    ".xml": "XML",
    ".yaml": "YAML",
    ".yml": "YAML",
    ".pdf": "PDF",
    ".png": "PNG Image",
    ".jpg": "JPEG Image",
    ".jpeg": "JPEG Image",
    ".gif": "GIF Image",
    ".svg": "SVG Image",
    ".webp": "WebP Image",
    ".zip": "ZIP Archive",
    ".rar": "RAR Archive",
    ".7z": "7z Archive",
    ".tar": "TAR Archive",
    ".gz": "GZip Archive",
    ".doc": "Word Doc",
    ".docx": "Word Doc",
    ".xls": "Excel",
    ".xlsx": "Excel",
    ".ppt": "PowerPoint",
    ".pptx": "PowerPoint",
    ".mp3": "Audio",
    ".wav": "Audio",
    ".mp4": "Video",
    ".webm": "Video",
  };

  return typeMap[extension.toLowerCase()] || extension.replace(".", "").toUpperCase() || "File";
}
