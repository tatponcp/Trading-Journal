"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import { MonthlyPnl } from "@/lib/stats";
import { formatCurrency } from "@/lib/format";

export default function MonthlyPnlChart({
  data,
  currency,
}: {
  data: MonthlyPnl[];
  currency: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-200">Monthly P/L</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={{ stroke: "#3f3f46" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatCurrency(v, currency)}
            width={70}
          />
          <ReferenceLine y={0} stroke="#3f3f46" />
          <Tooltip
            cursor={{ fill: "#27272a" }}
            formatter={(value) => formatCurrency(Number(value ?? 0), currency)}
            contentStyle={{
              background: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Bar dataKey="pnl" radius={[4, 4, 4, 4]}>
            {data.map((m) => (
              <Cell key={m.month} fill={m.pnl >= 0 ? "#34d399" : "#f87171"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
