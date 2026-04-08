"use client";

import { useState } from "react";
import {
  Plus,
  Filter,
  ListTodo,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import TaskCard from "@/components/TaskCard";
import { useTasks, useTaskLinks, createTask } from "@/lib/hooks";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";

const STATUSES: { value: TaskStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const PRIORITIES: { value: TaskPriority | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export default function TasksPage() {
  const { data: tasks } = useTasks();
  const { data: taskLinks } = useTaskLinks();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");
  const [newDescription, setNewDescription] = useState("");

  const filtered = (tasks || []).filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    return true;
  });

  const prioritySorted = [...filtered].sort((a, b) => {
    const order: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  function getLinkedTasks(taskId: string): Task[] {
    if (!taskLinks || !tasks) return [];
    const linkedIds = taskLinks
      .filter((l) => l.source_task_id === taskId || l.target_task_id === taskId)
      .map((l) => (l.source_task_id === taskId ? l.target_task_id : l.source_task_id));
    return tasks.filter((t) => linkedIds.includes(t.id));
  }

  async function handleAddTask() {
    if (!newTitle.trim()) return;
    await createTask({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      priority: newPriority,
    });
    setNewTitle("");
    setNewDescription("");
    setNewPriority("medium");
    setShowAdd(false);
  }

  const counts = {
    total: tasks?.length || 0,
    todo: tasks?.filter((t) => t.status === "todo").length || 0,
    in_progress: tasks?.filter((t) => t.status === "in_progress").length || 0,
    done: tasks?.filter((t) => t.status === "done").length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {counts.todo} to do, {counts.in_progress} in progress, {counts.done} done
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAdd ? "Cancel" : "New Task"}
        </button>
      </div>

      {/* Quick add */}
      {showAdd && (
        <div className="border border-border rounded-xl p-4 space-y-3 bg-card animate-fade-in">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Task title"
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          />
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full bg-muted/50 rounded-lg p-2 text-sm outline-none resize-none"
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {(["high", "medium", "low"] as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setNewPriority(p)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                    newPriority === p
                      ? p === "high"
                        ? "bg-danger/10 text-danger border-danger/20"
                        : p === "medium"
                          ? "bg-warning/10 text-warning border-warning/20"
                          : "bg-success/10 text-success border-success/20"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={handleAddTask}
              disabled={!newTitle.trim()}
              className="px-4 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              Add Task
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1">
            {STATUSES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                  statusFilter === value
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1">
            {PRIORITIES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPriorityFilter(value)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                  priorityFilter === value
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task list */}
      {prioritySorted.length === 0 ? (
        <div className="p-12 border border-dashed border-border rounded-xl text-center">
          <ListTodo className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No tasks yet. Capture a thought or add a task manually.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {prioritySorted.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              linkedTasks={getLinkedTasks(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
