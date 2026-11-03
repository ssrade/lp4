import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getResourcesDir } from "@/lib/config";

interface NotebookCell {
  cell_type: "code" | "markdown" | "raw";
  source: string;
  execution_count: number | null;
  outputs: any[];
  metadata: Record<string, unknown>;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filePath = searchParams.get("path");

  if (!filePath) {
    return NextResponse.json({ error: "Path parameter required" }, { status: 400 });
  }

  // Prevent directory traversal
  const safeName = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, "");
  const absPath = path.join(getResourcesDir(), safeName);

  if (!absPath.startsWith(getResourcesDir())) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const raw = fs.readFileSync(absPath, "utf-8");
    const nb = JSON.parse(raw);

    const cells: NotebookCell[] = (nb.cells || []).map((cell: any) => {
      const source = Array.isArray(cell.source)
        ? cell.source.join("")
        : cell.source || "";

      const outputs = Array.isArray(cell.outputs)
        ? cell.outputs.map((out: any) => {
            const text = out.text
              ? Array.isArray(out.text)
                ? out.text.join("")
                : out.text
              : undefined;

            let data: Record<string, unknown> | undefined;
            if (out.data && typeof out.data === "object") {
              data = {};
              for (const [mime, content] of Object.entries(out.data)) {
                data[mime] = Array.isArray(content)
                  ? content.join("")
                  : content;
              }
            }

            return {
              output_type: out.output_type,
              text,
              data,
              ename: out.ename,
              evalue: out.evalue,
              traceback: out.traceback,
              name: out.name,
              execution_count: out.execution_count || null,
            };
          })
        : [];

      return {
        cell_type: cell.cell_type,
        source,
        execution_count: cell.execution_count || null,
        outputs,
        metadata: cell.metadata || {},
      };
    });

    return NextResponse.json({
      metadata: nb.metadata || {},
      nbformat: nb.nbformat || 4,
      nbformat_minor: nb.nbformat_minor || 0,
      cells,
    });
  } catch {
    return NextResponse.json(
      { error: "Notebook not found or could not be parsed" },
      { status: 404 }
    );
  }
}
