"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { EbookGeneration } from "@/types";

export async function getEbookGenerations(): Promise<EbookGeneration[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ebook_generations")
    .select("*")
    .order("created_at", { ascending: false });
  // Retorna vazio se a tabela ainda não foi criada (ex: primeiro deploy antes do SQL)
  if (error) return [];
  return (data ?? []) as EbookGeneration[];
}

export async function deleteEbookGeneration(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("ebook_generations")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ebooks");
}
