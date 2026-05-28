"use client";

import { useState, useEffect } from "react";
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
  Eye,
  EyeOff,
} from "lucide-react";
import { formatCurrency, formatDate, isOverdue } from "@/lib/utils";
import Link from "next/link";

const STORAGE_KEY = "v2flow:finance-hidden";
const HIDDEN_MASK = "R$ ••••";

interface Task {
  id: string;
  title: string;
  deadline: string | null;
  priority: string;
}

interface Project {
  id: string;
  name: string;
  deadline: string | null;
  clients: unknown;
}

interface Charge {
  id: string;
  description: string;
  value: number;
  due_date: string;
  status: string;
  clients: unknown;
}

interface Client {
  id: string;
  name: string;
  company: string | null;
  status: string;
}

interface DashboardViewProps {
  description: string;
  activeClients: number;
  activeProjects: number;
  lateTasks: Task[];
  weekProjects: Project[];
  pendingCharges: Charge[];
  recentClients: Client[];
  pendingTotal: number;
  monthRevenue: number;
}

const priorityMap: Record<string, { label: string; variant: "destructive" | "warning" | "info" | "secondary" }> = {
  urgente: { label: "Urgente", variant: "destructive" },
  alta:    { label: "Alta",    variant: "warning" },
  media:   { label: "Média",   variant: "info" },
  baixa:   { label: "Baixa",   variant: "secondary" },
};

export function DashboardView({
  description,
  activeClients,
  activeProjects,
  lateTasks,
  weekProjects,
  pendingCharges,
  recentClients,
  pendingTotal,
  monthRevenue,
}: DashboardViewProps) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setHidden(stored === "true");
  }, []);

  function toggle() {
    setHidden((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  function fin(value: number) {
    return hidden ? HIDDEN_MASK : formatCurrency(value);
  }

  const stats = [
    {
      title: "Clientes Ativos",
      value: String(activeClients),
      icon: Users,
      href: "/clientes",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Projetos em Andamento",
      value: String(activeProjects),
      icon: FolderKanban,
      href: "/projetos",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      title: "Tarefas Atrasadas",
      value: String(lateTasks.length),
      icon: AlertCircle,
      href: "/tarefas",
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      title: "Entregas esta Semana",
      value: String(weekProjects.length),
      icon: Calendar,
      href: "/projetos",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      title: "Cobranças Pendentes",
      value: fin(pendingTotal),
      icon: DollarSign,
      href: "/financeiro",
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
    {
      title: "Receita do Mês",
      value: fin(monthRevenue),
      icon: TrendingUp,
      href: "/financeiro",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Header inline com olhinho ao lado do título */}
      <div className="flex h-[120px] items-center justify-between border-b border-border pl-16 pr-6 lg:pl-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
            <button
              onClick={toggle}
              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
              aria-label={hidden ? "Mostrar valores financeiros" : "Ocultar valores financeiros"}
            >
              {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>

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
              {!lateTasks.length ? (
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
              {!pendingCharges.length ? (
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
                            {(charge.clients as { name: string } | null)?.name ?? "—"} · Vence {formatDate(charge.due_date)}
                          </p>
                        </div>
                        <div className="shrink-0 ml-2">
                          <Badge variant={overdue ? "destructive" : "warning"} className="text-xs">
                            {hidden ? "••••" : formatCurrency(charge.value)}
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
              {!weekProjects.length ? (
                <p className="text-sm text-muted-foreground py-4">Nenhuma entrega prevista</p>
              ) : (
                weekProjects.map((project) => (
                  <Link key={project.id} href="/projetos">
                    <div className="flex items-center justify-between rounded-lg p-2 hover:bg-accent/50 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(project.clients as { name: string } | null)?.name ?? "—"}
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
              {!recentClients.length ? (
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
