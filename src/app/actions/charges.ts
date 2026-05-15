"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ChargeStatus, PaymentMethod } from "@/types";

export async function getCharges() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("charges")
    .select("*, clients(id, name), projects(id, name)")
    .order("due_date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getChargesByClient(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("charges")
    .select("*, projects(id, name)")
    .eq("client_id", clientId)
    .order("due_date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createChargeAction(formData: FormData) {
  const supabase = await createClient();

  const payload = {
    client_id: formData.get("client_id") as string,
    project_id: formData.get("project_id") as string || null,
    description: formData.get("description") as string,
    value: Number(formData.get("value")),
    due_date: formData.get("due_date") as string,
    status: (formData.get("status") as ChargeStatus) || "pendente",
    recurring: formData.get("recurring") === "true",
    payment_method: formData.get("payment_method") as PaymentMethod || null,
    paid_at: formData.get("paid_at") as string || null,
  };

  const { error } = await supabase.from("charges").insert([payload]);
  if (error) throw error;
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

export async function updateChargeAction(id: string, formData: FormData) {
  const supabase = await createClient();

  const status = formData.get("status") as ChargeStatus;
  const payload = {
    client_id: formData.get("client_id") as string,
    project_id: formData.get("project_id") as string || null,
    description: formData.get("description") as string,
    value: Number(formData.get("value")),
    due_date: formData.get("due_date") as string,
    status,
    recurring: formData.get("recurring") === "true",
    payment_method: formData.get("payment_method") as PaymentMethod || null,
    paid_at: status === "pago" ? (formData.get("paid_at") as string || new Date().toISOString()) : null,
  };

  const { error } = await supabase.from("charges").update(payload).eq("id", id);
  if (error) throw error;
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

export async function markChargePaidAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("charges")
    .update({ status: "pago", paid_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

export async function deleteChargeAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("charges").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}
