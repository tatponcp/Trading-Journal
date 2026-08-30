"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LineChart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function LoginPage() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const supabase = createClient();
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo("Account created. Check your inbox to confirm, then sign in.");
        setMode("sign-in");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="mb-6 flex items-center gap-2">
          <LineChart className="h-6 w-6 text-emerald-400" />
          <span className="text-lg font-semibold text-zinc-50">Trading Journal</span>
        </div>

        {!configured ? (
          <div className="space-y-3 text-sm text-zinc-400">
            <p>
              Supabase isn&rsquo;t configured yet, so the app is running in demo
              mode with sample data — no sign-in required.
            </p>
            <Link
              href="/"
              className="block rounded-md bg-emerald-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-emerald-500"
            >
              Go to dashboard
            </Link>
            <p className="text-xs text-zinc-600">
              See the README for how to connect Supabase and enable real
              accounts.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex gap-1.5">
              {(["sign-in", "sign-up"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-md border px-3 py-1.5 text-xs font-medium ${
                    mode === m
                      ? "border-emerald-600 bg-emerald-500/10 text-emerald-400"
                      : "border-zinc-700 text-zinc-400"
                  }`}
                >
                  {m === "sign-in" ? "Sign in" : "Sign up"}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              {info && <p className="text-xs text-emerald-400">{info}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {loading
                  ? "Please wait…"
                  : mode === "sign-in"
                  ? "Sign in"
                  : "Create account"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
