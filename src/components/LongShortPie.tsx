"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function LongShortPie({
  longCount,
  shortCount,
}: {
  longCount: number;
  shortCount: number;
}) {
  const data = [
    { name: "Long", value: longCount, color: "#34d399" },
    { name: "Short", value: shortCount, color: "#f87171" },
  ];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-200">Long / Short</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} stroke="#18181b" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#a1a1aa" }}
            formatter={(value) => <span style={{ color: "#a1a1aa" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
