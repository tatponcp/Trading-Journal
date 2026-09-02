export type TradeSide = "long" | "short";

export interface Trade {
  id: string;
  user_id?: string;
  trade_date: string; // ISO date, e.g. 2026-06-01
  symbol: string;
  side: TradeSide;
  entry_price: number;
  exit_price: number;
  stop_loss: number | null;
  take_profit: number | null;
  lot_size: number;
  pnl: number;
  notes: string | null;
  broker_ticket?: string | null;
  created_at?: string;
}

export interface AccountSettings {
  user_id?: string;
  starting_balance: number;
  profit_target: number;
  currency: string;
  updated_at?: string;
}

export type NewTrade = Omit<Trade, "id" | "user_id" | "created_at">;
