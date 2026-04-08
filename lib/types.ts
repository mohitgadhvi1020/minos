export type ThoughtType = "thought" | "task" | "reflection" | "goal" | "habit";
export type ThoughtSource = "text" | "voice";
export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskRelationship = "leads_to" | "depends_on" | "related";
export type HabitFrequency = "daily" | "weekly";
export type IdentityCategory = "values" | "personality" | "goals" | "principles";

export interface Thought {
  id: string;
  content: string;
  type: ThoughtType;
  source: ThoughtSource;
  ai_analysis: AIAnalysis | null;
  created_at: string;
}

export interface AIAnalysis {
  type: ThoughtType;
  tasks: AITaskSuggestion[];
  summary: string;
}

export interface AITaskSuggestion {
  title: string;
  description: string;
  priority_suggestion: TaskPriority;
  follow_up_suggestion: string;
  linked_task_ids: string[];
}

export interface Task {
  id: string;
  thought_id: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  follow_up: string | null;
  due_date: string | null;
  created_at: string;
}

export interface TaskLink {
  id: string;
  source_task_id: string;
  target_task_id: string;
  relationship: TaskRelationship;
}

export interface Habit {
  id: string;
  name: string;
  frequency: HabitFrequency;
  color: string;
  active: boolean;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  log_date: string;
  completed: boolean;
}

export interface HabitWithLogs extends Habit {
  logs: HabitLog[];
  streak: number;
}

export interface CoreIdentity {
  id: string;
  category: IdentityCategory;
  trait: string;
  value: string | null;
  updated_at: string;
}

export interface DailyGoal {
  id: string;
  goal_date: string;
  goals: GoalItem[];
  reflection: string | null;
  created_at: string;
}

export interface GoalItem {
  text: string;
  done: boolean;
}

export interface AppSettings {
  supabaseUrl: string;
  supabaseAnonKey: string;
  theme: "dark" | "light" | "system";
}
