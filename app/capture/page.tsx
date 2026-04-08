"use client";

import { useState } from "react";
import { Mic, Type, Sparkles, Clock } from "lucide-react";
import VoiceCapture from "@/components/VoiceCapture";
import AIProcessingDialog from "@/components/AIProcessingDialog";
import ThoughtCard from "@/components/ThoughtCard";
import { useThoughts } from "@/lib/hooks";

export default function CapturePage() {
  const { data: thoughts } = useThoughts();
  const [text, setText] = useState("");
  const [processing, setProcessing] = useState<{ content: string; source: "text" | "voice" } | null>(null);
  const [mode, setMode] = useState<"voice" | "text">("voice");

  function handleProcess() {
    if (!text.trim()) return;
    setProcessing({ content: text.trim(), source: "text" });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Brain Dump</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Capture whatever&apos;s on your mind. Speak or type freely.
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("voice")}
          className={
            mode === "voice"
              ? "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-accent/10 text-accent"
              : "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
          }
        >
          <Mic className="w-4 h-4" />
          Voice
        </button>
        <button
          onClick={() => setMode("text")}
          className={
            mode === "text"
              ? "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-accent/10 text-accent"
              : "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
          }
        >
          <Type className="w-4 h-4" />
          Text
        </button>
      </div>

      {/* Capture area */}
      <div className="border border-border rounded-2xl p-8 bg-card">
        {mode === "voice" ? (
          <div className="flex flex-col items-center gap-6">
            <p className="text-sm text-muted-foreground">Tap to start recording</p>
            <VoiceCapture
              size="lg"
              onTranscript={(t) => {
                setText((prev) => (prev ? prev + " " + t : t));
              }}
            />
            {text && (
              <div className="w-full mt-4 space-y-3">
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Transcript
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  className="w-full bg-muted/50 rounded-xl p-4 text-sm outline-none resize-none leading-relaxed"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Let your thoughts flow freely. Write about anything — tasks, ideas, reflections, goals..."
              className="w-full bg-transparent text-base outline-none resize-none leading-relaxed placeholder:text-muted-foreground/50"
              autoFocus
            />
          </div>
        )}

        {text.trim() && (
          <div className="flex justify-end mt-4 pt-4 border-t border-border">
            <button
              onClick={handleProcess}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              Process with AI
            </button>
          </div>
        )}
      </div>

      {/* AI Processing Dialog */}
      {processing && (
        <AIProcessingDialog
          content={processing.content}
          source={processing.source}
          onClose={() => setProcessing(null)}
          onComplete={() => {
            setProcessing(null);
            setText("");
          }}
        />
      )}

      {/* Recent thoughts */}
      {thoughts && thoughts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">Recent Captures</h2>
          </div>
          <div className="space-y-2">
            {thoughts.slice(0, 10).map((thought) => (
              <ThoughtCard key={thought.id} thought={thought} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
