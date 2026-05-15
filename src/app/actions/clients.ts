"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ClientStatus } from "@/types";

export async function getClients() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getClient(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createClientAction(formData: FormData) {
  const supabase = await createClient();

  const payload = {
    name: formData.get("name") as string,
    company: formData.get("company") as string || null,
    niche: formData.get("niche") as string || null,
    whatsapp: formData.get("whatsapp") as string || null,
    email: formData.get("email") as string || null,
    domain: formData.get("domain") as string || null,
    status: (formData.get("status") as ClientStatus) || "ativo",
    entry_date: formData.get("entry_date") as string || null,
    notes: formData.get("notes") as string || null,
  };

  const { error } = await supabase.from("clients").insert([payload]);
  if (error) throw error;
  revalidatePath("/clientes");
  revalidatePath("/dashboard");
}

export async function updateClientAction(id: string, formData: FormData) {
  const supabase = await createClient();

  const payload = {
    name: formData.get("name") as string,
    company: formData.get("company") as string || null,
    niche: formData.get("niche") as string || null,
    whatsapp: formData.get("whatsapp") as string || null,
    email: formData.get("email") as string || null,
    domain: formData.get("domain") as string || null,
    status: formData.get("status") as ClientStatus,
    entry_date: formData.get("entry_date") as string || null,
    notes: formData.get("notes") as string || null,
  };

  const { error } = await supabase.from("clients").update(payload).eq("id", id);
  if (error) throw error;
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteClientAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/clientes");
  revalidatePath("/dashboard");
}
