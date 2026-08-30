"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Brush,
} from "recharts";
import { EquityPoint } from "@/lib/stats";
import { formatCurrency } from "@/lib/format";

export default function EquityCurveChart({
  data,
  currency,
}: {
  data: EquityPoint[];
  currency: string;
}) {
  const [showTarget, setShowTarget] = useState(true);
  const [brushKey, setBrushKey] = useState(0);

  const domain = useMemo(() => {
    const values = data.flatMap((d) => [d.balance, showTarget ? d.target : d.balance]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min) * 0.08 || 1;
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [data, showTarget]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-zinc-200">Equity Curve</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTarget((v) => !v)}
            className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
              showTarget
                ? "border-emerald-700 bg-emerald-500/10 text-emerald-400"
                : "border-zinc-700 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            Trading Objective Lines
          </button>
          <button
            onClick={() => setBrushKey((k) => k + 1)}
            className="rounded-md border border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:bg-zinc-800"
          >
            Zoom out
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="tradeIndex"
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={{ stroke: "#3f3f46" }}
            tickLine={false}
          />
          <YAxis
            domain={domain}
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatCurrency(v, currency)}
            width={90}
          />
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(label, payload) =>
              payload?.[0]?.payload?.date === "Start"
                ? "Start"
                : `Trade #${label} · ${payload?.[0]?.payload?.date ?? ""}`
            }
            formatter={(value, name) => [
              formatCurrency(Number(value ?? 0), currency),
              name === "balance" ? "Balance" : "Target",
            ]}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#34d399"
            strokeWidth={2}
            fill="url(#balanceFill)"
          />
          {showTarget && (
            <Line
              type="linear"
              dataKey="target"
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              dot={false}
            />
          )}
          <Brush
            key={brushKey}
            dataKey="tradeIndex"
            height={22}
            stroke="#3f3f46"
            fill="#18181b"
            travellerWidth={8}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
