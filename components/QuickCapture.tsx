"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import VoiceCapture from "./VoiceCapture";
import { cn } from "@/lib/cn";

interface QuickCaptureProps {
  onSubmit: (text: string) => void | Promise<void>;
  placeholder?: string;
  loading?: boolean;
}

export default function QuickCapture({
  onSubmit,
  placeholder = "What's on your mind?",
  loading = false,
}: QuickCaptureProps) {
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    if (!text.trim() || loading) return;
    await onSubmit(text.trim());
    setText("");
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border shadow-sm">
      <VoiceCapture
        onTranscript={(t) => {
          setText((prev) => (prev ? prev + " " + t : t));
        }}
      />
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        disabled={loading}
      />
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || loading}
        className={cn(
          "p-2.5 rounded-lg transition-colors",
          text.trim() && !loading
            ? "bg-accent text-accent-foreground hover:opacity-90"
            : "bg-muted text-muted-foreground"
        )}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </button>
    </div>
  );
}
