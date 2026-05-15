import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FolderKanban,
  AlertCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency, formatDate, isOverdue } from "@/lib/utils";
import Link from "next/link";

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
    { data: recentTasks },
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

  const stats = [
    {
      title: "Clientes Ativos",
      value: activeClients ?? 0,
      icon: Users,
      href: "/clientes",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Projetos em Andamento",
      value: activeProjects ?? 0,
      icon: FolderKanban,
      href: "/projetos",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      title: "Tarefas Atrasadas",
      value: lateTasks?.length ?? 0,
      icon: AlertCircle,
      href: "/tarefas",
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      title: "Entregas esta Semana",
      value: weekProjects?.length ?? 0,
      icon: Calendar,
      href: "/projetos",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      title: "Cobranças Pendentes",
      value: formatCurrency(pendingTotal),
      icon: DollarSign,
      href: "/financeiro",
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
    {
      title: "Receita do Mês",
      value: formatCurrency(monthRevenue),
      icon: TrendingUp,
      href: "/financeiro",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ];

  const priorityMap: Record<string, { label: string; variant: "destructive" | "warning" | "info" | "secondary" }> = {
    urgente: { label: "Urgente", variant: "destructive" },
    alta: { label: "Alta", variant: "warning" },
    media: { label: "Média", variant: "info" },
    baixa: { label: "Baixa", variant: "secondary" },
  };

  return (
    <div className="flex flex-col">
      <Header
        title="Dashboard"
        description={`Bem-vindo ao V2 Flow · ${new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}`}
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:border-border/80 transition-colors cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                    </div>
                    <div className={`rounded-xl p-2.5 ${stat.bg}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Tarefas Atrasadas */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <CardTitle className="text-sm font-medium">Tarefas Atrasadas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {!lateTasks?.length ? (
                <div className="flex items-center gap-2 py-4 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <p className="text-sm">Nenhuma tarefa atrasada</p>
                </div>
              ) : (
                lateTasks.map((task) => {
                  const p = priorityMap[task.priority] ?? priorityMap.media;
                  return (
                    <Link key={task.id} href="/tarefas">
                      <div className="flex items-center justify-between rounded-lg p-2 hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <Clock className="h-3.5 w-3.5 shrink-0 text-red-400" />
                          <span className="text-sm truncate">{task.title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground">{formatDate(task.deadline)}</span>
                          <Badge variant={p.variant} className="text-xs">{p.label}</Badge>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Cobranças Pendentes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-orange-400" />
                <CardTitle className="text-sm font-medium">Cobranças Pendentes</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {!pendingCharges?.length ? (
                <div className="flex items-center gap-2 py-4 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <p className="text-sm">Nenhuma cobrança pendente</p>
                </div>
              ) : (
                pendingCharges.map((charge) => {
                  const overdue = isOverdue(charge.due_date);
                  return (
                    <Link key={charge.id} href="/financeiro">
                      <div className="flex items-center justify-between rounded-lg p-2 hover:bg-accent/50 transition-colors">
                        <div className="min-w-0">
                          <p className="text-sm truncate">{charge.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {(charge.clients as unknown as { name: string } | null)?.name ?? "—"} · Vence {formatDate(charge.due_date)}
                          </p>
                        </div>
                        <div className="shrink-0 ml-2">
                          <Badge variant={overdue ? "destructive" : "warning"} className="text-xs">
                            {formatCurrency(charge.value)}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Entregas da Semana */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-400" />
                <CardTitle className="text-sm font-medium">Entregas esta Semana</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {!weekProjects?.length ? (
                <p className="text-sm text-muted-foreground py-4">Nenhuma entrega prevista</p>
              ) : (
                weekProjects.map((project) => (
                  <Link key={project.id} href={`/projetos`}>
                    <div className="flex items-center justify-between rounded-lg p-2 hover:bg-accent/50 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(project.clients as unknown as { name: string } | null)?.name ?? "—"}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {formatDate(project.deadline)}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Clientes Recentes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                <CardTitle className="text-sm font-medium">Clientes Recentes</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {!recentClients?.length ? (
                <p className="text-sm text-muted-foreground py-4">Nenhum cliente cadastrado</p>
              ) : (
                recentClients.map((client) => (
                  <Link key={client.id} href={`/clientes/${client.id}`}>
                    <div className="flex items-center justify-between rounded-lg p-2 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-primary">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{client.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{client.company || "—"}</p>
                        </div>
                      </div>
                      <Badge
                        variant={client.status === "ativo" ? "success" : "secondary"}
                        className="text-xs shrink-0"
                      >
                        {client.status}
                      </Badge>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
