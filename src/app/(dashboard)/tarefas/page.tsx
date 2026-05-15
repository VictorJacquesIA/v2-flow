import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { TaskStatusButton } from "@/components/tasks/task-status-button";
import { Plus, Calendar, Clock } from "lucide-react";
import { formatDate, isOverdue } from "@/lib/utils";
import { cn } from "@/lib/utils";

const statusColumns = [
  { key: "pendente", label: "Pendente", color: "text-muted-foreground" },
  { key: "fazendo", label: "Fazendo", color: "text-blue-400" },
  { key: "aguardando", label: "Aguardando", color: "text-amber-400" },
  { key: "concluida", label: "Concluída", color: "text-emerald-400" },
] as const;

const priorityConfig: Record<string, { variant: "destructive" | "warning" | "info" | "secondary" }> = {
  urgente: { variant: "destructive" },
  alta: { variant: "warning" },
  media: { variant: "info" },
  baixa: { variant: "secondary" },
};

export default async function TarefasPage() {
  const supabase = await createClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, clients(name), projects(name)")
    .order("created_at", { ascending: false });

  const tasksByStatus = statusColumns.reduce((acc, col) => {
    acc[col.key] = tasks?.filter(t => t.status === col.key) ?? [];
    return acc;
  }, {} as Record<string, typeof tasks>);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Tarefas"
        description={`${tasks?.filter(t => t.status !== "concluida").length ?? 0} tarefas ativas`}
        action={
          <TaskDialog>
            <Button size="sm"><Plus className="h-4 w-4" />Nova Tarefa</Button>
          </TaskDialog>
        }
      />

      <div className="p-6 overflow-x-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 min-w-0">
          {statusColumns.map((col) => {
            const colTasks = tasksByStatus[col.key] ?? [];
            return (
              <div key={col.key} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className={cn("text-sm font-medium", col.color)}>{col.label}</span>
                  <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.map((task) => {
                    const overdue = isOverdue(task.deadline) && task.status !== "concluida";
                    const pc = priorityConfig[task.priority] ?? priorityConfig.media;
                    return (
                      <div key={task.id} className="rounded-xl border border-border bg-card p-3 space-y-2 hover:border-border/60 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-tight">{task.title}</p>
                          <Badge variant={pc.variant} className="text-xs shrink-0">{task.priority}</Badge>
                        </div>

                        {(task.clients || task.projects) && (
                          <div className="text-xs text-muted-foreground">
                            {(task.clients as { name: string } | null)?.name}
                            {task.clients && task.projects && " · "}
                            {(task.projects as { name: string } | null)?.name}
                          </div>
                        )}

                        {task.deadline && (
                          <div className={cn("flex items-center gap-1 text-xs", overdue ? "text-red-400" : "text-muted-foreground")}>
                            {overdue ? <Clock className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                            {overdue ? "Atrasada · " : ""}{formatDate(task.deadline)}
                          </div>
                        )}

                        <div className="flex items-center gap-1 flex-wrap">
                          {statusColumns.filter(s => s.key !== col.key).map(s => (
                            <TaskStatusButton key={s.key} taskId={task.id} status={s.key} label={s.label} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
