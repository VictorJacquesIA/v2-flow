"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { LinkCategory } from "@/types";

export async function getLinksByClient(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createLinkAction(formData: FormData) {
  const supabase = await createClient();

  const payload = {
    client_id: formData.get("client_id") as string || null,
    project_id: formData.get("project_id") as string || null,
    title: formData.get("title") as string,
    url: formData.get("url") as string,
    category: (formData.get("category") as LinkCategory) || "outro",
    notes: formData.get("notes") as string || null,
  };

  const { error } = await supabase.from("links").insert([payload]);
  if (error) throw error;
  if (payload.client_id) revalidatePath(`/clientes/${payload.client_id}`);
}

export async function deleteLinkAction(id: string, clientId?: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("links").delete().eq("id", id);
  if (error) throw error;
  if (clientId) revalidatePath(`/clientes/${clientId}`);
}
