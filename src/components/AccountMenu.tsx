"use client";

import { useRouter } from "next/navigation";
import { LogOut, UserCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AccountMenu({
  email,
  configured,
}: {
  email: string | null;
  configured: boolean;
}) {
  const router = useRouter();

  if (!configured) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <UserCircle2 className="h-5 w-5" />
        Demo user
      </div>
    );
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 text-sm text-zinc-300">
      <span className="hidden sm:inline text-zinc-400">{email}</span>
      <button
        onClick={signOut}
        className="flex items-center gap-1.5 rounded-md border border-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-900"
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign out
      </button>
    </div>
  );
}
