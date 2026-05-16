"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Users, FolderKanban, CheckSquare, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClientForm } from "@/components/clients/client-form";
import { ProjectForm } from "@/components/projects/project-form";
import { TaskForm } from "@/components/tasks/task-form";

type ActiveDialog = "client" | "project" | "task" | "charge" | null;

const ACTIONS = [
  { key: "charge" as const,   label: "Nova Cobrança",  icon: DollarSign,   color: "bg-orange-500/10 text-orange-400 border-orange-500/20"  },
  { key: "task" as const,     label: "Nova Tarefa",    icon: CheckSquare,  color: "bg-amber-500/10 text-amber-400 border-amber-500/20"     },
  { key: "project" as const,  label: "Novo Projeto",   icon: FolderKanban, color: "bg-purple-500/10 text-purple-400 border-purple-500/20"  },
  { key: "client" as const,   label: "Novo Cliente",   icon: Users,        color: "bg-blue-500/10 text-blue-400 border-blue-500/20"        },
];

const DIALOG_TITLES: Record<string, string> = {
  client: "Novo Cliente",
  project: "Novo Projeto",
  task: "Nova Tarefa",
  charge: "Nova Cobrança",
};

export function QuickActionsFab() {
  const [open, setOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);

  function openDialog(key: ActiveDialog) {
    setOpen(false);
    setTimeout(() => setActiveDialog(key), 100);
  }

  return (
    <>
      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {open && (
            <>
              {ACTIONS.map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.key}
                    initial={{ opacity: 0, y: 12, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.85 }}
                    transition={{ duration: 0.18, delay: i * 0.05 }}
                    onClick={() => openDialog(action.key)}
                    className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2 text-sm font-medium shadow-lg backdrop-blur-sm transition-opacity hover:opacity-90 ${action.color}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {action.label}
                  </motion.button>
                );
              })}
            </>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setOpen((v) => !v)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          whileTap={{ scale: 0.93 }}
        >
          <motion.div
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="h-5 w-5" />
          </motion.div>
        </motion.button>
      </div>

      {/* Backdrop ao abrir o menu */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Dialogs controlados */}
      <Dialog open={activeDialog === "client"} onOpenChange={(v) => !v && setActiveDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{DIALOG_TITLES.client}</DialogTitle></DialogHeader>
          <ClientForm onSuccess={() => setActiveDialog(null)} />
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "project"} onOpenChange={(v) => !v && setActiveDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{DIALOG_TITLES.project}</DialogTitle></DialogHeader>
          <ProjectForm onSuccess={() => setActiveDialog(null)} />
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "task"} onOpenChange={(v) => !v && setActiveDialog(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{DIALOG_TITLES.task}</DialogTitle></DialogHeader>
          <TaskForm onSuccess={() => setActiveDialog(null)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
