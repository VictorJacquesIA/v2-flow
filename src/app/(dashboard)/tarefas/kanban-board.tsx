"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent,
  DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors,
  useDroppable, useDraggable,
} from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { TaskStatusButton } from "@/components/tasks/task-status-button";
import { updateTaskStatusAction } from "@/app/actions/tasks";
import { formatDate, isOverdue } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Calendar, Clock, GripVertical } from "lucide-react";
import type { TaskStatus } from "@/types";

const STATUS_COLUMNS = [
  { key: "pendente" as TaskStatus,   label: "Pendente",   color: "text-muted-foreground", dot: "bg-muted-foreground"    },
  { key: "fazendo" as TaskStatus,    label: "Fazendo",    color: "text-blue-400",         dot: "bg-blue-400"            },
  { key: "aguardando" as TaskStatus, label: "Aguardando", color: "text-amber-400",        dot: "bg-amber-400"           },
  { key: "concluida" as TaskStatus,  label: "Concluída",  color: "text-emerald-400",      dot: "bg-emerald-400"         },
] as const;

const PRIORITY_VARIANT: Record<string, "destructive" | "warning" | "info" | "secondary"> = {
  urgente: "destructive", alta: "warning", media: "info", baixa: "secondary",
};

type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: string;
  deadline: string | null;
  clients: { name: string } | null;
  projects: { name: string } | null;
};

function DroppableColumn({ id, isOver, children }: { id: string; isOver: boolean; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[80px] rounded-xl transition-all duration-150 p-1",
        isOver && "ring-2 ring-primary/40 bg-primary/5"
      )}
    >
      {children}
    </div>
  );
}

function TaskCard({ task, isDragging }: { task: Task; isDragging?: boolean }) {
  const overdue = isOverdue(task.deadline) && task.status !== "concluida";
  const pc = PRIORITY_VARIANT[task.priority] ?? "secondary";
  const otherStatuses = STATUS_COLUMNS.filter((s) => s.key !== task.status);

  return (
    <div className={cn(
      "rounded-xl border border-border bg-card p-3 space-y-2 select-none",
      isDragging ? "shadow-2xl opacity-95 scale-[1.02] ring-2 ring-primary/30" : "hover:border-border/60 transition-colors"
    )}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-tight">{task.title}</p>
        <Badge variant={pc} className="text-xs shrink-0">{task.priority}</Badge>
      </div>

      {(task.clients || task.projects) && (
        <p className="text-xs text-muted-foreground truncate">
          {(task.clients as { name: string } | null)?.name}
          {task.clients && task.projects && " · "}
          {(task.projects as { name: string } | null)?.name}
        </p>
      )}

      {task.deadline && (
        <div className={cn("flex items-center gap-1 text-xs", overdue ? "text-red-400" : "text-muted-foreground")}>
          {overdue ? <Clock className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
          {overdue && "Atrasada · "}{formatDate(task.deadline)}
        </div>
      )}

      <div className="flex items-center gap-1 flex-wrap pt-0.5">
        {otherStatuses.map((s) => (
          <TaskStatusButton key={s.key} taskId={task.id} status={s.key} label={s.label} />
        ))}
        <TaskDialog task={task as unknown as Parameters<typeof TaskDialog>[0]["task"]}>
          <button className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors ml-auto">
            editar
          </button>
        </TaskDialog>
      </div>
    </div>
  );
}

function DraggableTaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
  return (
    <div ref={setNodeRef} {...attributes} className={cn("relative", isDragging && "opacity-40")}>
      <div
        {...listeners}
        className="absolute -left-1 top-3 cursor-grab active:cursor-grabbing p-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </div>
      <TaskCard task={task} />
    </div>
  );
}

export function KanbanBoard({ initialTasks }: { initialTasks: Task[] }) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  const activeTask = tasks.find((t) => t.id === activeId);

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverColumnId(over ? (over.id as string) : null);
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    setOverColumnId(null);
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
    await updateTaskStatusAction(taskId, newStatus);
    router.refresh();
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 min-w-0">
        {STATUS_COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          const isOver = overColumnId === col.key;
          return (
            <div key={col.key} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", col.dot)} />
                  <span className={cn("text-sm font-medium", col.color)}>{col.label}</span>
                </div>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                  {colTasks.length}
                </span>
              </div>
              <DroppableColumn id={col.key} isOver={isOver}>
                <div className="space-y-2">
                  {colTasks.map((task) => (
                    <DraggableTaskCard key={task.id} task={task} />
                  ))}
                  {colTasks.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-6 px-2">
                      Arraste tarefas aqui
                    </p>
                  )}
                </div>
              </DroppableColumn>
            </div>
          );
        })}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
        {activeTask && <TaskCard task={activeTask} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
