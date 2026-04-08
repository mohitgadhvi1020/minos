"use client";

import { useState, useEffect } from "react";
import { Save, Eye, EyeOff, ExternalLink, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [showKeys, setShowKeys] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSupabaseUrl(localStorage.getItem("mindos_supabase_url") || "");
    setSupabaseAnonKey(localStorage.getItem("mindos_supabase_anon_key") || "");
  }, []);

  function handleSave() {
    localStorage.setItem("mindos_supabase_url", supabaseUrl);
    localStorage.setItem("mindos_supabase_anon_key", supabaseAnonKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your database connection and preferences.
        </p>
      </div>

      {/* Supabase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Supabase Database</h2>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-accent hover:underline"
          >
            Dashboard <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground font-medium block mb-1.5">
              Project URL
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium block mb-1.5">
              Anon Key
            </label>
            <div className="relative">
              <input
                type={showKeys ? "text" : "password"}
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full px-3 py-2 pr-10 bg-muted/50 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>
        </div>
        <div className="p-3 bg-accent/5 border border-accent/10 rounded-lg text-xs text-muted-foreground">
          After creating your Supabase project, run the SQL from <code className="text-accent">supabase/schema.sql</code> in the SQL Editor to create all tables.
        </div>
      </section>

      {/* AI Provider Info */}
      <section className="space-y-4">
        <h2 className="font-semibold">AI Provider</h2>
        <div className="p-4 rounded-xl border border-border bg-accent/5">
          <div className="font-medium text-sm">Google Gemini via Vertex AI</div>
          <p className="text-xs text-muted-foreground mt-1">
            AI processing and voice transcription are handled server-side via Vertex AI. No client-side API keys needed.
          </p>
        </div>
      </section>

      {/* Keys toggle */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Key Visibility</h2>
          <button
            onClick={() => setShowKeys(!showKeys)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            {showKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showKeys ? "Hide" : "Show"}
          </button>
        </div>
      </section>

      {/* Theme */}
      <section className="space-y-4">
        <h2 className="font-semibold">Appearance</h2>
        <div className="flex gap-3">
          {(["dark", "light", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl border text-sm font-medium capitalize transition-all",
                theme === t
                  ? "border-accent bg-accent/5 text-accent"
                  : "border-border text-muted-foreground hover:border-accent/30"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* Save */}
      <div className="pt-4 border-t border-border">
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
            saved
              ? "bg-success text-white"
              : "bg-accent text-accent-foreground hover:opacity-90"
          )}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
