"use server";

import { createClient } from "@/lib/supabase/server";

export type SearchResult = {
  id: string;
  type: "client" | "project" | "task" | "charge" | "service";
  title: string;
  subtitle: string;
  href: string;
};

export async function searchAction(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];
  const supabase = await createClient();
  const q = `%${query.trim()}%`;

  const [
    { data: clients },
    { data: projects },
    { data: tasks },
    { data: charges },
    { data: services },
  ] = await Promise.all([
    supabase.from("clients").select("id, name, company, status").ilike("name", q).limit(4),
    supabase.from("projects").select("id, name, status, clients(name)").ilike("name", q).limit(4),
    supabase.from("tasks").select("id, title, status, priority").ilike("title", q).limit(4),
    supabase.from("charges").select("id, description, status, clients(name)").ilike("description", q).limit(3),
    supabase.from("services").select("id, name, type").ilike("name", q).limit(3),
  ]);

  const results: SearchResult[] = [];

  const statusLabels: Record<string, string> = {
    ativo: "Ativo", lead: "Lead", pausado: "Pausado", inativo: "Inativo",
    pendente: "Pendente", fazendo: "Fazendo", concluida: "Concluída", aguardando: "Aguardando",
    em_desenvolvimento: "Em Dev.", entregue: "Entregue", pago: "Pago", atrasado: "Atrasado",
    proposta_enviada: "Proposta Enviada", fechado: "Fechado",
  };

  clients?.forEach((c) => results.push({
    id: c.id, type: "client",
    title: c.name,
    subtitle: `Cliente • ${statusLabels[c.status] ?? c.status}${c.company ? ` • ${c.company}` : ""}`,
    href: `/clientes/${c.id}`,
  }));

  projects?.forEach((p) => results.push({
    id: p.id, type: "project",
    title: p.name,
    subtitle: `Projeto • ${statusLabels[p.status] ?? p.status}${(p.clients as unknown as { name: string } | null)?.name ? ` • ${(p.clients as unknown as { name: string }).name}` : ""}`,
    href: `/projetos/${p.id}`,
  }));

  tasks?.forEach((t) => results.push({
    id: t.id, type: "task",
    title: t.title,
    subtitle: `Tarefa • ${t.priority} • ${statusLabels[t.status] ?? t.status}`,
    href: `/tarefas`,
  }));

  charges?.forEach((c) => results.push({
    id: c.id, type: "charge",
    title: c.description,
    subtitle: `Cobrança • ${statusLabels[c.status] ?? c.status}${(c.clients as unknown as { name: string } | null)?.name ? ` • ${(c.clients as unknown as { name: string }).name}` : ""}`,
    href: `/financeiro`,
  }));

  services?.forEach((s) => results.push({
    id: s.id, type: "service",
    title: s.name,
    subtitle: `Serviço • ${s.type === "recorrente" ? "Recorrente" : "Único"}`,
    href: `/servicos`,
  }));

  return results;
}
