const fs = require("fs");
const path = require("path");

const RESOURCES_DIR = path.join(__dirname, "../public/resources");
const MANIFEST_PATH = path.join(__dirname, "../public/manifest.json");

function scanDirectory(dir, baseDir = RESOURCES_DIR) {
  let entries = [];
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      if (item.name.startsWith(".")) continue;

      const fullPath = path.join(dir, item.name);
      const relativePath = path.relative(baseDir, fullPath);

      if (item.isDirectory()) {
        const children = scanDirectory(fullPath, baseDir);
        const stat = fs.statSync(fullPath);
        entries.push({
          name: item.name,
          path: relativePath,
          type: "directory",
          size: 0,
          modified: stat.mtime.toISOString(),
          extension: "",
          children,
        });
      } else if (item.isFile()) {
        const stat = fs.statSync(fullPath);
        entries.push({
          name: item.name,
          path: relativePath,
          type: "file",
          size: stat.size,
          modified: stat.mtime.toISOString(),
          extension: path.extname(item.name).toLowerCase(),
        });
      }
    }
  } catch (err) {
    console.error("Error scanning directory:", err);
  }

  // Sort: directories first, then by name
  entries.sort((a, b) => {
    if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });

  return entries;
}

function generateManifest() {
  console.log("Generating file manifest from:", RESOURCES_DIR);
  if (!fs.existsSync(RESOURCES_DIR)) {
    console.log("Resources directory does not exist. Creating it...");
    fs.mkdirSync(RESOURCES_DIR, { recursive: true });
  }

  const manifest = scanDirectory(RESOURCES_DIR);
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`Manifest generated successfully at ${MANIFEST_PATH} with ${manifest.length} top-level items.`);
}

generateManifest();
