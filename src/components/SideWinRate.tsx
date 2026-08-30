import { formatPercent } from "@/lib/format";

export default function SideWinRate({
  longWinRate,
  shortWinRate,
}: {
  longWinRate: number;
  shortWinRate: number;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-200">Win Rate by Side</h3>
      <div className="space-y-4">
        <Row label="Long" pct={longWinRate} color="#34d399" />
        <Row label="Short" pct={shortWinRate} color="#f87171" />
      </div>
    </div>
  );
}

function Row({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="font-medium text-zinc-200">{formatPercent(pct)}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct * 100}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
