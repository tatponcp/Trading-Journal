import Link from "next/link";
import { Upload, Plus, Sparkles } from "lucide-react";

export default function WelcomeEmptyState() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/30 p-8 text-center">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="relative flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
          <Sparkles className="h-5 w-5 text-emerald-400" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-50">
          Your journal is ready — add some trades
        </h2>
        <p className="max-w-md text-sm text-zinc-500">
          Every chart and statistic here updates live from your trade log. Log
          a trade by hand, or import your history from a CSV to see it all
          come to life in seconds.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Link
            href="/trades"
            className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            Add your first trade
          </Link>
          <Link
            href="/trades"
            className="flex items-center gap-1.5 rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            <Upload className="h-4 w-4" />
            Import a CSV
          </Link>
        </div>
      </div>
    </div>
  );
}
