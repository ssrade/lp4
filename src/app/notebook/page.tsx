"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import NotebookViewer from "@/components/NotebookViewer";

function NotebookContent() {
  const searchParams = useSearchParams();
  const filePath = searchParams.get("path");

  if (!filePath) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-[#999]">No notebook path specified</p>
      </div>
    );
  }

  return <NotebookViewer filePath={filePath} />;
}

export default function NotebookPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#F37726] border-t-transparent"></div>
        </div>
      }
    >
      <NotebookContent />
    </Suspense>
  );
}
