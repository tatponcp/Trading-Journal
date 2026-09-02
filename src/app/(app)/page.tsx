import { getTradesServer, getSettingsServer } from "@/lib/data";
import { computeStats, buildEquityCurve, buildDailySummary } from "@/lib/stats";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import StatCard from "@/components/StatCard";
import EquityCurveChart from "@/components/EquityCurveChart";
import StatsPanel from "@/components/StatsPanel";
import DailySummaryTable from "@/components/DailySummaryTable";
import WelcomeEmptyState from "@/components/WelcomeEmptyState";
import UpdateCsvButton from "@/components/UpdateCsvButton";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Wallet, TrendingUp, Activity, Target } from "lucide-react";

export default async function DashboardPage() {
  const [trades, settings] = await Promise.all([
    getTradesServer(),
    getSettingsServer(),
  ]);

  const stats = computeStats(trades, settings);
  const equityCurve = buildEquityCurve(trades, settings);
  const dailySummary = buildDailySummary(trades);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-50">Dashboard</h1>
          <p className="text-sm text-zinc-500">
            {trades[0]?.symbol ?? "XAUUSD"} performance overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <UpdateCsvButton configured={isSupabaseConfigured()} />
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-right">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">
              Progress to target
            </div>
            <div
              className={`text-lg font-semibold tabular-nums ${
                stats.progressToTarget >= 1 ? "text-emerald-400" : "text-zinc-100"
              }`}
            >
              {formatPercent(stats.progressToTarget)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Balance"
          value={formatCurrency(stats.balance, settings.currency)}
          icon={Wallet}
        />
        <StatCard
          label="Equity"
          value={formatCurrency(stats.equity, settings.currency)}
          icon={Activity}
        />
        <StatCard
          label="Unrealized P/L"
          value={formatCurrency(stats.unrealizedPnl, settings.currency)}
          tone={stats.unrealizedPnl >= 0 ? "positive" : "negative"}
          icon={TrendingUp}
        />
        <StatCard
          label="Remaining to target"
          value={formatCurrency(stats.remainingToTarget, settings.currency)}
          tone={stats.remainingToTarget <= 0 ? "positive" : "neutral"}
          icon={Target}
        />
      </div>

      {trades.length === 0 ? (
        <WelcomeEmptyState />
      ) : (
        <>
          <EquityCurveChart data={equityCurve} currency={settings.currency} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <StatsPanel stats={stats} currency={settings.currency} />
            <DailySummaryTable rows={dailySummary} currency={settings.currency} />
          </div>
        </>
      )}
    </div>
  );
}
