"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { IdeaStage, IdeaPotential, IdeaDifficulty } from "@/types";

export async function getIdeas() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createIdeaAction(formData: FormData) {
  const supabase = await createClient();

  const payload = {
    title: formData.get("title") as string,
    description: formData.get("description") as string || null,
    category: formData.get("category") as string || null,
    potential: (formData.get("potential") as IdeaPotential) || "medio",
    difficulty: (formData.get("difficulty") as IdeaDifficulty) || "medio",
    stage: (formData.get("stage") as IdeaStage) || "ideia",
    monetization: formData.get("monetization") as string || null,
    next_steps: formData.get("next_steps") as string || null,
  };

  const { error } = await supabase.from("ideas").insert([payload]);
  if (error) throw error;
  revalidatePath("/ideias");
}

export async function updateIdeaAction(id: string, formData: FormData) {
  const supabase = await createClient();

  const payload = {
    title: formData.get("title") as string,
    description: formData.get("description") as string || null,
    category: formData.get("category") as string || null,
    potential: formData.get("potential") as IdeaPotential,
    difficulty: formData.get("difficulty") as IdeaDifficulty,
    stage: formData.get("stage") as IdeaStage,
    monetization: formData.get("monetization") as string || null,
    next_steps: formData.get("next_steps") as string || null,
  };

  const { error } = await supabase.from("ideas").update(payload).eq("id", id);
  if (error) throw error;
  revalidatePath("/ideias");
}

export async function deleteIdeaAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("ideas").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/ideias");
}
