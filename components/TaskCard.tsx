"use client";

import { useState } from "react";
import {
  ArrowRight,
  Link2,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { Task, TaskPriority } from "@/lib/types";
import { updateTask, deleteTask } from "@/lib/hooks";

const PRIORITY_BADGE: Record<TaskPriority, { bg: string; label: string }> = {
  high: { bg: "bg-danger/10 text-danger", label: "High" },
  medium: { bg: "bg-warning/10 text-warning", label: "Med" },
  low: { bg: "bg-success/10 text-success", label: "Low" },
};

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
] as const;

interface TaskCardProps {
  task: Task;
  compact?: boolean;
  linkedTasks?: Task[];
}

export default function TaskCard({ task, compact = false, linkedTasks }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  const badge = PRIORITY_BADGE[task.priority];

  async function handleStatusChange(status: Task["status"]) {
    setSaving(true);
    try {
      await updateTask(task.id, { status });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this task?")) return;
    await deleteTask(task.id);
  }

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors group",
          task.status === "done" && "opacity-50"
        )}
      >
        <button
          onClick={(e) => { e.stopPropagation(); handleStatusChange(task.status === "done" ? "todo" : "done"); }}
          className="flex items-center justify-center w-8 h-8 -m-2 flex-shrink-0"
        >
          <span
            className={cn(
              "w-4 h-4 rounded border-2 transition-colors",
              task.status === "done"
                ? "bg-accent border-accent"
                : "border-muted-foreground hover:border-accent"
            )}
          />
        </button>
        <span
          className={cn(
            "text-sm flex-1 truncate",
            task.status === "done" && "line-through"
          )}
        >
          {task.title}
        </span>
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", badge.bg)}>
          {badge.label}
        </span>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl p-4 space-y-3 bg-card hover:shadow-sm transition-shadow animate-fade-in">
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); handleStatusChange(task.status === "done" ? "todo" : "done"); }}
          className="flex items-center justify-center w-10 h-10 -m-2 flex-shrink-0"
        >
          <span
            className={cn(
              "w-5 h-5 rounded border-2 transition-colors",
              task.status === "done"
                ? "bg-accent border-accent"
                : "border-muted-foreground hover:border-accent"
            )}
          />
        </button>
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "font-medium text-sm",
              task.status === "done" && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", badge.bg)}>
            {badge.label}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded hover:bg-muted text-muted-foreground"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="pl-8 space-y-3 animate-fade-in">
          {/* Status */}
          <div className="flex gap-2">
            {STATUS_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleStatusChange(value)}
                disabled={saving}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors",
                  task.status === value
                    ? "bg-accent/10 text-accent border-accent/20"
                    : "border-border text-muted-foreground hover:border-accent/30"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Follow-up */}
          {task.follow_up && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ArrowRight className="w-3 h-3" />
              <span>Follow-up: {task.follow_up}</span>
            </div>
          )}

          {/* Linked tasks */}
          {linkedTasks && linkedTasks.length > 0 && (
            <div className="space-y-1">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Link2 className="w-3 h-3" />
                Linked tasks
              </span>
              {linkedTasks.map((lt) => (
                <div
                  key={lt.id}
                  className="flex items-center gap-2 text-xs pl-4 text-muted-foreground"
                >
                  <GripVertical className="w-3 h-3" />
                  {lt.title}
                </div>
              ))}
            </div>
          )}

          {/* Due date */}
          {task.due_date && (
            <div className="text-xs text-muted-foreground">
              Due: {new Date(task.due_date).toLocaleDateString()}
            </div>
          )}

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-xs text-danger hover:text-danger/80 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
