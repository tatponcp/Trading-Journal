import { AlertTriangle } from "lucide-react";

export default function DemoBanner() {
  return (
    <div className="flex items-center gap-2 border-b border-amber-900/40 bg-amber-500/10 px-4 py-2 text-xs text-amber-300 md:px-8">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      <span>
        Demo mode — showing sample XAUUSD data. Connect Supabase (see README)
        to sign in and save your real trades.
      </span>
    </div>
  );
}
