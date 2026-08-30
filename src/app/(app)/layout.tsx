import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import DemoBanner from "@/components/DemoBanner";
import AccountMenu from "@/components/AccountMenu";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const configured = isSupabaseConfigured();
  let userEmail: string | null = null;

  if (configured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 md:px-8">
          <div className="text-sm text-zinc-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <AccountMenu email={userEmail} configured={configured} />
        </header>
        {!configured && <DemoBanner />}
        <main className="flex-1 px-4 py-6 md:px-8 pb-20 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
