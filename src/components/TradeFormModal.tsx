"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NewTrade, Trade } from "@/lib/types";

const CONTRACT_SIZE = 100;

function emptyForm(): NewTrade {
  return {
    trade_date: new Date().toISOString().slice(0, 10),
    symbol: "XAUUSD",
    side: "long",
    entry_price: 0,
    exit_price: 0,
    stop_loss: null,
    take_profit: null,
    lot_size: 0.1,
    pnl: 0,
    notes: null,
  };
}

export default function TradeFormModal({
  trade,
  onClose,
  onSaved,
}: {
  trade?: Trade;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<NewTrade>(
    trade
      ? {
          trade_date: trade.trade_date,
          symbol: trade.symbol,
          side: trade.side,
          entry_price: trade.entry_price,
          exit_price: trade.exit_price,
          stop_loss: trade.stop_loss,
          take_profit: trade.take_profit,
          lot_size: trade.lot_size,
          pnl: trade.pnl,
          notes: trade.notes,
        }
      : emptyForm()
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pnlTouched, setPnlTouched] = useState(false);

  function suggestedPnl(f: NewTrade) {
    const diff =
      f.side === "long" ? f.exit_price - f.entry_price : f.entry_price - f.exit_price;
    return Math.round(diff * f.lot_size * CONTRACT_SIZE * 100) / 100;
  }

  function update<K extends keyof NewTrade>(key: K, value: NewTrade[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (!pnlTouched && ["side", "entry_price", "exit_price", "lot_size"].includes(key)) {
        next.pnl = suggestedPnl(next);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in.");

      if (trade) {
        const { error } = await supabase
          .from("trades")
          .update({ ...form })
          .eq("id", trade.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("trades")
          .insert([{ ...form, user_id: user.id }]);
        if (error) throw error;
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save trade.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-100">
            {trade ? "Edit trade" : "Add trade"}
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <input
                type="date"
                required
                value={form.trade_date}
                onChange={(e) => update("trade_date", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Symbol">
              <input
                type="text"
                required
                value={form.symbol}
                onChange={(e) => update("symbol", e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <Field label="Side">
            <div className="flex gap-2">
              {(["long", "short"] as const).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => update("side", s)}
                  className={`flex-1 rounded-md border px-3 py-1.5 text-sm font-medium capitalize ${
                    form.side === s
                      ? "border-emerald-600 bg-emerald-500/10 text-emerald-400"
                      : "border-zinc-700 text-zinc-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Entry price">
              <input
                type="number"
                step="0.01"
                required
                value={form.entry_price}
                onChange={(e) => update("entry_price", parseFloat(e.target.value))}
                className="input"
              />
            </Field>
            <Field label="Exit price">
              <input
                type="number"
                step="0.01"
                required
                value={form.exit_price}
                onChange={(e) => update("exit_price", parseFloat(e.target.value))}
                className="input"
              />
            </Field>
            <Field label="Stop loss">
              <input
                type="number"
                step="0.01"
                value={form.stop_loss ?? ""}
                onChange={(e) =>
                  update("stop_loss", e.target.value ? parseFloat(e.target.value) : null)
                }
                className="input"
              />
            </Field>
            <Field label="Take profit">
              <input
                type="number"
                step="0.01"
                value={form.take_profit ?? ""}
                onChange={(e) =>
                  update("take_profit", e.target.value ? parseFloat(e.target.value) : null)
                }
                className="input"
              />
            </Field>
            <Field label="Lot size">
              <input
                type="number"
                step="0.01"
                required
                value={form.lot_size}
                onChange={(e) => update("lot_size", parseFloat(e.target.value))}
                className="input"
              />
            </Field>
            <Field label="P/L (auto, editable)">
              <input
                type="number"
                step="0.01"
                value={form.pnl}
                onChange={(e) => {
                  setPnlTouched(true);
                  update("pnl", parseFloat(e.target.value));
                }}
                className="input"
              />
            </Field>
          </div>

          <Field label="Notes">
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => update("notes", e.target.value || null)}
              rows={2}
              className="input resize-none"
            />
          </Field>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save trade"}
            </button>
          </div>
        </form>
      </div>
      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid #3f3f46;
          background: #18181b;
          padding: 0.375rem 0.625rem;
          font-size: 0.875rem;
          color: #f4f4f5;
        }
        .input:focus {
          outline: none;
          border-color: #10b981;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}
