"use client";

import { useDroppable } from "@dnd-kit/core";
import type { TaskStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { NewTaskButton } from "./task-dialog";

export function KanbanColumn({
  status,
  label,
  dot,
  count,
  projectId,
  children,
}: {
  status: TaskStatus;
  label: string;
  dot: string;
  count: number;
  projectId: string;
  children: React.ReactNode;
}) {
  // Id stlpca = hodnota TaskStatus, aby sa dalo pustit aj do prazdneho stlpca
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border bg-[var(--bg-subtle)] p-2.5 transition-colors",
        isOver ? "border-[var(--accent)]" : "border-[var(--border)]",
      )}
    >
      <div className="mb-2.5 flex items-center gap-2 px-1">
        <span className="size-1.5 rounded-full" style={{ background: dot }} aria-hidden />
        <h2 className="text-sm font-medium">{label}</h2>
        <span className="tabular ml-auto text-xs text-[var(--text-muted)]">{count}</span>
      </div>

      <div className="flex min-h-24 flex-1 flex-col gap-2">{children}</div>

      <NewTaskButton projectId={projectId} status={status} compact />
    </div>
  );
}
