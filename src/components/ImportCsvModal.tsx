"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Upload, Download, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  ALL_FIELDS,
  REQUIRED_FIELDS,
  TradeField,
  ParsedCsv,
  buildTrades,
  downloadTemplateCsv,
  guessMapping,
  parseCsvFile,
  RowResult,
} from "@/lib/csv-import";
import { cn } from "@/lib/format";

type Step = "upload" | "map" | "preview" | "done";

export default function ImportCsvModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [dragOver, setDragOver] = useState(false);
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<Partial<Record<TradeField, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ ok: number; failed: number } | null>(null);

  const results: RowResult[] = useMemo(
    () => (parsed ? buildTrades(parsed.rows, mapping) : []),
    [parsed, mapping]
  );
  const validRows = results.filter((r) => r.trade !== null);
  const invalidRows = results.filter((r) => r.trade === null);

  async function handleFile(file: File) {
    setError(null);
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please choose a .csv file.");
      return;
    }
    try {
      const result = await parseCsvFile(file);
      if (result.rows.length === 0) {
        setError("That CSV has no data rows.");
        return;
      }
      setParsed(result);
      setMapping(guessMapping(result.headers));
      setStep("map");
    } catch {
      setError("Couldn't read that file. Make sure it's a valid CSV.");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const mappingComplete = REQUIRED_FIELDS.every((f) => mapping[f]);

  async function handleImport() {
    setImporting(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in.");

      const toInsert = validRows.map((r) => ({ ...r.trade!, user_id: user.id }));
      let ok = 0;
      let failed = 0;
      const CHUNK = 100;
      for (let i = 0; i < toInsert.length; i += CHUNK) {
        const chunk = toInsert.slice(i, i + CHUNK);
        const { error, count } = await supabase.from("trades").insert(chunk, { count: "exact" });
        if (error) failed += chunk.length;
        else ok += count ?? chunk.length;
      }
      setImportResult({ ok, failed });
      setStep("done");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Import trades from CSV</h3>
            <p className="mt-0.5 text-xs text-zinc-500">
              {step === "upload" && "Step 1 of 3 — choose a file"}
              {step === "map" && "Step 2 of 3 — match your columns"}
              {step === "preview" && "Step 3 of 3 — review and confirm"}
              {step === "done" && "Import complete"}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {step === "upload" && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors",
                  dragOver
                    ? "border-emerald-500 bg-emerald-500/5"
                    : "border-zinc-700 hover:border-zinc-600"
                )}
              >
                <Upload className="h-8 w-8 text-zinc-500" />
                <p className="text-sm text-zinc-300">
                  Drag a .csv file here, or click to browse
                </p>
                <p className="text-xs text-zinc-600">
                  Works with most broker/MT4/MT5 trade exports
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </div>
              {error && (
                <p className="flex items-center gap-1.5 text-xs text-red-400">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {error}
                </p>
              )}
              <button
                type="button"
                onClick={downloadTemplateCsv}
                className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200"
              >
                <Download className="h-3.5 w-3.5" />
                Download a template CSV
              </button>
            </div>
          )}

          {step === "map" && parsed && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500">
                Matched automatically where possible — check each field, especially the required ones.
              </p>
              {ALL_FIELDS.map((f) => (
                <div key={f.key} className="flex items-center gap-3">
                  <label className="w-44 shrink-0 text-xs text-zinc-400">
                    {f.label}
                    {f.required && <span className="text-red-400"> *</span>}
                  </label>
                  <select
                    value={mapping[f.key] ?? ""}
                    onChange={(e) =>
                      setMapping((m) => ({ ...m, [f.key]: e.target.value || undefined }))
                    }
                    className="flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-100"
                  >
                    <option value="">— Not in file —</option>
                    {parsed.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> {validRows.length} ready to import
                </span>
                {invalidRows.length > 0 && (
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle className="h-4 w-4" /> {invalidRows.length} will be skipped
                  </span>
                )}
              </div>
              <div className="max-h-72 overflow-auto rounded-lg border border-zinc-800">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-zinc-900 text-[10px] uppercase tracking-wide text-zinc-500">
                    <tr className="text-left">
                      <th className="px-3 py-2">Row</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Side</th>
                      <th className="px-3 py-2 text-right">Entry</th>
                      <th className="px-3 py-2 text-right">Exit</th>
                      <th className="px-3 py-2 text-right">Lots</th>
                      <th className="px-3 py-2 text-right">P/L</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {results.slice(0, 50).map((r) => (
                      <tr key={r.index} className={r.trade ? "text-zinc-300" : "text-zinc-600"}>
                        <td className="px-3 py-1.5">{r.index + 2}</td>
                        <td className="px-3 py-1.5">{r.trade?.trade_date ?? "—"}</td>
                        <td className="px-3 py-1.5 capitalize">{r.trade?.side ?? "—"}</td>
                        <td className="px-3 py-1.5 text-right">{r.trade?.entry_price ?? "—"}</td>
                        <td className="px-3 py-1.5 text-right">{r.trade?.exit_price ?? "—"}</td>
                        <td className="px-3 py-1.5 text-right">{r.trade?.lot_size ?? "—"}</td>
                        <td className="px-3 py-1.5 text-right">{r.trade?.pnl ?? "—"}</td>
                        <td className="px-3 py-1.5">
                          {r.trade ? (
                            <span className="text-emerald-400">OK</span>
                          ) : (
                            <span title={r.errors.join(", ")} className="text-amber-400">
                              {r.errors[0]}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {results.length > 50 && (
                  <div className="px-3 py-2 text-center text-[11px] text-zinc-600">
                    +{results.length - 50} more rows not shown
                  </div>
                )}
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
          )}

          {step === "done" && importResult && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              <p className="text-sm text-zinc-200">
                Imported <span className="font-semibold text-emerald-400">{importResult.ok}</span>{" "}
                trade{importResult.ok === 1 ? "" : "s"}
                {importResult.failed > 0 && (
                  <> — {importResult.failed} failed to save</>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-4">
          {step === "map" && (
            <button
              onClick={() => setStep("upload")}
              className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          )}
          {step === "preview" && (
            <button
              onClick={() => setStep("map")}
              className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          )}
          {(step === "upload" || step === "done") && <span />}

          {step === "map" && (
            <button
              onClick={() => setStep("preview")}
              disabled={!mappingComplete}
              className="flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Preview <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
          {step === "preview" && (
            <button
              onClick={handleImport}
              disabled={importing || validRows.length === 0}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {importing ? "Importing…" : `Import ${validRows.length} trade${validRows.length === 1 ? "" : "s"}`}
            </button>
          )}
          {step === "done" && (
            <button
              onClick={onClose}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
