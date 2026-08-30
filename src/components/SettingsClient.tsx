"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AccountSettings } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export default function SettingsClient({
  settings,
  configured,
}: {
  settings: AccountSettings;
  configured: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in.");

      const { error } = await supabase.from("account_settings").upsert({
        user_id: user.id,
        starting_balance: form.starting_balance,
        profit_target: form.profit_target,
        currency: form.currency,
      });
      if (error) throw error;
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5"
    >
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
          Starting balance
        </label>
        <input
          type="number"
          step="0.01"
          value={form.starting_balance}
          onChange={(e) =>
            setForm({ ...form, starting_balance: parseFloat(e.target.value) })
          }
          disabled={!configured}
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 disabled:opacity-50"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
          Profit target
        </label>
        <input
          type="number"
          step="0.01"
          value={form.profit_target}
          onChange={(e) =>
            setForm({ ...form, profit_target: parseFloat(e.target.value) })
          }
          disabled={!configured}
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 disabled:opacity-50"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
          Currency
        </label>
        <input
          type="text"
          value={form.currency}
          onChange={(e) => setForm({ ...form, currency: e.target.value })}
          disabled={!configured}
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 disabled:opacity-50"
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
      {saved && <p className="text-xs text-emerald-400">Settings saved.</p>}

      <button
        type="submit"
        disabled={!configured || saving}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "Saving…" : "Save settings"}
      </button>
      {!configured && (
        <p className="text-xs text-zinc-500">
          Connect Supabase (see README) to edit and persist these values.
        </p>
      )}
    </form>
  );
}
