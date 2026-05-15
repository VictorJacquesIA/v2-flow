"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "./task-form";
import type { Task } from "@/types";

interface TaskDialogProps {
  children: React.ReactNode;
  task?: Task;
  clientId?: string;
}

export function TaskDialog({ children, task, clientId }: TaskDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
        </DialogHeader>
        <TaskForm task={task} clientId={clientId} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
