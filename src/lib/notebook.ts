import fs from "fs";
import { safePath } from "./config";

export interface NotebookCell {
  cell_type: "code" | "markdown" | "raw";
  source: string;
  execution_count: number | null;
  outputs: NotebookOutput[];
  metadata: Record<string, unknown>;
}

export interface NotebookOutput {
  output_type: string;
  text?: string;
  data?: Record<string, unknown>;
  ename?: string;
  evalue?: string;
  traceback?: string[];
  name?: string;
  execution_count?: number | null;
}

export interface Notebook {
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
    [key: string]: unknown;
  };
  nbformat: number;
  nbformat_minor: number;
  cells: NotebookCell[];
}

/**
 * Parse an .ipynb file and return structured notebook data.
 */
export function parseNotebook(relativePath: string): Notebook | null {
  const absPath = safePath(relativePath);
  if (!absPath) return null;

  try {
    const raw = fs.readFileSync(absPath, "utf-8");
    const nb = JSON.parse(raw);

    const cells: NotebookCell[] = (nb.cells || []).map(
      (cell: Record<string, unknown>) => {
        const source = Array.isArray(cell.source)
          ? (cell.source as string[]).join("")
          : (cell.source as string) || "";

        const outputs: NotebookOutput[] = Array.isArray(cell.outputs)
          ? (cell.outputs as Record<string, unknown>[]).map((out) => {
              const text = out.text
                ? Array.isArray(out.text)
                  ? (out.text as string[]).join("")
                  : (out.text as string)
                : undefined;

              // Process data fields (for display_data / execute_result)
              let data: Record<string, unknown> | undefined;
              if (out.data && typeof out.data === "object") {
                data = {};
                for (const [mime, content] of Object.entries(
                  out.data as Record<string, unknown>
                )) {
                  data[mime] = Array.isArray(content)
                    ? (content as string[]).join("")
                    : content;
                }
              }

              return {
                output_type: out.output_type as string,
                text,
                data,
                ename: out.ename as string | undefined,
                evalue: out.evalue as string | undefined,
                traceback: out.traceback as string[] | undefined,
                name: out.name as string | undefined,
                execution_count: out.execution_count as number | null | undefined,
              };
            })
          : [];

        return {
          cell_type: cell.cell_type as "code" | "markdown" | "raw",
          source,
          execution_count: (cell.execution_count as number | null) || null,
          outputs,
          metadata: (cell.metadata as Record<string, unknown>) || {},
        };
      }
    );

    return {
      metadata: nb.metadata || {},
      nbformat: nb.nbformat || 4,
      nbformat_minor: nb.nbformat_minor || 0,
      cells,
    };
  } catch {
    return null;
  }
}
