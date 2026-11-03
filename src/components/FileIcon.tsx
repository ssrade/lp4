"use client";

import React from "react";

// File type icon component using inline SVGs for a Jupyter-like feel
export function FileIcon({
  extension,
  type,
}: {
  extension: string;
  type: "file" | "directory";
}) {
  if (type === "directory") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block">
        <path
          d="M1 3.5C1 2.67 1.67 2 2.5 2H6l1.5 1.5H13.5C14.33 3.5 15 4.17 15 5V12.5C15 13.33 14.33 14 13.5 14H2.5C1.67 14 1 13.33 1 12.5V3.5Z"
          fill="#E8A838"
          stroke="#D49A30"
          strokeWidth="0.5"
        />
      </svg>
    );
  }

  const ext = extension.toLowerCase();

  // Notebook icon
  if (ext === ".ipynb") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block">
        <rect x="2" y="1" width="12" height="14" rx="1.5" fill="#F37726" stroke="#E06620" strokeWidth="0.5" />
        <rect x="4" y="3" width="8" height="1.5" rx="0.5" fill="white" opacity="0.9" />
        <rect x="4" y="5.5" width="8" height="1.5" rx="0.5" fill="white" opacity="0.7" />
        <rect x="4" y="8" width="5" height="1.5" rx="0.5" fill="white" opacity="0.5" />
        <circle cx="8" cy="12" r="1.5" fill="white" opacity="0.9" />
      </svg>
    );
  }

  // Python file
  if (ext === ".py") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block">
        <rect x="2" y="1" width="12" height="14" rx="1.5" fill="#3776AB" stroke="#2E6693" strokeWidth="0.5" />
        <text x="8" y="11" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="monospace">
          Py
        </text>
      </svg>
    );
  }

  // CSV / spreadsheet
  if (ext === ".csv" || ext === ".xlsx" || ext === ".xls") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block">
        <rect x="2" y="1" width="12" height="14" rx="1.5" fill="#217346" stroke="#1A5C38" strokeWidth="0.5" />
        <rect x="4" y="4" width="8" height="1" fill="white" opacity="0.8" />
        <rect x="4" y="6" width="8" height="1" fill="white" opacity="0.6" />
        <rect x="4" y="8" width="8" height="1" fill="white" opacity="0.5" />
        <rect x="4" y="10" width="8" height="1" fill="white" opacity="0.4" />
        <line x1="7" y1="3.5" x2="7" y2="11.5" stroke="white" strokeWidth="0.5" opacity="0.5" />
        <line x1="10" y1="3.5" x2="10" y2="11.5" stroke="white" strokeWidth="0.5" opacity="0.5" />
      </svg>
    );
  }

  // PDF
  if (ext === ".pdf") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block">
        <rect x="2" y="1" width="12" height="14" rx="1.5" fill="#E53935" stroke="#C62828" strokeWidth="0.5" />
        <text x="8" y="10.5" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" fontFamily="sans-serif">
          PDF
        </text>
      </svg>
    );
  }

  // Image files
  if ([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico"].includes(ext)) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block">
        <rect x="2" y="1" width="12" height="14" rx="1.5" fill="#4CAF50" stroke="#388E3C" strokeWidth="0.5" />
        <circle cx="6" cy="5.5" r="1.5" fill="white" opacity="0.8" />
        <path d="M3 11L6 7.5L8.5 10L10 8.5L13 12H3V11Z" fill="white" opacity="0.7" />
      </svg>
    );
  }

  // Archive files
  if ([".zip", ".rar", ".7z", ".tar", ".gz", ".tgz"].includes(ext)) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block">
        <rect x="2" y="1" width="12" height="14" rx="1.5" fill="#795548" stroke="#5D4037" strokeWidth="0.5" />
        <rect x="6.5" y="3" width="3" height="1.5" rx="0.3" fill="white" opacity="0.7" />
        <rect x="6.5" y="5.5" width="3" height="1.5" rx="0.3" fill="white" opacity="0.6" />
        <rect x="6.5" y="8" width="3" height="1.5" rx="0.3" fill="white" opacity="0.5" />
        <rect x="7" y="10.5" width="2" height="2" rx="0.5" fill="#FFD54F" stroke="#FFC107" strokeWidth="0.3" />
      </svg>
    );
  }

  // Text / markdown
  if ([".txt", ".md", ".rst", ".log"].includes(ext)) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block">
        <rect x="2" y="1" width="12" height="14" rx="1.5" fill="#607D8B" stroke="#455A64" strokeWidth="0.5" />
        <rect x="4" y="4" width="8" height="0.8" fill="white" opacity="0.7" />
        <rect x="4" y="6" width="6" height="0.8" fill="white" opacity="0.6" />
        <rect x="4" y="8" width="7" height="0.8" fill="white" opacity="0.5" />
        <rect x="4" y="10" width="5" height="0.8" fill="white" opacity="0.4" />
      </svg>
    );
  }

  // Code files
  if ([".js", ".ts", ".jsx", ".tsx", ".html", ".css", ".json", ".xml", ".yaml", ".yml"].includes(ext)) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block">
        <rect x="2" y="1" width="12" height="14" rx="1.5" fill="#1565C0" stroke="#0D47A1" strokeWidth="0.5" />
        <text x="8" y="10.5" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" fontFamily="monospace">
          {"</>"}
        </text>
      </svg>
    );
  }

  // Word documents
  if ([".doc", ".docx"].includes(ext)) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block">
        <rect x="2" y="1" width="12" height="14" rx="1.5" fill="#1565C0" stroke="#0D47A1" strokeWidth="0.5" />
        <text x="8" y="10.5" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" fontFamily="sans-serif">
          W
        </text>
      </svg>
    );
  }

  // Generic file icon
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block">
      <path
        d="M3 1.5C3 1.22 3.22 1 3.5 1H10L13 4V14.5C13 14.78 12.78 15 12.5 15H3.5C3.22 15 3 14.78 3 14.5V1.5Z"
        fill="#90A4AE"
        stroke="#78909C"
        strokeWidth="0.5"
      />
      <path d="M10 1V4H13" fill="#B0BEC5" stroke="#78909C" strokeWidth="0.5" />
    </svg>
  );
}
