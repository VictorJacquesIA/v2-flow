import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { KanbanBoard } from "./kanban-board";
import { Plus } from "lucide-react";

export default async function TarefasPage() {
  const supabase = await createClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, clients(name), projects(name)")
    .order("created_at", { ascending: false });

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
        <KanbanBoard initialTasks={tasks ?? []} />
      </div>
    </div>
  );
}
