import { NextRequest, NextResponse } from "next/server";
import { processThoughtWithAI } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, existingTasks } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const analysis = await processThoughtWithAI({
      content,
      existingTasks: existingTasks || [],
    });

    return NextResponse.json(analysis);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
