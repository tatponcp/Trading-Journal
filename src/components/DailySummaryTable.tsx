import { DailySummaryRow } from "@/lib/stats";
import { formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/format";

export default function DailySummaryTable({
  rows,
  currency,
}: {
  rows: DailySummaryRow[];
  currency: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-200">Daily Summary</h3>
      <div className="max-h-80 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-zinc-900 text-[11px] uppercase tracking-wide text-zinc-500">
            <tr className="text-left">
              <th className="pb-2 px-2 font-medium">Date</th>
              <th className="pb-2 px-2 font-medium text-right">Trades</th>
              <th className="pb-2 px-2 font-medium text-right">Lots</th>
              <th className="pb-2 px-2 font-medium text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {rows.map((r) => (
              <tr
                key={r.date}
                className="text-zinc-300 transition-colors hover:bg-zinc-800/40"
              >
                <td className="py-2 px-2 first:rounded-l-md">{r.date}</td>
                <td className="py-2 px-2 text-right tabular-nums">{r.trades}</td>
                <td className="py-2 px-2 text-right tabular-nums">
                  {formatNumber(r.lots)}
                </td>
                <td
                  className={cn(
                    "py-2 px-2 text-right font-medium tabular-nums last:rounded-r-md",
                    r.result >= 0 ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {formatCurrency(r.result, currency)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-zinc-600">
                  No trades yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
