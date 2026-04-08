"use client";

import { useState } from "react";
import { Plus, X, Pencil, Trash2, Heart, Brain, Target, Shield } from "lucide-react";
import { cn } from "@/lib/cn";
import { useIdentity, saveIdentityTrait, deleteIdentityTrait } from "@/lib/hooks";
import type { IdentityCategory } from "@/lib/types";

const CATEGORIES: { value: IdentityCategory; label: string; icon: typeof Heart; description: string }[] = [
  { value: "values", label: "Values", icon: Heart, description: "What matters most to you" },
  { value: "personality", label: "Personality", icon: Brain, description: "Who you are at your core" },
  { value: "goals", label: "Life Goals", icon: Target, description: "Where you're headed" },
  { value: "principles", label: "Principles", icon: Shield, description: "Rules you live by" },
];

export default function IdentityPage() {
  const { data: traits } = useIdentity();
  const [adding, setAdding] = useState<IdentityCategory | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [traitName, setTraitName] = useState("");
  const [traitValue, setTraitValue] = useState("");

  async function handleSave(category: IdentityCategory) {
    if (!traitName.trim()) return;
    await saveIdentityTrait({
      id: editingId || undefined,
      category,
      trait: traitName.trim(),
      value: traitValue.trim() || null,
    });
    resetForm();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this trait?")) return;
    await deleteIdentityTrait(id);
  }

  function resetForm() {
    setAdding(null);
    setEditingId(null);
    setTraitName("");
    setTraitValue("");
  }

  function startEdit(trait: { id: string; category: IdentityCategory; trait: string; value: string | null }) {
    setEditingId(trait.id);
    setAdding(trait.category);
    setTraitName(trait.trait);
    setTraitValue(trait.value || "");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Core Self</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Define who you are. Your values, personality, goals, and principles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CATEGORIES.map(({ value: category, label, icon: Icon, description }) => {
          const categoryTraits = (traits || []).filter((t) => t.category === category);
          const isAdding = adding === category;

          return (
            <div key={category} className="border border-border rounded-xl bg-card overflow-hidden">
              {/* Category header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{label}</h3>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (isAdding) resetForm();
                    else { setAdding(category); setEditingId(null); setTraitName(""); setTraitValue(""); }
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>

              {/* Traits list */}
              <div className="p-4 space-y-2">
                {categoryTraits.map((trait) => (
                  <div
                    key={trait.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg group hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{trait.trait}</p>
                      {trait.value && (
                        <p className="text-xs text-muted-foreground mt-0.5">{trait.value}</p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(trait)}
                        className="p-1 rounded hover:bg-muted"
                      >
                        <Pencil className="w-3 h-3 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(trait.id)}
                        className="p-1 rounded hover:bg-muted"
                      >
                        <Trash2 className="w-3 h-3 text-danger" />
                      </button>
                    </div>
                  </div>
                ))}

                {categoryTraits.length === 0 && !isAdding && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No {label.toLowerCase()} defined yet
                  </p>
                )}

                {/* Add/Edit form */}
                {isAdding && (
                  <div className="space-y-2 p-2.5 border border-accent/20 rounded-lg bg-accent/5 animate-fade-in">
                    <input
                      type="text"
                      value={traitName}
                      onChange={(e) => setTraitName(e.target.value)}
                      placeholder={`${label.slice(0, -1)} name...`}
                      className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
                      autoFocus
                    />
                    <textarea
                      value={traitValue}
                      onChange={(e) => setTraitValue(e.target.value)}
                      placeholder="Description (optional)..."
                      rows={2}
                      className="w-full bg-muted/50 rounded-lg p-2 text-xs outline-none resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={resetForm}
                        className="px-3 py-1 rounded-lg text-xs text-muted-foreground hover:bg-muted"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave(category)}
                        disabled={!traitName.trim()}
                        className="px-3 py-1 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50"
                      >
                        {editingId ? "Update" : "Add"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
