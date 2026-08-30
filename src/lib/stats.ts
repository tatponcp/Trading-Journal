import { Trade, AccountSettings } from "./types";

export interface EquityPoint {
  date: string;
  tradeIndex: number;
  balance: number;
  target: number;
}

export interface DailySummaryRow {
  date: string;
  trades: number;
  lots: number;
  result: number;
}

export interface DashboardStats {
  balance: number;
  equity: number;
  unrealizedPnl: number;
  realizedPnl: number;
  winRate: number;
  lossRate: number;
  avgProfit: number;
  avgLoss: number;
  numberOfTrades: number;
  totalLots: number;
  sharpeRatio: number;
  avgRRR: number;
  expectancy: number;
  profitFactor: number;
  longCount: number;
  shortCount: number;
  longPct: number;
  shortPct: number;
  winCount: number;
  lossCount: number;
  progressToTarget: number; // 0..1+ fraction of profit target reached
  remainingToTarget: number;
  maxDrawdown: number; // currency amount
  maxDrawdownPct: number; // fraction of the peak balance at the time
  currentStreak: number; // positive = winning streak, negative = losing streak
  bestWinStreak: number;
  worstLossStreak: number;
  bestTrade: Trade | null;
  worstTrade: Trade | null;
  longWinRate: number;
  shortWinRate: number;
}

function isClosed(t: Trade) {
  return t.exit_price !== null && t.exit_price !== undefined;
}

function plannedRR(t: Trade): number | null {
  if (t.take_profit == null || t.stop_loss == null) return null;
  const risk = Math.abs(t.entry_price - t.stop_loss);
  const reward = Math.abs(t.take_profit - t.entry_price);
  if (risk === 0) return null;
  return reward / risk;
}

export function computeStats(
  trades: Trade[],
  settings: AccountSettings
): DashboardStats {
  const closed = trades.filter(isClosed);
  const realizedPnl = closed.reduce((s, t) => s + t.pnl, 0);
  const balance = settings.starting_balance + realizedPnl;

  const open = trades.filter((t) => !isClosed(t));
  const unrealizedPnl = open.reduce((s, t) => s + t.pnl, 0);
  const equity = balance + unrealizedPnl;

  const wins = closed.filter((t) => t.pnl > 0);
  const losses = closed.filter((t) => t.pnl < 0);
  const numberOfTrades = closed.length;

  const winRate = numberOfTrades ? wins.length / numberOfTrades : 0;
  const lossRate = numberOfTrades ? losses.length / numberOfTrades : 0;

  const avgProfit = wins.length
    ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length
    : 0;
  const avgLoss = losses.length
    ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length)
    : 0;

  const totalLots = closed.reduce((s, t) => s + t.lot_size, 0);

  const rrs = closed.map(plannedRR).filter((v): v is number => v !== null);
  const avgRRR = rrs.length ? rrs.reduce((s, v) => s + v, 0) / rrs.length : 0;

  const grossWin = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0;

  const expectancy = winRate * avgProfit - lossRate * avgLoss;

  // Simplified trade-level Sharpe ratio: mean(pnl) / stdev(pnl), annualized by sqrt(N)
  const mean = numberOfTrades
    ? closed.reduce((s, t) => s + t.pnl, 0) / numberOfTrades
    : 0;
  const variance = numberOfTrades
    ? closed.reduce((s, t) => s + Math.pow(t.pnl - mean, 2), 0) / numberOfTrades
    : 0;
  const stdev = Math.sqrt(variance);
  const sharpeRatio = stdev > 0 ? (mean / stdev) * Math.sqrt(numberOfTrades) : 0;

  const longCount = closed.filter((t) => t.side === "long").length;
  const shortCount = closed.filter((t) => t.side === "short").length;
  const longPct = numberOfTrades ? longCount / numberOfTrades : 0;
  const shortPct = numberOfTrades ? shortCount / numberOfTrades : 0;

  const progressToTarget =
    settings.profit_target > 0 ? realizedPnl / settings.profit_target : 0;
  const remainingToTarget = settings.profit_target - realizedPnl;

  // Chronological order matters for drawdown and streaks.
  const chronological = closed
    .slice()
    .sort((a, b) => a.trade_date.localeCompare(b.trade_date));

  let running = settings.starting_balance;
  let peak = settings.starting_balance;
  let maxDrawdown = 0;
  let maxDrawdownPct = 0;
  for (const t of chronological) {
    running += t.pnl;
    if (running > peak) peak = running;
    const dd = peak - running;
    if (dd > maxDrawdown) {
      maxDrawdown = dd;
      maxDrawdownPct = peak > 0 ? dd / peak : 0;
    }
  }

  let currentStreak = 0;
  let bestWinStreak = 0;
  let worstLossStreak = 0;
  let streakRun = 0;
  for (const t of chronological) {
    if (t.pnl > 0) {
      streakRun = streakRun > 0 ? streakRun + 1 : 1;
    } else if (t.pnl < 0) {
      streakRun = streakRun < 0 ? streakRun - 1 : -1;
    } else {
      streakRun = 0;
    }
    bestWinStreak = Math.max(bestWinStreak, streakRun);
    worstLossStreak = Math.min(worstLossStreak, streakRun);
  }
  currentStreak = streakRun;

  const bestTrade =
    closed.length > 0
      ? closed.reduce((a, b) => (b.pnl > a.pnl ? b : a))
      : null;
  const worstTrade =
    closed.length > 0
      ? closed.reduce((a, b) => (b.pnl < a.pnl ? b : a))
      : null;

  const longTrades = closed.filter((t) => t.side === "long");
  const shortTrades = closed.filter((t) => t.side === "short");
  const longWinRate = longTrades.length
    ? longTrades.filter((t) => t.pnl > 0).length / longTrades.length
    : 0;
  const shortWinRate = shortTrades.length
    ? shortTrades.filter((t) => t.pnl > 0).length / shortTrades.length
    : 0;

  return {
    balance,
    equity,
    unrealizedPnl,
    realizedPnl,
    winRate,
    lossRate,
    avgProfit,
    avgLoss,
    numberOfTrades,
    totalLots,
    sharpeRatio,
    avgRRR,
    expectancy,
    profitFactor,
    longCount,
    shortCount,
    longPct,
    shortPct,
    winCount: wins.length,
    lossCount: losses.length,
    progressToTarget,
    remainingToTarget,
    maxDrawdown,
    maxDrawdownPct,
    currentStreak,
    bestWinStreak,
    worstLossStreak,
    bestTrade,
    worstTrade,
    longWinRate,
    shortWinRate,
  };
}

export function buildEquityCurve(
  trades: Trade[],
  settings: AccountSettings
): EquityPoint[] {
  const closed = trades
    .filter(isClosed)
    .slice()
    .sort((a, b) => a.trade_date.localeCompare(b.trade_date));

  let running = settings.starting_balance;
  const target = settings.starting_balance + settings.profit_target;

  const points: EquityPoint[] = [
    { date: "Start", tradeIndex: 0, balance: running, target },
  ];

  closed.forEach((t, i) => {
    running += t.pnl;
    points.push({
      date: t.trade_date,
      tradeIndex: i + 1,
      balance: Math.round(running * 100) / 100,
      target,
    });
  });

  return points;
}

export function buildDailySummary(trades: Trade[]): DailySummaryRow[] {
  const closed = trades.filter(isClosed);
  const byDate = new Map<string, DailySummaryRow>();
  for (const t of closed) {
    const row = byDate.get(t.trade_date) ?? {
      date: t.trade_date,
      trades: 0,
      lots: 0,
      result: 0,
    };
    row.trades += 1;
    row.lots += t.lot_size;
    row.result += t.pnl;
    byDate.set(t.trade_date, row);
  }
  return Array.from(byDate.values()).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

export interface RRBucket {
  label: string;
  count: number;
}

export function buildRRDistribution(trades: Trade[]): RRBucket[] {
  const rrs = trades
    .filter(isClosed)
    .map(plannedRR)
    .filter((v): v is number => v !== null);

  const buckets: RRBucket[] = [
    { label: "<1.2", count: 0 },
    { label: "1.2–1.4", count: 0 },
    { label: "1.4–1.6", count: 0 },
    { label: "1.6–1.8", count: 0 },
    { label: "≥1.8", count: 0 },
  ];
  for (const rr of rrs) {
    if (rr < 1.2) buckets[0].count++;
    else if (rr < 1.4) buckets[1].count++;
    else if (rr < 1.6) buckets[2].count++;
    else if (rr < 1.8) buckets[3].count++;
    else buckets[4].count++;
  }
  return buckets;
}

export interface MonthlyPnl {
  month: string; // e.g. 2026-06
  label: string; // e.g. Jun 2026
  pnl: number;
  tradingDays: number;
  winDays: number;
}

export function buildMonthlyPnl(trades: Trade[]): MonthlyPnl[] {
  const closed = trades.filter(isClosed);
  const byMonth = new Map<string, { pnl: number; days: Map<string, number> }>();
  for (const t of closed) {
    const month = t.trade_date.slice(0, 7);
    const entry = byMonth.get(month) ?? { pnl: 0, days: new Map() };
    entry.pnl += t.pnl;
    entry.days.set(t.trade_date, (entry.days.get(t.trade_date) ?? 0) + t.pnl);
    byMonth.set(month, entry);
  }
  return Array.from(byMonth.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, v]) => {
      const label = new Date(`${month}-01T00:00:00`).toLocaleDateString(
        "en-US",
        { month: "short", year: "numeric" }
      );
      const winDays = Array.from(v.days.values()).filter((p) => p > 0).length;
      return {
        month,
        label,
        pnl: Math.round(v.pnl * 100) / 100,
        tradingDays: v.days.size,
        winDays,
      };
    });
}

export function dailyPnlMap(trades: Trade[]): Map<string, number> {
  const closed = trades.filter(isClosed);
  const map = new Map<string, number>();
  for (const t of closed) {
    map.set(t.trade_date, (map.get(t.trade_date) ?? 0) + t.pnl);
  }
  return map;
}
