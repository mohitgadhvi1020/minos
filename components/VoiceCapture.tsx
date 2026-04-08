"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { transcribeAudio } from "@/lib/hooks";

interface VoiceCaptureProps {
  onTranscript: (text: string) => void;
  size?: "sm" | "lg";
}

export default function VoiceCapture({ onTranscript, size = "sm" }: VoiceCaptureProps) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setTranscribing(true);
        try {
          const text = await transcribeAudio(blob);
          onTranscript(text);
        } catch (err) {
          console.error("Transcription failed:", err);
        } finally {
          setTranscribing(false);
        }
      };

      recorder.start();
      mediaRecorder.current = recorder;
      setRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  }, [onTranscript]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
    setRecording(false);
  }, []);

  const isLg = size === "lg";

  if (transcribing) {
    return (
      <button
        disabled
        className={cn(
          "rounded-full bg-muted flex items-center justify-center",
          isLg ? "w-20 h-20" : "w-10 h-10"
        )}
      >
        <Loader2 className={cn("animate-spin text-accent", isLg ? "w-8 h-8" : "w-5 h-5")} />
      </button>
    );
  }

  return (
    <div className="relative">
      {recording && (
        <div
          className={cn(
            "absolute inset-0 rounded-full bg-danger/30 animate-pulse-ring",
            isLg ? "w-20 h-20" : "w-10 h-10"
          )}
        />
      )}
      <button
        onClick={recording ? stopRecording : startRecording}
        className={cn(
          "relative rounded-full flex items-center justify-center transition-all",
          recording
            ? "bg-danger text-white shadow-lg shadow-danger/25"
            : "bg-accent text-accent-foreground hover:opacity-90",
          isLg ? "w-20 h-20" : "w-10 h-10"
        )}
      >
        {recording ? (
          <MicOff className={isLg ? "w-8 h-8" : "w-5 h-5"} />
        ) : (
          <Mic className={isLg ? "w-8 h-8" : "w-5 h-5"} />
        )}
      </button>
    </div>
  );
}
