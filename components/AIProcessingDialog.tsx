"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Sparkles, Link2, ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AIAnalysis, AITaskSuggestion, Task, TaskPriority } from "@/lib/types";
import { processWithAI, createThought, createTask, createTaskLink, useTasks } from "@/lib/hooks";

interface AIProcessingDialogProps {
  content: string;
  source: "text" | "voice";
  onClose: () => void;
  onComplete: () => void;
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: "bg-danger/10 text-danger border-danger/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-success/10 text-success border-success/20",
};

export default function AIProcessingDialog({
  content,
  source,
  onClose,
  onComplete,
}: AIProcessingDialogProps) {
  const { data: existingTasks } = useTasks();
  const [stage, setStage] = useState<"processing" | "review" | "saving" | "done">("processing");
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<(AITaskSuggestion & { priority: TaskPriority; follow_up: string; linked_ids: string[] })[]>([]);

  useEffect(() => {
    processThought();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function processThought() {
    try {
      const result = await processWithAI(
        content,
        (existingTasks || []).map((t) => ({ id: t.id, title: t.title, description: t.description || "" }))
      ) as AIAnalysis;

      setAnalysis(result);
      setTasks(
        (result.tasks || []).map((t) => ({
          ...t,
          priority: t.priority_suggestion || "medium",
          follow_up: t.follow_up_suggestion || "",
          linked_ids: t.linked_task_ids || [],
        }))
      );
      setStage("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI processing failed");
      setStage("review");
    }
  }

  async function handleSave() {
    setStage("saving");
    try {
      const thought = await createThought(content, source);

      for (const task of tasks) {
        const created = await createTask({
          thought_id: thought.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: "todo",
          follow_up: task.follow_up || null,
        });

        for (const linkedId of task.linked_ids) {
          if (linkedId && existingTasks?.some((t) => t.id === linkedId)) {
            await createTaskLink({
              source_task_id: created.id,
              target_task_id: linkedId,
              relationship: "related",
            });
          }
        }
      }

      if (tasks.length === 0) {
        await createThought(content, source);
      }

      setStage("done");
      onComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
      setStage("review");
    }
  }

  function updateTask(idx: number, updates: Partial<(typeof tasks)[0]>) {
    setTasks((prev) => prev.map((t, i) => (i === idx ? { ...t, ...updates } : t)));
  }

  function removeTask(idx: number) {
    setTasks((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-fade-in scrollbar-thin">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="font-semibold">AI Analysis</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Original thought */}
          <div className="p-3 bg-muted rounded-lg text-sm">
            <span className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Your thought</span>
            <p className="mt-1">{content}</p>
          </div>

          {/* Processing state */}
          {stage === "processing" && (
            <div className="flex flex-col items-center py-8 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="text-sm text-muted-foreground">Analyzing your thought...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-danger/10 text-danger rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Review stage */}
          {stage === "review" && analysis && (
            <>
              <div className="p-3 bg-accent/5 rounded-lg text-sm border border-accent/10">
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-medium">
                  Type: {analysis.type}
                </span>
                <p className="mt-1">{analysis.summary}</p>
              </div>

              {tasks.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Extracted Tasks</h3>
                  {tasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="p-3 border border-border rounded-lg space-y-3 animate-fade-in"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <input
                          value={task.title}
                          onChange={(e) => updateTask(idx, { title: e.target.value })}
                          className="font-medium text-sm bg-transparent outline-none flex-1"
                        />
                        <button
                          onClick={() => removeTask(idx)}
                          className="p-1 rounded hover:bg-muted text-muted-foreground"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <textarea
                        value={task.description}
                        onChange={(e) => updateTask(idx, { description: e.target.value })}
                        rows={2}
                        className="w-full text-sm bg-muted/50 rounded-lg p-2 outline-none resize-none"
                        placeholder="Description..."
                      />

                      {/* Priority selector */}
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">What&apos;s the priority?</label>
                        <div className="flex gap-2">
                          {(["high", "medium", "low"] as TaskPriority[]).map((p) => (
                            <button
                              key={p}
                              onClick={() => updateTask(idx, { priority: p })}
                              className={cn(
                                "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                                task.priority === p
                                  ? PRIORITY_COLORS[p]
                                  : "border-border text-muted-foreground hover:border-accent/30"
                              )}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Follow-up */}
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" />
                          Follow-up action
                        </label>
                        <input
                          value={task.follow_up}
                          onChange={(e) => updateTask(idx, { follow_up: e.target.value })}
                          className="w-full text-sm bg-muted/50 rounded-lg p-2 outline-none"
                          placeholder="What's the next step?"
                        />
                      </div>

                      {/* Task linking */}
                      {existingTasks && existingTasks.length > 0 && (
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground flex items-center gap-1">
                            <Link2 className="w-3 h-3" />
                            Linked tasks
                          </label>
                          <div className="relative">
                            <select
                              multiple
                              value={task.linked_ids}
                              onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, (o) => o.value);
                                updateTask(idx, { linked_ids: selected });
                              }}
                              className="w-full text-sm bg-muted/50 rounded-lg p-2 outline-none max-h-24 scrollbar-thin"
                            >
                              {existingTasks.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.title}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {tasks.length === 0 && !error && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tasks extracted. This will be saved as a thought.
                </p>
              )}
            </>
          )}

          {/* Saving state */}
          {stage === "saving" && (
            <div className="flex flex-col items-center py-8 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="text-sm text-muted-foreground">Saving...</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {stage === "review" && (
          <div className="sticky bottom-0 bg-card border-t border-border p-4 flex gap-3 rounded-b-2xl">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Save {tasks.length > 0 ? `${tasks.length} task${tasks.length > 1 ? "s" : ""}` : "thought"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
