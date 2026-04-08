"use client";

import useSWR, { mutate, type Fetcher } from "swr";
import type {
  Task,
  Thought,
  Habit,
  HabitWithLogs,
  CoreIdentity,
  DailyGoal,
  TaskLink,
} from "./types";

function getSettings() {
  if (typeof window === "undefined") {
    return {
      supabaseUrl: "",
      supabaseAnonKey: "",
    };
  }
  return {
    supabaseUrl: localStorage.getItem("mindos_supabase_url") || "",
    supabaseAnonKey: localStorage.getItem("mindos_supabase_anon_key") || "",
  };
}

function supabaseHeaders() {
  const s = getSettings();
  return {
    "x-supabase-url": s.supabaseUrl,
    "x-supabase-anon-key": s.supabaseAnonKey,
  };
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { ...supabaseHeaders(), "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

// --- Thoughts ---
export function useThoughts() {
  const fetcher: Fetcher<Thought[], string> = () => apiFetch<Thought[]>("/api/thoughts");
  return useSWR("thoughts", fetcher);
}

export async function createThought(content: string, source: "text" | "voice") {
  const thought = await apiFetch<Thought>("/api/thoughts", {
    method: "POST",
    body: JSON.stringify({ content, source }),
  });
  mutate("thoughts");
  return thought;
}

// --- Tasks ---
export function useTasks() {
  const fetcher: Fetcher<Task[], string> = () => apiFetch<Task[]>("/api/tasks");
  return useSWR("tasks", fetcher);
}

export async function createTask(task: Partial<Task>) {
  const created = await apiFetch<Task>("/api/tasks", {
    method: "POST",
    body: JSON.stringify(task),
  });
  mutate("tasks");
  return created;
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const updated = await apiFetch<Task>(`/api/tasks?id=${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  mutate("tasks");
  return updated;
}

export async function deleteTask(id: string) {
  await apiFetch(`/api/tasks?id=${id}`, { method: "DELETE" });
  mutate("tasks");
}

// --- Task Links ---
export function useTaskLinks() {
  const fetcher: Fetcher<TaskLink[], string> = () => apiFetch<TaskLink[]>("/api/tasks?links=true");
  return useSWR("task-links", fetcher);
}

export async function createTaskLink(link: Omit<TaskLink, "id">) {
  const created = await apiFetch<TaskLink>("/api/tasks?links=true", {
    method: "POST",
    body: JSON.stringify(link),
  });
  mutate("task-links");
  return created;
}

// --- Habits ---
export function useHabits() {
  const fetcher: Fetcher<HabitWithLogs[], string> = () => apiFetch<HabitWithLogs[]>("/api/habits");
  return useSWR("habits", fetcher);
}

export async function createHabit(habit: Partial<Habit>) {
  const created = await apiFetch<Habit>("/api/habits", {
    method: "POST",
    body: JSON.stringify(habit),
  });
  mutate("habits");
  return created;
}

export async function updateHabit(id: string, updates: Partial<Habit>) {
  const updated = await apiFetch<Habit>(`/api/habits?id=${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  mutate("habits");
  return updated;
}

export async function toggleHabitLog(habitId: string, date: string) {
  await apiFetch("/api/habits", {
    method: "PUT",
    body: JSON.stringify({ habit_id: habitId, log_date: date }),
  });
  mutate("habits");
}

// --- Daily Goals ---
export function useDailyGoals(date: string) {
  const fetcher: Fetcher<DailyGoal, string> = () =>
    apiFetch<DailyGoal>(`/api/thoughts?daily_goals=true&date=${date}`);
  return useSWR(`daily-goals-${date}`, fetcher);
}

export async function saveDailyGoals(date: string, goals: DailyGoal["goals"], reflection?: string) {
  await apiFetch("/api/thoughts?daily_goals=true", {
    method: "POST",
    body: JSON.stringify({ goal_date: date, goals, reflection }),
  });
  mutate(`daily-goals-${date}`);
}

// --- Core Identity ---
export function useIdentity() {
  const fetcher: Fetcher<CoreIdentity[], string> = () => apiFetch<CoreIdentity[]>("/api/thoughts?identity=true");
  return useSWR("identity", fetcher);
}

export async function saveIdentityTrait(trait: Partial<CoreIdentity>) {
  const saved = await apiFetch<CoreIdentity>("/api/thoughts?identity=true", {
    method: "POST",
    body: JSON.stringify(trait),
  });
  mutate("identity");
  return saved;
}

export async function deleteIdentityTrait(id: string) {
  await apiFetch(`/api/thoughts?identity=true&id=${id}`, { method: "DELETE" });
  mutate("identity");
}

// --- AI Processing ---
export async function processWithAI(content: string, existingTasks: Pick<Task, "id" | "title" | "description">[]) {
  return apiFetch("/api/ai/process", {
    method: "POST",
    body: JSON.stringify({ content, existingTasks }),
  });
}

// --- Whisper ---
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");

  const res = await fetch("/api/whisper", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Transcription failed");
  }

  const data = await res.json();
  return data.text;
}
