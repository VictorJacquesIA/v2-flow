"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { encrypt, decrypt } from "@/lib/crypto";
import type { AccessCategory } from "@/types";

export async function getAccessesByClient(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accesses")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createAccessAction(formData: FormData) {
  const supabase = await createClient();

  const rawPassword = formData.get("password") as string;
  const encryptedPassword = rawPassword ? await encrypt(rawPassword) : null;

  const payload = {
    client_id: formData.get("client_id") as string || null,
    project_id: formData.get("project_id") as string || null,
    title: formData.get("title") as string,
    username: formData.get("username") as string || null,
    password_encrypted: encryptedPassword,
    url: formData.get("url") as string || null,
    category: (formData.get("category") as AccessCategory) || "outro",
    notes: formData.get("notes") as string || null,
  };

  const { error } = await supabase.from("accesses").insert([payload]);
  if (error) throw error;
  if (payload.client_id) revalidatePath(`/clientes/${payload.client_id}`);
}

export async function decryptPasswordAction(encryptedPassword: string): Promise<string> {
  return decrypt(encryptedPassword);
}

export async function deleteAccessAction(id: string, clientId?: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("accesses").delete().eq("id", id);
  if (error) throw error;
  if (clientId) revalidatePath(`/clientes/${clientId}`);
}
