import { getTradesServer, getSettingsServer } from "@/lib/data";
import CalendarView from "@/components/CalendarView";

export default async function CalendarPage() {
  const [trades, settings] = await Promise.all([
    getTradesServer(),
    getSettingsServer(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-50">Calendar</h1>
        <p className="text-sm text-zinc-500">
          Daily P/L across every trading day, color-coded by result.
        </p>
      </div>
      <CalendarView trades={trades} currency={settings.currency} />
    </div>
  );
}
