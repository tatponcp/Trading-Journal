"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Trade } from "@/lib/types";
import { dailyPnlMap, buildMonthlyPnl } from "@/lib/stats";
import { buildCalendarGrid, WEEKDAY_LABELS } from "@/lib/calendar";
import { cn, formatCurrency, formatPercent } from "@/lib/format";

export default function CalendarView({
  trades,
  currency,
}: {
  trades: Trade[];
  currency: string;
}) {
  const today = new Date();
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const pnlMap = useMemo(() => dailyPnlMap(trades), [trades]);
  const monthly = useMemo(() => buildMonthlyPnl(trades), [trades]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthStats = monthly.find((m) => m.month === monthKey);

  const cells = useMemo(() => buildCalendarGrid(year, month), [year, month]);

  const maxAbs = useMemo(() => {
    let max = 1;
    for (const c of cells) {
      const v = pnlMap.get(c.iso);
      if (v !== undefined) max = Math.max(max, Math.abs(v));
    }
    return max;
  }, [cells, pnlMap]);

  function cellStyle(iso: string) {
    const v = pnlMap.get(iso);
    if (v === undefined) return {};
    const intensity = Math.min(1, Math.abs(v) / maxAbs);
    const alpha = 0.15 + intensity * 0.55;
    return {
      backgroundColor:
        v >= 0 ? `rgba(52, 211, 153, ${alpha})` : `rgba(248, 113, 113, ${alpha})`,
    };
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200">
            {cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="rounded-md border border-zinc-700 p-1.5 text-zinc-400 hover:bg-zinc-800"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="rounded-md border border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:bg-zinc-800"
            >
              Today
            </button>
            <button
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="rounded-md border border-zinc-700 p-1.5 text-zinc-400 hover:bg-zinc-800"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] uppercase tracking-wide text-zinc-500">
          {WEEKDAY_LABELS.map((w) => (
            <div key={w} className="pb-1">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((c) => {
            const v = pnlMap.get(c.iso);
            return (
              <div
                key={c.iso}
                style={cellStyle(c.iso)}
                className={cn(
                  "flex h-16 flex-col justify-between rounded-md border border-zinc-800/60 p-1.5 text-xs sm:h-20",
                  !c.inMonth && "opacity-30"
                )}
              >
                <span className="text-[11px] text-zinc-400">{c.date.getDate()}</span>
                {v !== undefined && (
                  <span
                    className={cn(
                      "text-right text-[11px] font-semibold tabular-nums",
                      v >= 0 ? "text-emerald-300" : "text-red-300"
                    )}
                  >
                    {formatCurrency(v, currency)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h3 className="mb-3 text-sm font-semibold text-zinc-200">Monthly stats</h3>
        <dl className="space-y-3 text-sm">
          <Row label="Net P/L">
            <span
              className={cn(
                "font-semibold tabular-nums",
                (monthStats?.pnl ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"
              )}
            >
              {formatCurrency(monthStats?.pnl ?? 0, currency)}
            </span>
          </Row>
          <Row label="Trading days">
            <span className="font-semibold text-zinc-100">
              {monthStats?.tradingDays ?? 0}
            </span>
          </Row>
          <Row label="Winning days">
            <span className="font-semibold text-zinc-100">
              {monthStats?.winDays ?? 0} / {monthStats?.tradingDays ?? 0}
            </span>
          </Row>
          <Row label="Win-day rate">
            <span className="font-semibold text-zinc-100">
              {formatPercent(
                monthStats && monthStats.tradingDays
                  ? monthStats.winDays / monthStats.tradingDays
                  : 0
              )}
            </span>
          </Row>
        </dl>

        <div className="mt-5 border-t border-zinc-800 pt-3">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            History
          </h4>
          <div className="space-y-1.5">
            {monthly
              .slice()
              .reverse()
              .map((m) => (
                <button
                  key={m.month}
                  onClick={() => {
                    const [y, mo] = m.month.split("-").map(Number);
                    setCursor(new Date(y, mo - 1, 1));
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-zinc-800",
                    m.month === monthKey && "bg-zinc-800"
                  )}
                >
                  <span className="text-zinc-400">{m.label}</span>
                  <span
                    className={cn(
                      "font-medium tabular-nums",
                      m.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {formatCurrency(m.pnl, currency)}
                  </span>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-zinc-500">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
