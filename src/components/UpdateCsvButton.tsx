"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";
import ImportCsvModal from "./ImportCsvModal";

export default function UpdateCsvButton({ configured }: { configured: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={!configured}
        title={!configured ? "Connect Supabase to update trades" : undefined}
        className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <UploadCloud className="h-4 w-4" />
        Update from CSV
      </button>
      {open && <ImportCsvModal onClose={() => setOpen(false)} />}
    </>
  );
}
