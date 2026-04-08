"use client";

import { cn } from "@/lib/cn";
import type { HabitWithLogs } from "@/lib/types";
import { toggleHabitLog } from "@/lib/hooks";
import { Flame } from "lucide-react";

interface HabitGridProps {
  habits: HabitWithLogs[];
  compact?: boolean;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en", { weekday: "short" }).slice(0, 2);
}

export default function HabitGrid({ habits, compact = false }: HabitGridProps) {
  const days = getLast7Days();
  const today = new Date().toISOString().split("T")[0];

  if (compact) {
    return (
      <div className="space-y-2">
        {habits.filter((h) => h.active).map((habit) => {
          const todayDone = habit.logs.some((l) => l.log_date === today && l.completed);
          return (
            <button
              key={habit.id}
              onClick={() => toggleHabitLog(habit.id, today)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-lg border transition-all text-left",
                todayDone
                  ? "border-success/30 bg-success/5"
                  : "border-border hover:border-accent/30"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded border-2 flex-shrink-0 transition-colors",
                  todayDone ? "bg-success border-success" : "border-muted-foreground"
                )}
              />
              <span className={cn("text-sm flex-1", todayDone && "text-muted-foreground")}>
                {habit.name}
              </span>
              {habit.streak > 0 && (
                <span className="flex items-center gap-1 text-xs text-warning">
                  <Flame className="w-3 h-3" />
                  {habit.streak}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header row with day labels */}
      <div className="flex items-center gap-1">
        <div className="w-32 flex-shrink-0" />
        {days.map((d) => (
          <div
            key={d}
            className={cn(
              "flex-1 text-center text-[10px] font-medium uppercase tracking-wider",
              d === today ? "text-accent" : "text-muted-foreground"
            )}
          >
            {getDayLabel(d)}
          </div>
        ))}
        <div className="w-14 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Streak
        </div>
      </div>

      {/* Habit rows */}
      {habits.filter((h) => h.active).map((habit) => (
        <div key={habit.id} className="flex items-center gap-1">
          <div className="w-32 flex-shrink-0 text-sm truncate font-medium">{habit.name}</div>
          {days.map((d) => {
            const done = habit.logs.some((l) => l.log_date === d && l.completed);
            return (
              <button
                key={d}
                onClick={() => toggleHabitLog(habit.id, d)}
                className={cn(
                  "flex-1 aspect-square max-w-10 rounded-lg border transition-all",
                  done
                    ? "border-transparent"
                    : "border-border hover:border-accent/40"
                )}
                style={done ? { backgroundColor: habit.color + "33", borderColor: habit.color + "55" } : {}}
              >
                {done && (
                  <div
                    className="w-full h-full rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: habit.color + "44" }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: habit.color }}
                    />
                  </div>
                )}
              </button>
            );
          })}
          <div className="w-14 flex items-center justify-center gap-1 text-xs font-medium">
            {habit.streak > 0 && (
              <>
                <Flame className="w-3 h-3 text-warning" />
                <span className="text-warning">{habit.streak}</span>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
