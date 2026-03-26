import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

export async function createSession(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("sessions")
    .insert({ user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSession(supabase: Client, sessionId: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*, rejections(*), results(*)")
    .eq("id", sessionId)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserSessions(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*, results(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addRejection(
  supabase: Client,
  sessionId: string,
  content: string,
) {
  const { data, error } = await supabase
    .from("rejections")
    .insert({ session_id: sessionId, content })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addRejections(
  supabase: Client,
  sessionId: string,
  contents: string[],
) {
  const { data, error } = await supabase
    .from("rejections")
    .insert(contents.map((content) => ({ session_id: sessionId, content })))
    .select();

  if (error) throw error;
  return data;
}

export async function getSessionRejections(
  supabase: Client,
  sessionId: string,
) {
  const { data, error } = await supabase
    .from("rejections")
    .select()
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function deleteSession(supabase: Client, sessionId: string) {
  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId);

  if (error) throw error;
}
