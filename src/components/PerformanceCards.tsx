import { DashboardStats } from "@/lib/stats";
import { formatCurrency, formatPercent, cn } from "@/lib/format";
import { TrendingDown, Flame, Snowflake, Trophy, Skull } from "lucide-react";

export default function PerformanceCards({
  stats,
  currency,
}: {
  stats: DashboardStats;
  currency: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Max Drawdown
          </span>
          <TrendingDown className="h-4 w-4 text-red-500/70" />
        </div>
        <div className="mt-2 text-2xl font-semibold tabular-nums text-red-400">
          {formatCurrency(-stats.maxDrawdown, currency)}
        </div>
        <div className="mt-1 text-xs text-zinc-500">
          {formatPercent(stats.maxDrawdownPct)} from peak equity
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Current Streak
          </span>
          {stats.currentStreak >= 0 ? (
            <Flame className="h-4 w-4 text-emerald-500/70" />
          ) : (
            <Snowflake className="h-4 w-4 text-red-500/70" />
          )}
        </div>
        <div
          className={cn(
            "mt-2 text-2xl font-semibold tabular-nums",
            stats.currentStreak >= 0 ? "text-emerald-400" : "text-red-400"
          )}
        >
          {stats.currentStreak >= 0 ? "+" : ""}
          {stats.currentStreak}
        </div>
        <div className="mt-1 text-xs text-zinc-500">
          Best {stats.bestWinStreak}W · Worst {Math.abs(stats.worstLossStreak)}L
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Best Trade
          </span>
          <Trophy className="h-4 w-4 text-emerald-500/70" />
        </div>
        <div className="mt-2 text-2xl font-semibold tabular-nums text-emerald-400">
          {stats.bestTrade ? formatCurrency(stats.bestTrade.pnl, currency) : "—"}
        </div>
        <div className="mt-1 text-xs text-zinc-500">
          {stats.bestTrade
            ? `${stats.bestTrade.trade_date} · ${stats.bestTrade.side}`
            : "No trades yet"}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Worst Trade
          </span>
          <Skull className="h-4 w-4 text-red-500/70" />
        </div>
        <div className="mt-2 text-2xl font-semibold tabular-nums text-red-400">
          {stats.worstTrade ? formatCurrency(stats.worstTrade.pnl, currency) : "—"}
        </div>
        <div className="mt-1 text-xs text-zinc-500">
          {stats.worstTrade
            ? `${stats.worstTrade.trade_date} · ${stats.worstTrade.side}`
            : "No trades yet"}
        </div>
      </div>
    </div>
  );
}
