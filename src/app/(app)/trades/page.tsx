import { getTradesServer, getSettingsServer } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import TradesClient from "@/components/TradesClient";

export default async function TradesPage() {
  const [trades, settings] = await Promise.all([
    getTradesServer(),
    getSettingsServer(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-50">Journal</h1>
        <p className="text-sm text-zinc-500">
          Every logged trade — add, edit or remove entries.
        </p>
      </div>
      <TradesClient
        trades={trades}
        currency={settings.currency}
        configured={isSupabaseConfigured()}
      />
    </div>
  );
}
