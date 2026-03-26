import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

export async function saveResult(
  supabase: Client,
  result: {
    session_id: string;
    avoid_pattern: string;
    direction: string;
    first_action: string;
    es_phrase?: string | null;
  },
) {
  const { data, error } = await supabase
    .from("results")
    .insert({
      session_id: result.session_id,
      avoid_pattern: result.avoid_pattern,
      direction: result.direction,
      first_action: result.first_action,
      es_phrase: result.es_phrase,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSessionResult(supabase: Client, sessionId: string) {
  const { data, error } = await supabase
    .from("results")
    .select()
    .eq("session_id", sessionId)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserResults(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("results")
    .select("*, sessions!inner(*)")
    .eq("sessions.user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
