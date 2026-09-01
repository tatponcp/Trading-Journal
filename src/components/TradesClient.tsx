"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Upload, NotebookPen } from "lucide-react";
import { Trade } from "@/lib/types";
import { formatCurrency, formatNumber, cn } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import TradeFormModal from "./TradeFormModal";
import ImportCsvModal from "./ImportCsvModal";

type SideFilter = "all" | "long" | "short";

export default function TradesClient({
  trades,
  currency,
  configured,
}: {
  trades: Trade[];
  currency: string;
  configured: boolean;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Trade | undefined>(undefined);
  const [sideFilter, setSideFilter] = useState<SideFilter>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      trades
        .filter((t) => sideFilter === "all" || t.side === sideFilter)
        .slice()
        .sort((a, b) => b.trade_date.localeCompare(a.trade_date)),
    [trades, sideFilter]
  );

  function openAdd() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function openEdit(t: Trade) {
    setEditing(t);
    setModalOpen(true);
  }

  function handleSaved() {
    setModalOpen(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!configured) return;
    setDeletingId(id);
    const supabase = createClient();
    await supabase.from("trades").delete().eq("id", id);
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {(["all", "long", "short"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setSideFilter(f)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium capitalize",
                sideFilter === f
                  ? "border-emerald-600 bg-emerald-500/10 text-emerald-400"
                  : "border-zinc-700 text-zinc-400 hover:bg-zinc-800"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setImportOpen(true)}
            disabled={!configured}
            title={!configured ? "Connect Supabase to import real trades" : undefined}
            className="flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </button>
          <button
            onClick={openAdd}
            disabled={!configured}
            title={!configured ? "Connect Supabase to add real trades" : undefined}
            className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Add trade
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60">
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wide text-zinc-500">
            <tr className="border-b border-zinc-800 text-left">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Symbol</th>
              <th className="px-4 py-3 font-medium">Side</th>
              <th className="px-4 py-3 font-medium text-right">Entry</th>
              <th className="px-4 py-3 font-medium text-right">Exit</th>
              <th className="px-4 py-3 font-medium text-right">Lots</th>
              <th className="px-4 py-3 font-medium text-right">P/L</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {sorted.map((t) => (
              <tr key={t.id} className="text-zinc-300 transition-colors hover:bg-zinc-800/40">
                <td className="px-4 py-2.5">{t.trade_date}</td>
                <td className="px-4 py-2.5">{t.symbol}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-xs font-medium capitalize",
                      t.side === "long"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    )}
                  >
                    {t.side}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {formatNumber(t.entry_price)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {formatNumber(t.exit_price)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {formatNumber(t.lot_size)}
                </td>
                <td
                  className={cn(
                    "px-4 py-2.5 text-right font-medium tabular-nums",
                    t.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {formatCurrency(t.pnl, currency)}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => openEdit(t)}
                      disabled={!configured}
                      className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={!configured || deletingId === t.id}
                      className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-red-400 disabled:opacity-30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center">
                  {trades.length === 0 ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
                        <NotebookPen className="h-5 w-5 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-300">
                          No trades logged yet
                        </p>
                        <p className="mt-1 text-xs text-zinc-600">
                          Add your first trade manually, or import a CSV to get started fast.
                        </p>
                      </div>
                      {configured && (
                        <div className="mt-1 flex gap-2">
                          <button
                            onClick={() => setImportOpen(true)}
                            className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
                          >
                            Import CSV
                          </button>
                          <button
                            onClick={openAdd}
                            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
                          >
                            Add trade
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-zinc-600">No trades match this filter.</span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <TradeFormModal
          trade={editing}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
      {importOpen && <ImportCsvModal onClose={() => setImportOpen(false)} />}
    </div>
  );
}
