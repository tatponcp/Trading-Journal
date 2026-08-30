import { cn } from "@/lib/format";
import { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  tone?: "positive" | "negative" | "neutral";
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-zinc-600" />}
      </div>
      <div
        className={cn(
          "mt-2 text-2xl font-semibold tabular-nums",
          tone === "positive" && "text-emerald-400",
          tone === "negative" && "text-red-400",
          tone === "neutral" && "text-zinc-50"
        )}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-zinc-500">{sub}</div>}
    </div>
  );
}
