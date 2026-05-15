"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProjectForm } from "./project-form";
import type { Project } from "@/types";

interface ProjectDialogProps {
  children: React.ReactNode;
  project?: Project;
  clientId?: string;
}

export function ProjectDialog({ children, project, clientId }: ProjectDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? "Editar Projeto" : "Novo Projeto"}</DialogTitle>
        </DialogHeader>
        <ProjectForm project={project} clientId={clientId} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
