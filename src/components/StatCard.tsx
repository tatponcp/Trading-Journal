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
    <div className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20">
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100",
          tone === "positive" && "via-emerald-500",
          tone === "negative" && "via-red-500",
          tone === "neutral" && "via-zinc-500"
        )}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {label}
        </span>
        {Icon && (
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
              tone === "positive" && "bg-emerald-500/10 text-emerald-400",
              tone === "negative" && "bg-red-500/10 text-red-400",
              tone === "neutral" && "bg-zinc-800 text-zinc-500"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
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
