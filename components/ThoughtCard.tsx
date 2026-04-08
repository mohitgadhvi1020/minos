"use client";

import { Mic, Type, Brain } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Thought } from "@/lib/types";

interface ThoughtCardProps {
  thought: Thought;
}

const TYPE_ICONS: Record<string, string> = {
  thought: "bg-accent/10 text-accent",
  task: "bg-warning/10 text-warning",
  reflection: "bg-success/10 text-success",
  goal: "bg-danger/10 text-danger",
  habit: "bg-purple-500/10 text-purple-500",
};

export default function ThoughtCard({ thought }: ThoughtCardProps) {
  const timeAgo = getTimeAgo(thought.created_at);

  return (
    <div className="p-3 border border-border rounded-lg space-y-2 animate-fade-in hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-2">
        <div className={cn("p-1 rounded", TYPE_ICONS[thought.type] || TYPE_ICONS.thought)}>
          {thought.source === "voice" ? <Mic className="w-3 h-3" /> : <Type className="w-3 h-3" />}
        </div>
        <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
          {thought.type}
        </span>
        <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo}</span>
      </div>
      <p className="text-sm leading-relaxed">{thought.content}</p>
      {thought.ai_analysis && (
        <div className="flex items-center gap-1.5 text-[10px] text-accent">
          <Brain className="w-3 h-3" />
          AI analyzed
        </div>
      )}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
