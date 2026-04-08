"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Settings, ArrowRight, X } from "lucide-react";

export default function SetupBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if the API is working by making a test request
    fetch("/api/tasks")
      .then((res) => {
        if (!res.ok) setShow(true);
      })
      .catch(() => setShow(true));
  }, []);

  if (!show) return null;

  return (
    <div className="relative p-4 bg-accent/10 border border-accent/20 rounded-xl animate-fade-in">
      <button
        onClick={() => setShow(false)}
        className="absolute top-3 right-3 p-1 rounded hover:bg-accent/10"
      >
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent/10">
          <Settings className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Setup Required</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Database connection failed. Check your Supabase configuration in <code className="text-accent">.env.local</code>.
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-medium text-accent hover:underline"
          >
            Go to Settings <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
