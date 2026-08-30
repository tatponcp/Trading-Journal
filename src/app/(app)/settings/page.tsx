import { getSettingsServer } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import SettingsClient from "@/components/SettingsClient";

export default async function SettingsPage() {
  const settings = await getSettingsServer();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-50">Settings</h1>
        <p className="text-sm text-zinc-500">
          Account starting balance, profit target and currency.
        </p>
      </div>
      <SettingsClient settings={settings} configured={isSupabaseConfigured()} />
    </div>
  );
}
