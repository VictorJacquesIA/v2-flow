"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ServiceType } from "@/types";

export async function getServices() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createServiceAction(formData: FormData) {
  const supabase = await createClient();

  const payload = {
    name: formData.get("name") as string,
    description: formData.get("description") as string || null,
    base_price: formData.get("base_price") ? Number(formData.get("base_price")) : null,
    type: (formData.get("type") as ServiceType) || "unico",
  };

  const { error } = await supabase.from("services").insert([payload]);
  if (error) throw error;
  revalidatePath("/servicos");
}

export async function updateServiceAction(id: string, formData: FormData) {
  const supabase = await createClient();

  const payload = {
    name: formData.get("name") as string,
    description: formData.get("description") as string || null,
    base_price: formData.get("base_price") ? Number(formData.get("base_price")) : null,
    type: formData.get("type") as ServiceType,
  };

  const { error } = await supabase.from("services").update(payload).eq("id", id);
  if (error) throw error;
  revalidatePath("/servicos");
}

export async function deleteServiceAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/servicos");
}
