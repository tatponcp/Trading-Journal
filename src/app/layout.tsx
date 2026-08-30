import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trading Journal",
  description: "XAUUSD trading journal — performance dashboard, calendar and trade log.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans">
        {children}
      </body>
    </html>
  );
}
