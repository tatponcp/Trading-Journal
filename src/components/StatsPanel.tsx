import { DashboardStats } from "@/lib/stats";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

export default function StatsPanel({
  stats,
  currency,
}: {
  stats: DashboardStats;
  currency: string;
}) {
  const rows: { label: string; value: string; tone?: "positive" | "negative" }[] = [
    { label: "Win rate", value: formatPercent(stats.winRate) },
    {
      label: "Average profit",
      value: formatCurrency(stats.avgProfit, currency),
      tone: "positive",
    },
    {
      label: "Average loss",
      value: formatCurrency(-stats.avgLoss, currency),
      tone: "negative",
    },
    { label: "Number of trades", value: `${stats.numberOfTrades}` },
    { label: "Lots", value: formatNumber(stats.totalLots) },
    { label: "Sharpe ratio", value: formatNumber(stats.sharpeRatio) },
    { label: "Average RRR", value: formatNumber(stats.avgRRR) },
    {
      label: "Expectancy",
      value: formatCurrency(stats.expectancy, currency),
      tone: stats.expectancy >= 0 ? "positive" : "negative",
    },
    {
      label: "Profit factor",
      value: Number.isFinite(stats.profitFactor)
        ? formatNumber(stats.profitFactor)
        : "∞",
    },
  ];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-200">Statistics</h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        {rows.map((r) => (
          <div key={r.label}>
            <dt className="text-[11px] uppercase tracking-wide text-zinc-500">
              {r.label}
            </dt>
            <dd
              className={`mt-0.5 text-sm font-semibold tabular-nums ${
                r.tone === "positive"
                  ? "text-emerald-400"
                  : r.tone === "negative"
                  ? "text-red-400"
                  : "text-zinc-100"
              }`}
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 border-t border-zinc-800 pt-3">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Buy / Sell ratio</span>
          <span className="font-medium text-zinc-300">
            {formatPercent(stats.longPct, 0)} Long / {formatPercent(stats.shortPct, 0)} Short
          </span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-emerald-500"
            style={{ width: `${stats.longPct * 100}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
          <span>Win / Loss</span>
          <span className="font-medium text-zinc-300">
            {stats.winCount} / {stats.lossCount}
          </span>
        </div>
      </div>
    </div>
  );
}
