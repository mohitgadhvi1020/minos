"use client";

import { useState } from "react";
import { Plus, X, Palette } from "lucide-react";
import { cn } from "@/lib/cn";
import HabitGrid from "@/components/HabitGrid";
import { useHabits, createHabit } from "@/lib/hooks";
import type { HabitFrequency } from "@/lib/types";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f59e0b",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
];

export default function HabitsPage() {
  const { data: habits } = useHabits();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [color, setColor] = useState(COLORS[0]);

  async function handleAdd() {
    if (!name.trim()) return;
    await createHabit({ name: name.trim(), frequency, color });
    setName("");
    setFrequency("daily");
    setColor(COLORS[0]);
    setShowAdd(false);
  }

  const activeHabits = (habits || []).filter((h) => h.active);
  const totalStreaks = activeHabits.reduce((sum, h) => sum + h.streak, 0);
  const completedToday = activeHabits.filter((h) => {
    const today = new Date().toISOString().split("T")[0];
    return h.logs.some((l) => l.log_date === today && l.completed);
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {completedToday}/{activeHabits.length} done today &middot; {totalStreaks} total streak days
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAdd ? "Cancel" : "New Habit"}
        </button>
      </div>

      {/* Add new habit form */}
      {showAdd && (
        <div className="border border-border rounded-xl p-4 space-y-4 bg-card animate-fade-in">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Habit name (e.g., Meditate, Read, Exercise)"
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {(["daily", "weekly"] as HabitFrequency[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize",
                    frequency === f
                      ? "bg-accent/10 text-accent border-accent/20"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <Palette className="w-3.5 h-3.5 text-muted-foreground" />
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-5 h-5 rounded-full transition-all",
                    color === c ? "ring-2 ring-offset-2 ring-offset-card" : "hover:scale-110"
                  )}
                  style={{ backgroundColor: c, ...(color === c ? { ringColor: c } : {}) }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAdd}
              disabled={!name.trim()}
              className="px-4 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              Add Habit
            </button>
          </div>
        </div>
      )}

      {/* Habit grid */}
      {habits && habits.length > 0 ? (
        <div className="border border-border rounded-xl p-6 bg-card">
          <HabitGrid habits={habits} />
        </div>
      ) : (
        <div className="p-12 border border-dashed border-border rounded-xl text-center">
          <p className="text-sm text-muted-foreground">
            No habits tracked yet. Add one to get started!
          </p>
        </div>
      )}

      {/* Stats summary */}
      {activeHabits.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-border rounded-xl p-4 text-center bg-card">
            <div className="text-2xl font-bold text-accent">{activeHabits.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Active Habits</div>
          </div>
          <div className="border border-border rounded-xl p-4 text-center bg-card">
            <div className="text-2xl font-bold text-success">{completedToday}</div>
            <div className="text-xs text-muted-foreground mt-1">Done Today</div>
          </div>
          <div className="border border-border rounded-xl p-4 text-center bg-card">
            <div className="text-2xl font-bold text-warning">{totalStreaks}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Streak Days</div>
          </div>
        </div>
      )}
    </div>
  );
}
