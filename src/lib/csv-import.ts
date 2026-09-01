import Papa from "papaparse";
import { NewTrade, TradeSide } from "./types";

const CONTRACT_SIZE = 100; // XAUUSD: 1 lot = 100 oz — matches the manual trade form.

export type TradeField =
  | "trade_date"
  | "symbol"
  | "side"
  | "entry_price"
  | "exit_price"
  | "stop_loss"
  | "take_profit"
  | "lot_size"
  | "pnl"
  | "notes";

export const REQUIRED_FIELDS: TradeField[] = [
  "trade_date",
  "side",
  "entry_price",
  "exit_price",
  "lot_size",
];

export const ALL_FIELDS: { key: TradeField; label: string; required: boolean }[] = [
  { key: "trade_date", label: "Date", required: true },
  { key: "side", label: "Side (long/short)", required: true },
  { key: "entry_price", label: "Entry price", required: true },
  { key: "exit_price", label: "Exit price", required: true },
  { key: "lot_size", label: "Lot size", required: true },
  { key: "stop_loss", label: "Stop loss", required: false },
  { key: "take_profit", label: "Take profit", required: false },
  { key: "pnl", label: "P/L (auto-calculated if omitted)", required: false },
  { key: "symbol", label: "Symbol (defaults to XAUUSD)", required: false },
  { key: "notes", label: "Notes", required: false },
];

const FIELD_ALIASES: Record<TradeField, string[]> = {
  trade_date: ["date", "trade date", "open date", "opendate", "day", "entry date"],
  symbol: ["symbol", "pair", "instrument", "asset", "ticker"],
  side: ["side", "direction", "type", "buy/sell", "position"],
  entry_price: ["entry", "entry price", "open", "open price", "openprice"],
  exit_price: ["exit", "exit price", "close", "close price", "closeprice"],
  stop_loss: ["sl", "stop loss", "stoploss", "stop"],
  take_profit: ["tp", "take profit", "takeprofit", "target"],
  lot_size: ["lot", "lots", "lot size", "volume", "size", "qty", "quantity"],
  pnl: ["pnl", "p/l", "profit", "result", "net", "net profit", "gain"],
  notes: ["notes", "note", "comment", "comments", "remark"],
};

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
}

export function parseCsvFile(file: File): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        resolve({
          headers: result.meta.fields ?? [],
          rows: result.data,
        });
      },
      error: (err: Error) => reject(err),
    });
  });
}

export function guessMapping(headers: string[]): Partial<Record<TradeField, string>> {
  const mapping: Partial<Record<TradeField, string>> = {};
  const normalizedHeaders = headers.map((h) => ({ raw: h, norm: h.trim().toLowerCase() }));

  for (const field of ALL_FIELDS.map((f) => f.key)) {
    const aliases = FIELD_ALIASES[field];
    const match = normalizedHeaders.find((h) => aliases.includes(h.norm));
    if (match) mapping[field] = match.raw;
  }
  return mapping;
}

function parseDateFlexible(value: string): string | null {
  const v = value.trim();
  if (!v) return null;

  // ISO: YYYY-MM-DD
  let m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;

  // D/M/YYYY style dates. Default to day-first (matches this app's own export
  // format); if the first number exceeds 12 it can only be a day, so that's
  // unambiguous either way. If instead the SECOND number exceeds 12, the
  // fields must be swapped (the CSV was month-first, e.g. MM/DD/YYYY).
  m = v.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (m) {
    const first = parseInt(m[1], 10);
    const second = parseInt(m[2], 10);
    const [day, month] = second > 12 ? [second, first] : [first, second];
    return `${m[3]}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const parsed = new Date(v);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return null;
}

function parseSideFlexible(value: string): TradeSide | null {
  const v = value.trim().toLowerCase();
  if (["long", "buy", "b", "l"].includes(v)) return "long";
  if (["short", "sell", "s"].includes(v)) return "short";
  return null;
}

function parseNum(value: string | undefined): number | null {
  if (value === undefined || value === null || value.trim() === "") return null;
  const cleaned = value.replace(/[,$\s]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

export interface RowResult {
  index: number;
  trade: NewTrade | null;
  errors: string[];
}

export function buildTrades(
  rows: Record<string, string>[],
  mapping: Partial<Record<TradeField, string>>
): RowResult[] {
  return rows.map((row, index) => {
    const errors: string[] = [];
    const get = (field: TradeField) => {
      const col = mapping[field];
      return col ? row[col] : undefined;
    };

    const trade_date = parseDateFlexible(get("trade_date") ?? "");
    if (!trade_date) errors.push("Invalid or missing date");

    const side = parseSideFlexible(get("side") ?? "");
    if (!side) errors.push("Side must be long/short (or buy/sell)");

    const entry_price = parseNum(get("entry_price"));
    if (entry_price === null) errors.push("Invalid or missing entry price");

    const exit_price = parseNum(get("exit_price"));
    if (exit_price === null) errors.push("Invalid or missing exit price");

    const lot_size = parseNum(get("lot_size"));
    if (lot_size === null) errors.push("Invalid or missing lot size");

    const stop_loss = parseNum(get("stop_loss"));
    const take_profit = parseNum(get("take_profit"));
    const symbol = (get("symbol") ?? "XAUUSD").trim() || "XAUUSD";
    const notes = (get("notes") ?? "").trim() || null;

    let pnl = parseNum(get("pnl"));
    if (pnl === null && side && entry_price !== null && exit_price !== null && lot_size !== null) {
      const diff = side === "long" ? exit_price - entry_price : entry_price - exit_price;
      pnl = Math.round(diff * lot_size * CONTRACT_SIZE * 100) / 100;
    }

    if (errors.length > 0 || !trade_date || !side || entry_price === null || exit_price === null || lot_size === null) {
      return { index, trade: null, errors };
    }

    return {
      index,
      trade: {
        trade_date,
        symbol,
        side,
        entry_price,
        exit_price,
        stop_loss,
        take_profit,
        lot_size,
        pnl: pnl ?? 0,
        notes,
      },
      errors: [],
    };
  });
}

export function downloadTemplateCsv() {
  const header = "date,side,entry_price,exit_price,stop_loss,take_profit,lot_size,pnl,notes";
  const example = "2026-06-01,long,4592.46,4600.43,4582.31,4609.31,0.20,159.40,Example row - delete me";
  const csv = `${header}\n${example}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "trading-journal-template.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
