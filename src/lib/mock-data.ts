import raw from "@/data/mockdata.json";
import { Trade, AccountSettings } from "./types";

const CONTRACT_SIZE = 100; // XAUUSD: 1 lot = 100 oz

interface RawTrade {
  date: string; // DD/MM/YYYY
  direction: "Long" | "Short";
  open: number;
  tp: number;
  sl: number;
  close: number;
  lot: number;
  rr: number;
  win: boolean;
}

function toIsoDate(ddmmyyyy: string): string {
  const [d, m, y] = ddmmyyyy.split("/");
  return `${y}-${m}-${d}`;
}

function buildMockTrades(): Trade[] {
  const trades = (raw as { trades: RawTrade[] }).trades;
  return trades.map((t, i) => {
    const side = t.direction === "Long" ? "long" : "short";
    const priceDiff = side === "long" ? t.close - t.open : t.open - t.close;
    const pnl = Math.round(priceDiff * t.lot * CONTRACT_SIZE * 100) / 100;
    return {
      id: `mock-${i + 1}`,
      trade_date: toIsoDate(t.date),
      symbol: "XAUUSD",
      side,
      entry_price: t.open,
      exit_price: t.close,
      stop_loss: t.sl,
      take_profit: t.tp,
      lot_size: t.lot,
      pnl,
      notes: null,
    };
  });
}

export const MOCK_TRADES: Trade[] = buildMockTrades();

export const MOCK_SETTINGS: AccountSettings = {
  starting_balance: 10000, // demo funded account size
  profit_target: 1650,
  currency: "USD",
};
