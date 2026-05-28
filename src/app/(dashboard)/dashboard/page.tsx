import { createClient } from "@/lib/supabase/server";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const supabase = await createClient();

  const today = new Date();
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  const [
    { count: activeClients },
    { count: activeProjects },
    { data: lateTasks },
    { data: weekProjects },
    { data: pendingCharges },
    { data: recentClients },
    { data: _recentTasks },
  ] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("projects").select("*", { count: "exact", head: true })
      .not("status", "in", '("entregue","descartada")'),
    supabase.from("tasks").select("id, title, deadline, priority, client_id, project_id")
      .eq("status", "pendente")
      .lt("deadline", today.toISOString().split("T")[0])
      .not("deadline", "is", null)
      .limit(5),
    supabase.from("projects").select("id, name, deadline, client_id, clients(name)")
      .not("status", "in", '("entregue","descartada")')
      .gte("deadline", today.toISOString().split("T")[0])
      .lte("deadline", weekEnd.toISOString().split("T")[0])
      .order("deadline", { ascending: true }),
    supabase.from("charges").select("id, description, value, due_date, status, client_id, clients(name)")
      .in("status", ["pendente", "atrasado"])
      .order("due_date", { ascending: true })
      .limit(5),
    supabase.from("clients").select("id, name, company, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("tasks").select("id, title, priority, status, deadline")
      .neq("status", "concluida")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const pendingTotal = pendingCharges?.reduce((sum, c) => sum + (c.value || 0), 0) ?? 0;
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const { data: monthPaid } = await supabase
    .from("charges")
    .select("value")
    .eq("status", "pago")
    .gte("paid_at", monthStart.toISOString());
  const monthRevenue = monthPaid?.reduce((sum, c) => sum + (c.value || 0), 0) ?? 0;

  const description = `Bem-vindo ao V2 Flow · ${new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}`;

  return (
    <DashboardView
      description={description}
      activeClients={activeClients ?? 0}
      activeProjects={activeProjects ?? 0}
      lateTasks={lateTasks ?? []}
      weekProjects={weekProjects ?? []}
      pendingCharges={pendingCharges ?? []}
      recentClients={recentClients ?? []}
      pendingTotal={pendingTotal}
      monthRevenue={monthRevenue}
    />
  );
}
