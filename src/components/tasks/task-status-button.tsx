"use client";

import { useRouter } from "next/navigation";
import { updateTaskStatusAction } from "@/app/actions/tasks";
import type { TaskStatus } from "@/types";

interface TaskStatusButtonProps {
  taskId: string;
  status: TaskStatus;
  label: string;
}

export function TaskStatusButton({ taskId, status, label }: TaskStatusButtonProps) {
  const router = useRouter();

  async function handleClick() {
    await updateTaskStatusAction(taskId, status);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
    >
      → {label}
    </button>
  );
}
