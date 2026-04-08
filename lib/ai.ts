import { GoogleGenAI } from "@google/genai";
import { writeFileSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import type { Task } from "./types";

const MODEL = "gemini-2.5-pro";

let _ai: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!_ai) {
    // If GOOGLE_APPLICATION_CREDENTIALS_JSON is set (Vercel), write it to a temp file
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const credPath = join(tmpdir(), "gcp-credentials.json");
      if (!existsSync(credPath)) {
        writeFileSync(credPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      }
      process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;
    }

    _ai = new GoogleGenAI({
      vertexai: true,
      project: process.env.GOOGLE_CLOUD_PROJECT!,
      location: process.env.GOOGLE_CLOUD_LOCATION!,
    });
  }
  return _ai;
}

const SYSTEM_PROMPT = `You are MindOS, a personal thought assistant. Analyze the user's thought and return structured JSON.

Your job:
1. Classify the thought type: "thought", "task", "reflection", "goal", or "habit"
2. Extract any actionable tasks from the thought
3. For each task, suggest a priority (high/medium/low) and a follow-up action
4. If existing tasks are provided, identify any that relate to this thought

Return ONLY valid JSON in this exact format:
{
  "type": "thought|task|reflection|goal|habit",
  "summary": "Brief one-line summary of the thought",
  "tasks": [
    {
      "title": "Short task title",
      "description": "What needs to be done",
      "priority_suggestion": "high|medium|low",
      "follow_up_suggestion": "Next concrete step after this task",
      "linked_task_ids": ["id-of-related-existing-task"]
    }
  ]
}

If there are no actionable tasks, return an empty tasks array.
Be concise. Think about what truly matters for getting things done.`;

interface ProcessThoughtRequest {
  content: string;
  existingTasks: Pick<Task, "id" | "title" | "description">[];
}

export async function processThoughtWithAI(req: ProcessThoughtRequest) {
  const userMessage = `My thought: "${req.content}"

${req.existingTasks.length > 0
    ? `Existing tasks for reference:\n${req.existingTasks.map((t) => `- [${t.id}] ${t.title}: ${t.description || "no description"}`).join("\n")}`
    : "No existing tasks yet."
  }`;

  const response = await getAI().models.generateContent({
    model: MODEL,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.3,
      responseMimeType: "application/json",
    },
    contents: userMessage,
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini");
  }

  return JSON.parse(text);
}