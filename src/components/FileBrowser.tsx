"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FileIcon } from "./FileIcon";
import { formatSize, formatDate, getFileTypeLabel } from "@/lib/format";

interface FileEntry {
  name: string;
  path: string;
  type: "file" | "directory";
  size: number;
  modified: string;
  extension: string;
  children?: FileEntry[];
}

export default function FileBrowser() {
  const [manifest, setManifest] = useState<FileEntry[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    async function loadManifest() {
      try {
        const res = await fetch("/manifest.json");
        if (!res.ok) throw new Error("Failed to load file manifest");
        const data = await res.json();
        setManifest(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    loadManifest();
  }, []);

  // Find current directory entries from manifest
  const currentEntries = useMemo(() => {
    if (!currentPath) return manifest;

    const parts = currentPath.split("/").filter(Boolean);
    let current: FileEntry[] = manifest;

    for (const part of parts) {
      const found = current.find(
        (item) => item.type === "directory" && item.name === part
      );
      if (found && found.children) {
        current = found.children;
      } else {
        return [];
      }
    }
    return current;
  }, [manifest, currentPath]);

  // Filter entries if search query is present
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return currentEntries;
    const q = searchQuery.toLowerCase();

    function collectAllFiles(entries: FileEntry[]): FileEntry[] {
      let results: FileEntry[] = [];
      for (const entry of entries) {
        if (entry.name.toLowerCase().includes(q)) {
          results.push(entry);
        }
        if (entry.children) {
          results = results.concat(collectAllFiles(entry.children));
        }
      }
      return results;
    }

    return collectAllFiles(manifest);
  }, [currentEntries, manifest, searchQuery]);

  const handleNavigate = (entry: FileEntry) => {
    if (entry.type === "directory") {
      setCurrentPath(entry.path);
      setSearchQuery("");
    } else if (entry.extension === ".ipynb") {
      router.push(`/notebook?path=${encodeURIComponent(entry.path)}`);
    }
  };

  const handleDownload = (e: React.MouseEvent, entry: FileEntry) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = `/api/download?path=${encodeURIComponent(entry.path)}`;
    link.download = entry.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGoUp = () => {
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    setCurrentPath(parts.join("/"));
  };

  const handleBreadcrumb = (index: number) => {
    const parts = currentPath.split("/").filter(Boolean);
    const newPath = parts.slice(0, index + 1).join("/");
    setCurrentPath(newPath);
    setSearchQuery("");
  };

  const toggleSelect = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const pathParts = currentPath.split("/").filter(Boolean);

  return (
    <div className="jupyter-file-browser min-h-screen bg-white">
      {/* Jupyter-style header */}
      <div className="border-b border-[#e0e0e0] bg-white">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Jupyter logo & title */}
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 44 52" fill="none">
              <ellipse cx="22" cy="26" rx="20" ry="24" fill="none" stroke="#F37726" strokeWidth="3"/>
              <circle cx="22" cy="10" r="4" fill="#F37726"/>
              <circle cx="10" cy="38" r="3.5" fill="#989898"/>
              <circle cx="34" cy="38" r="3.5" fill="#616161"/>
            </svg>
            <span className="text-lg font-semibold text-[#333]">Jupyter</span>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs px-3 py-1.5 pl-8 border border-[#ccc] rounded-sm focus:outline-none focus:border-[#F37726] w-64"
              />
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="absolute left-2.5 top-2 text-[#999]"
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="toolbar-btn"
              title="Refresh"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.65 2.35A7.95 7.95 0 0 0 8 0C3.58 0 0 3.58 0 8s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 8 14 6 6 0 1 1 8 2c1.66 0 3.14.69 4.22 1.78L9 7h7V0l-2.35 2.35z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center px-4 py-1.5 text-sm border-t border-[#f0f0f0] bg-[#fafafa]">
          <button
            onClick={() => {
              setCurrentPath("");
              setSearchQuery("");
            }}
            className="text-[#2196F3] hover:text-[#1976D2] hover:underline font-medium"
          >
            Files
          </button>
          {pathParts.map((part, i) => (
            <React.Fragment key={i}>
              <span className="mx-1.5 text-[#999]">/</span>
              <button
                onClick={() => handleBreadcrumb(i)}
                className={`hover:underline font-medium ${
                  i === pathParts.length - 1
                    ? "text-[#333]"
                    : "text-[#2196F3] hover:text-[#1976D2]"
                }`}
              >
                {part}
              </button>
            </React.Fragment>
          ))}
          {searchQuery && (
            <span className="ml-2 text-xs text-[#666] bg-[#eee] px-2 py-0.5 rounded">
              Search: &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>
      </div>

      {/* File listing */}
      <div className="bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#F37726] border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-[#d9534f]">
            <p className="text-lg font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-16 text-[#999]">
            <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor" className="mx-auto mb-3 opacity-40">
              <path d="M1 3.5C1 2.67 1.67 2 2.5 2H6l1.5 1.5H13.5C14.33 3.5 15 4.17 15 5V12.5C15 13.33 14.33 14 13.5 14H2.5C1.67 14 1 13.33 1 12.5V3.5Z"/>
            </svg>
            <p className="text-sm">No files found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e0e0e0] text-xs text-[#999] uppercase tracking-wider">
                <th className="w-8 py-2 pl-4"></th>
                <th className="text-left py-2 pl-2 font-medium">Name</th>
                <th className="text-left py-2 px-3 font-medium w-36">Last Modified</th>
                <th className="text-right py-2 px-3 font-medium w-20">Size</th>
                <th className="text-left py-2 px-3 font-medium w-24">Type</th>
                <th className="text-center py-2 pr-4 font-medium w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPath && !searchQuery && (
                <tr
                  onClick={handleGoUp}
                  className="border-b border-[#f0f0f0] hover:bg-[#f5f5f5] cursor-pointer transition-colors"
                >
                  <td className="py-2 pl-4"></td>
                  <td className="py-2 pl-2 text-sm text-[#2196F3]">
                    <span className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block">
                        <path
                          d="M1 3.5C1 2.67 1.67 2 2.5 2H6l1.5 1.5H13.5C14.33 3.5 15 4.17 15 5V12.5C15 13.33 14.33 14 13.5 14H2.5C1.67 14 1 13.33 1 12.5V3.5Z"
                          fill="#E8A838"
                          stroke="#D49A30"
                          strokeWidth="0.5"
                        />
                      </svg>
                      ..
                    </span>
                  </td>
                  <td className="py-2 px-3 text-xs text-[#999]"></td>
                  <td className="py-2 px-3 text-xs text-[#999] text-right"></td>
                  <td className="py-2 px-3 text-xs text-[#999]"></td>
                  <td className="py-2 pr-4"></td>
                </tr>
              )}
              {filteredEntries.map((entry) => (
                <tr
                  key={entry.path}
                  onClick={() => handleNavigate(entry)}
                  className={`border-b border-[#f0f0f0] hover:bg-[#f5f5f5] transition-colors ${
                    entry.type === "directory" || entry.extension === ".ipynb"
                      ? "cursor-pointer"
                      : "cursor-default"
                  } ${selectedFiles.has(entry.path) ? "bg-[#e3f2fd]" : ""}`}
                >
                  <td className="py-2 pl-4" onClick={(e) => toggleSelect(e, entry.path)}>
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(entry.path)}
                      onChange={() => {}}
                      className="w-3.5 h-3.5 cursor-pointer accent-[#F37726]"
                    />
                  </td>
                  <td className="py-2 pl-2 text-sm">
                    <span className="flex items-center gap-2">
                      <FileIcon extension={entry.extension} type={entry.type} />
                      <span
                        className={
                          entry.type === "directory" || entry.extension === ".ipynb"
                            ? "text-[#2196F3] hover:underline font-medium"
                            : "text-[#333]"
                        }
                      >
                        {searchQuery ? entry.path : entry.name}
                      </span>
                    </span>
                  </td>
                  <td className="py-2 px-3 text-xs text-[#999]">
                    {formatDate(entry.modified)}
                  </td>
                  <td className="py-2 px-3 text-xs text-[#999] text-right">
                    {entry.type === "directory" ? "—" : formatSize(entry.size)}
                  </td>
                  <td className="py-2 px-3 text-xs text-[#999]">
                    {getFileTypeLabel(entry.extension, entry.type)}
                  </td>
                  <td className="py-2 pr-4 text-center">
                    {entry.type === "file" && (
                      <a
                        href={`/api/download?path=${encodeURIComponent(entry.path)}`}
                        download={entry.name}
                        onClick={(e) => handleDownload(e, entry)}
                        className="inline-flex items-center gap-1 text-xs text-[#666] hover:text-[#F37726] transition-colors px-2 py-1 rounded hover:bg-[#fff3e0]"
                        title={`Download ${entry.name}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 12L3 7h3V1h4v6h3L8 12zM1 14h14v2H1v-2z"/>
                        </svg>
                        Download
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#e0e0e0] bg-[#fafafa] px-4 py-2 text-xs text-[#999] flex items-center justify-between">
        <span>
          {filteredEntries.length} item{filteredEntries.length !== 1 ? "s" : ""}
          {selectedFiles.size > 0 && ` · ${selectedFiles.size} selected`}
        </span>
        <span className="text-[#666]">
          Jupyter Notebook File Explorer
        </span>
      </div>
    </div>
  );
}
