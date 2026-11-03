import path from "path";

export function getResourcesDir(): string {
  return path.join(process.cwd(), "public", "resources");
}

export function safePath(relativePath: string): string | null {
  const decoded = decodeURIComponent(relativePath);
  const resolved = path.resolve(getResourcesDir(), decoded);
  const root = getResourcesDir();

  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    return null;
  }

  return resolved;
}
