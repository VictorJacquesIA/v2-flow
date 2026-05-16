"use client";

import { motion } from "framer-motion";
import {
  UserPlus, FolderPlus, FolderEdit, CheckSquare, CheckCircle2,
  DollarSign, Upload, Trash2, FileText, Clock,
} from "lucide-react";
import type { ActivityLog } from "@/app/actions/activity";

const ACTION_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  "client:created":    { icon: UserPlus,      label: "Cliente criado",              color: "text-blue-400 bg-blue-500/10"    },
  "client:updated":    { icon: FolderEdit,    label: "Cliente atualizado",          color: "text-blue-300 bg-blue-500/10"    },
  "project:created":   { icon: FolderPlus,    label: "Projeto criado",              color: "text-purple-400 bg-purple-500/10"},
  "project:updated":   { icon: FolderEdit,    label: "Projeto atualizado",          color: "text-purple-300 bg-purple-500/10"},
  "task:created":      { icon: CheckSquare,   label: "Tarefa criada",               color: "text-amber-400 bg-amber-500/10"  },
  "task:completed":    { icon: CheckCircle2,  label: "Tarefa concluída",            color: "text-emerald-400 bg-emerald-500/10"},
  "task:updated":      { icon: CheckSquare,   label: "Tarefa atualizada",           color: "text-amber-300 bg-amber-500/10"  },
  "charge:created":    { icon: DollarSign,    label: "Cobrança criada",             color: "text-orange-400 bg-orange-500/10"},
  "charge:paid":       { icon: DollarSign,    label: "Cobrança marcada como paga",  color: "text-emerald-400 bg-emerald-500/10"},
  "document:uploaded": { icon: Upload,        label: "Documento enviado",           color: "text-indigo-400 bg-indigo-500/10"},
  "document:deleted":  { icon: Trash2,        label: "Documento excluído",          color: "text-red-400 bg-red-500/10"      },
};

function relativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `há ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ontem";
  return `há ${days} dias`;
}

interface ActivityTimelineProps {
  logs: ActivityLog[];
}

export function ActivityTimeline({ logs }: ActivityTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-muted p-3 mb-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Nenhuma atividade registrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {logs.map((log, index) => {
        const key = `${log.entity_type}:${log.action}`;
        const cfg = ACTION_CONFIG[key] ?? { icon: FileText, label: log.action, color: "text-muted-foreground bg-muted" };
        const Icon = cfg.icon;

        return (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04, duration: 0.2 }}
            className="flex items-start gap-3 py-2"
          >
            <div className={`mt-0.5 rounded-md p-1.5 shrink-0 ${cfg.color}`}>
              <Icon className="h-3 w-3" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-tight">
                {cfg.label}
                {log.entity_name && (
                  <span className="text-muted-foreground"> — {log.entity_name}</span>
                )}
              </p>
              {log.metadata?.note != null && (
                <p className="text-xs text-muted-foreground mt-0.5">{String(log.metadata.note)}</p>
              )}
            </div>
            <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
              {relativeTime(log.created_at)}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
