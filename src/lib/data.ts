import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { MOCK_TRADES, MOCK_SETTINGS } from "@/lib/mock-data";
import { AccountSettings, Trade } from "@/lib/types";

const DEFAULT_SETTINGS: AccountSettings = {
  starting_balance: 0,
  profit_target: 0,
  currency: "USD",
};

export async function getTradesServer(): Promise<Trade[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_TRADES;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .order("trade_date", { ascending: true });

  if (error || !data) return [];
  return data as Trade[];
}

export async function getSettingsServer(): Promise<AccountSettings> {
  if (!isSupabaseConfigured()) {
    return MOCK_SETTINGS;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return DEFAULT_SETTINGS;

  const { data, error } = await supabase
    .from("account_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return DEFAULT_SETTINGS;
  return data as AccountSettings;
}
