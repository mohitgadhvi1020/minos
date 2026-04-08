"use client";

import { useState } from "react";
import { CalendarDays, Target, Brain, Plus, CheckCircle2 } from "lucide-react";
import QuickCapture from "@/components/QuickCapture";
import AIProcessingDialog from "@/components/AIProcessingDialog";
import TaskCard from "@/components/TaskCard";
import HabitGrid from "@/components/HabitGrid";
import ThoughtCard from "@/components/ThoughtCard";
import SetupBanner from "@/components/SetupBanner";
import {
  useTasks,
  useHabits,
  useThoughts,
  useDailyGoals,
  saveDailyGoals,
} from "@/lib/hooks";
import type { GoalItem } from "@/lib/types";

export default function Dashboard() {
  const { data: tasks } = useTasks();
  const { data: habits } = useHabits();
  const { data: thoughts } = useThoughts();
  const today = new Date().toISOString().split("T")[0];
  const { data: dailyGoals } = useDailyGoals(today);

  const [captureText, setCaptureText] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState("");

  const todayTasks = (tasks || []).filter((t) => t.status !== "done").slice(0, 5);
  const recentThoughts = (thoughts || []).slice(0, 3);

  const greeting = getGreeting();

  async function addGoal() {
    if (!newGoal.trim()) return;
    const goals: GoalItem[] = [...(dailyGoals?.goals || []), { text: newGoal.trim(), done: false }];
    await saveDailyGoals(today, goals, dailyGoals?.reflection || undefined);
    setNewGoal("");
  }

  async function toggleGoal(idx: number) {
    if (!dailyGoals) return;
    const goals = dailyGoals.goals.map((g, i) =>
      i === idx ? { ...g, done: !g.done } : g
    );
    await saveDailyGoals(today, goals, dailyGoals.reflection || undefined);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{greeting}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          <CalendarDays className="w-3.5 h-3.5 inline mr-1" />
          {new Date().toLocaleDateString("en", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Setup Banner */}
      <SetupBanner />

      {/* Quick Capture */}
      <QuickCapture
        onSubmit={(text) => setCaptureText(text)}
        placeholder="Speak your mind or type a thought..."
      />

      {/* AI Dialog */}
      {captureText && (
        <AIProcessingDialog
          content={captureText}
          source="text"
          onClose={() => setCaptureText(null)}
          onComplete={() => setCaptureText(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-accent" />
            <h2 className="font-semibold text-sm">Today&apos;s Tasks</h2>
            <span className="text-xs text-muted-foreground ml-auto">
              {todayTasks.length} active
            </span>
          </div>
          {todayTasks.length === 0 ? (
            <div className="p-6 border border-dashed border-border rounded-xl text-center text-sm text-muted-foreground">
              No active tasks. Capture a thought to get started!
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <TaskCard key={task.id} task={task} compact />
              ))}
            </div>
          )}
        </div>

        {/* Daily Goals */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <h2 className="font-semibold text-sm">Daily Goals</h2>
          </div>
          <div className="border border-border rounded-xl p-4 space-y-3">
            {(dailyGoals?.goals || []).map((goal, idx) => (
              <button
                key={idx}
                onClick={() => toggleGoal(idx)}
                className="flex items-center gap-3 w-full text-left group"
              >
                <div
                  className={
                    goal.done
                      ? "w-4 h-4 rounded border-2 bg-success border-success flex-shrink-0"
                      : "w-4 h-4 rounded border-2 border-muted-foreground group-hover:border-success flex-shrink-0"
                  }
                />
                <span
                  className={
                    goal.done
                      ? "text-sm line-through text-muted-foreground"
                      : "text-sm"
                  }
                >
                  {goal.text}
                </span>
              </button>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addGoal()}
                placeholder="Add a goal for today..."
                className="flex-1 text-sm bg-muted/50 rounded-lg px-3 py-2 outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={addGoal}
                disabled={!newGoal.trim()}
                className="p-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Habits */}
        {habits && habits.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-accent" />
              <h2 className="font-semibold text-sm">Habits</h2>
            </div>
            <div className="border border-border rounded-xl p-4">
              <HabitGrid habits={habits} compact />
            </div>
          </div>
        )}

        {/* Recent Thoughts */}
        {recentThoughts.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-sm">Recent Thoughts</h2>
            <div className="space-y-2">
              {recentThoughts.map((thought) => (
                <ThoughtCard key={thought.id} thought={thought} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
