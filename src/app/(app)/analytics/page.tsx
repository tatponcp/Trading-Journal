import { getTradesServer, getSettingsServer } from "@/lib/data";
import {
  computeStats,
  buildRRDistribution,
  buildMonthlyPnl,
} from "@/lib/stats";
import PerformanceCards from "@/components/PerformanceCards";
import RRDistributionChart from "@/components/RRDistributionChart";
import MonthlyPnlChart from "@/components/MonthlyPnlChart";
import LongShortPie from "@/components/LongShortPie";
import SideWinRate from "@/components/SideWinRate";

export default async function AnalyticsPage() {
  const [trades, settings] = await Promise.all([
    getTradesServer(),
    getSettingsServer(),
  ]);

  const stats = computeStats(trades, settings);
  const rrBuckets = buildRRDistribution(trades);
  const monthly = buildMonthlyPnl(trades);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-50">Analytics</h1>
        <p className="text-sm text-zinc-500">
          Deeper performance analysis — drawdown, streaks, and breakdowns by
          side, month, and risk/reward.
        </p>
      </div>

      <PerformanceCards stats={stats} currency={settings.currency} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MonthlyPnlChart data={monthly} currency={settings.currency} />
        <RRDistributionChart buckets={rrBuckets} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LongShortPie longCount={stats.longCount} shortCount={stats.shortCount} />
        <SideWinRate longWinRate={stats.longWinRate} shortWinRate={stats.shortWinRate} />
      </div>
    </div>
  );
}
