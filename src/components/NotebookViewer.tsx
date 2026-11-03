"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface NotebookOutput {
  output_type: string;
  text?: string;
  data?: Record<string, unknown>;
  ename?: string;
  evalue?: string;
  traceback?: string[];
  name?: string;
  execution_count?: number | null;
}

interface NotebookCell {
  cell_type: "code" | "markdown" | "raw";
  source: string;
  execution_count: number | null;
  outputs: NotebookOutput[];
  metadata: Record<string, unknown>;
}

interface Notebook {
  metadata: {
    kernelspec?: {
      display_name?: string;
      language?: string;
      name?: string;
    };
    language_info?: {
      name?: string;
      version?: string;
    };
  };
  nbformat: number;
  nbformat_minor: number;
  cells: NotebookCell[];
}

interface NotebookViewerProps {
  filePath: string;
}

export default function NotebookViewer({ filePath }: NotebookViewerProps) {
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const router = useRouter();
  const hlRef = useRef<typeof import("highlight.js").default | null>(null);
  const markedRef = useRef<typeof import("marked") | null>(null);
  const [renderReady, setRenderReady] = useState(false);

  const fileName = filePath.split("/").pop() || filePath;

  // Load highlight.js and marked dynamically
  useEffect(() => {
    Promise.all([import("highlight.js"), import("marked")]).then(
      ([hlModule, markedModule]) => {
        hlRef.current = hlModule.default;
        markedRef.current = markedModule;
        setRenderReady(true);
      }
    );
  }, []);

  useEffect(() => {
    async function loadNotebook() {
      try {
        const res = await fetch(
          `/api/notebook?path=${encodeURIComponent(filePath)}`
        );
        if (!res.ok) throw new Error("Failed to load notebook");
        const data = await res.json();
        setNotebook(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    loadNotebook();
  }, [filePath]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `/api/download?path=${encodeURIComponent(filePath)}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const highlightCode = (code: string, lang: string = "python"): string => {
    if (!hlRef.current) return escapeHtml(code);
    try {
      const result = hlRef.current.highlight(code, {
        language: lang,
        ignoreIllegals: true,
      });
      return result.value;
    } catch {
      return escapeHtml(code);
    }
  };

  const renderMarkdown = (source: string): string => {
    if (!markedRef.current) return escapeHtml(source);
    try {
      const result = markedRef.current.marked.parse(source, { async: false });
      return typeof result === "string" ? result : escapeHtml(source);
    } catch {
      return escapeHtml(source);
    }
  };

  const renderOutput = (output: NotebookOutput, index: number) => {
    // Stream / stdout / stderr
    if (output.output_type === "stream") {
      const isError = output.name === "stderr";
      return (
        <pre
          key={index}
          className={`text-sm font-mono whitespace-pre-wrap px-3 py-1 ${
            isError ? "text-[#cc0000]" : "text-[#333]"
          }`}
        >
          {output.text || ""}
        </pre>
      );
    }

    // Error
    if (output.output_type === "error") {
      return (
        <div key={index} className="px-3 py-1">
          <pre className="text-sm font-mono whitespace-pre-wrap text-[#cc0000]">
            {output.traceback
              ? output.traceback.join("\n").replace(/\x1b\[[0-9;]*m/g, "")
              : `${output.ename}: ${output.evalue}`}
          </pre>
        </div>
      );
    }

    // execute_result or display_data
    if (
      output.output_type === "execute_result" ||
      output.output_type === "display_data"
    ) {
      const data = output.data;
      if (!data) return null;

      // HTML output
      if (data["text/html"]) {
        return (
          <div
            key={index}
            className="px-3 py-1 notebook-html-output overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: data["text/html"] as string }}
          />
        );
      }

      // Image output (PNG)
      if (data["image/png"]) {
        return (
          <div key={index} className="px-3 py-2">
            <img
              src={`data:image/png;base64,${data["image/png"]}`}
              alt="Output"
              className="max-w-full"
            />
          </div>
        );
      }

      // Image output (JPEG)
      if (data["image/jpeg"]) {
        return (
          <div key={index} className="px-3 py-2">
            <img
              src={`data:image/jpeg;base64,${data["image/jpeg"]}`}
              alt="Output"
              className="max-w-full"
            />
          </div>
        );
      }

      // SVG output
      if (data["image/svg+xml"]) {
        return (
          <div
            key={index}
            className="px-3 py-2"
            dangerouslySetInnerHTML={{ __html: data["image/svg+xml"] as string }}
          />
        );
      }

      // LaTeX output
      if (data["text/latex"]) {
        return (
          <div key={index} className="px-3 py-1 text-sm">
            <code>{data["text/latex"] as string}</code>
          </div>
        );
      }

      // Plain text output
      if (data["text/plain"]) {
        return (
          <pre
            key={index}
            className="text-sm font-mono whitespace-pre-wrap px-3 py-1 text-[#333]"
          >
            {data["text/plain"] as string}
          </pre>
        );
      }
    }

    return null;
  };

  const renderCell = (cell: NotebookCell, index: number) => {
    if (cell.cell_type === "markdown") {
      return (
        <div key={index} className="notebook-cell mb-0">
          <div className="flex">
            {/* Prompt area */}
            <div className="w-[70px] flex-shrink-0 text-right pr-2 py-2 text-xs text-[#999] select-none"></div>
            {/* Content */}
            <div
              className="flex-1 py-2 px-3 notebook-markdown prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(cell.source) }}
            />
          </div>
        </div>
      );
    }

    if (cell.cell_type === "code") {
      const execCount = cell.execution_count;
      const hasOutputs = cell.outputs && cell.outputs.length > 0;

      return (
        <div key={index} className="notebook-cell mb-0">
          {/* Input */}
          <div className="flex">
            <div className="w-[70px] flex-shrink-0 text-right pr-2 py-2 text-xs text-[#2196F3] select-none font-mono">
              In [{execCount !== null ? execCount : " "}]:
            </div>
            <div className="flex-1 border border-[#e0e0e0] bg-[#f7f7f7] rounded-sm overflow-hidden">
              <pre className="text-sm font-mono p-3 m-0 overflow-x-auto">
                <code
                  dangerouslySetInnerHTML={{
                    __html: highlightCode(cell.source),
                  }}
                />
              </pre>
            </div>
          </div>

          {/* Output */}
          {hasOutputs && (
            <div className="flex mt-0">
              <div className="w-[70px] flex-shrink-0 text-right pr-2 py-2 text-xs text-[#cc0000] select-none font-mono">
                {cell.outputs.some(
                  (o) =>
                    o.output_type === "execute_result" &&
                    o.execution_count !== undefined
                )
                  ? `Out[${execCount !== null ? execCount : " "}]:`
                  : ""}
              </div>
              <div className="flex-1 border-l-2 border-transparent">
                {cell.outputs.map((output, oi) => renderOutput(output, oi))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Raw cell
    return (
      <div key={index} className="notebook-cell mb-0">
        <div className="flex">
          <div className="w-[70px] flex-shrink-0"></div>
          <pre className="flex-1 text-sm font-mono whitespace-pre-wrap p-3 bg-[#fafafa] border border-[#e0e0e0]">
            {cell.source}
          </pre>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#F37726] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#666] text-sm">Loading notebook...</p>
        </div>
      </div>
    );
  }

  if (error || !notebook) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center text-[#d9534f]">
          <p className="text-lg font-medium">Error loading notebook</p>
          <p className="text-sm mt-1">{error || "Notebook not found"}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-sm text-[#2196F3] hover:underline"
          >
            ← Back to files
          </button>
        </div>
      </div>
    );
  }

  const kernelName =
    notebook.metadata.kernelspec?.display_name ||
    notebook.metadata.kernelspec?.name ||
    "Python 3";

  const menuItems = [
    {
      label: "File",
      items: [
        { label: "Download as .ipynb", action: handleDownload },
        {
          label: "Back to file browser",
          action: () => router.push("/"),
        },
      ],
    },
    { label: "Edit", items: [{ label: "Read-only view", action: () => {} }] },
    { label: "View", items: [{ label: "Toggle header", action: () => {} }] },
    { label: "Cell", items: [{ label: "View mode only", action: () => {} }] },
    { label: "Kernel", items: [{ label: `${kernelName} (view only)`, action: () => {} }] },
    {
      label: "Help",
      items: [
        { label: "This is a read-only viewer", action: () => {} },
        { label: "Notebooks cannot be executed here", action: () => {} },
      ],
    },
  ];

  return (
    <div className="notebook-viewer min-h-screen bg-white">
      {/* Menu bar */}
      <div className="border-b border-[#e0e0e0] bg-white sticky top-0 z-50">
        <div className="flex items-center px-2 py-1 gap-1">
          {/* Jupyter logo */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1 px-2 py-1 hover:bg-[#f5f5f5] rounded transition-colors"
            title="Back to file browser"
          >
            <svg width="20" height="20" viewBox="0 0 44 52" fill="none">
              <ellipse cx="22" cy="26" rx="20" ry="24" fill="none" stroke="#F37726" strokeWidth="3"/>
              <circle cx="22" cy="10" r="4" fill="#F37726"/>
              <circle cx="10" cy="38" r="3.5" fill="#989898"/>
              <circle cx="34" cy="38" r="3.5" fill="#616161"/>
            </svg>
          </button>

          <span className="text-sm font-medium text-[#333] ml-1">{fileName}</span>
          <span className="text-xs text-[#999] ml-1">(read-only)</span>
        </div>

        {/* Menu items */}
        <div className="flex items-center px-2 border-t border-[#f0f0f0] relative">
          {menuItems.map((menu) => (
            <div key={menu.label} className="relative">
              <button
                onClick={() =>
                  setActiveMenu(activeMenu === menu.label ? null : menu.label)
                }
                onBlur={() => setTimeout(() => setActiveMenu(null), 150)}
                className={`px-3 py-1 text-xs text-[#333] hover:bg-[#e0e0e0] transition-colors ${
                  activeMenu === menu.label ? "bg-[#e0e0e0]" : ""
                }`}
              >
                {menu.label}
              </button>
              {activeMenu === menu.label && (
                <div className="absolute top-full left-0 bg-white border border-[#e0e0e0] shadow-md rounded-sm min-w-[200px] py-1 z-50">
                  {menu.items.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        item.action();
                        setActiveMenu(null);
                      }}
                      className="w-full text-left px-4 py-1.5 text-xs text-[#333] hover:bg-[#f0f0f0] transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center px-2 py-1 gap-1 border-t border-[#f0f0f0]">
          <button
            onClick={handleDownload}
            className="toolbar-btn"
            title="Download notebook"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 12L3 7h3V1h4v6h3L8 12zM1 14h14v2H1v-2z"/>
            </svg>
          </button>
          <div className="h-5 w-px bg-[#e0e0e0] mx-1"></div>
          <button
            onClick={() => router.push("/")}
            className="toolbar-btn"
            title="Back to files"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 3.5C1 2.67 1.67 2 2.5 2H6l1.5 1.5H13.5C14.33 3.5 15 4.17 15 5V12.5C15 13.33 14.33 14 13.5 14H2.5C1.67 14 1 13.33 1 12.5V3.5Z"/>
            </svg>
          </button>
          <div className="flex-1"></div>
          <span className="text-xs text-[#999] px-2 py-1 bg-[#f5f5f5] rounded">
            {kernelName}
          </span>
          <span className="text-xs text-[#999] flex items-center gap-1 ml-2">
            <span className="w-2 h-2 rounded-full bg-[#999]"></span>
            No Kernel
          </span>
        </div>
      </div>

      {/* Notebook cells */}
      <div className="max-w-[1100px] mx-auto py-4">
        {!renderReady ? (
          <div className="text-center py-8 text-[#999] text-sm">
            Loading renderer...
          </div>
        ) : (
          notebook.cells.map((cell, i) => renderCell(cell, i))
        )}
      </div>
    </div>
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
