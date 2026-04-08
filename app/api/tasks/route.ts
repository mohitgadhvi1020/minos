import { NextRequest, NextResponse } from "next/server";
import { getSupabaseFromHeaders } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseFromHeaders(req.headers);
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 400 });
    }

    const url = new URL(req.url);

    if (url.searchParams.get("links") === "true") {
      const { data, error } = await supabase.from("task_links").select("*");
      if (error) throw error;
      return NextResponse.json(data);
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? (e as { message: string }).message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseFromHeaders(req.headers);
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 400 });
    }

    const url = new URL(req.url);
    const body = await req.json();

    if (url.searchParams.get("links") === "true") {
      const { data, error } = await supabase
        .from("task_links")
        .insert({
          source_task_id: body.source_task_id,
          target_task_id: body.target_task_id,
          relationship: body.relationship || "related",
        })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(data);
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        thought_id: body.thought_id || null,
        title: body.title,
        description: body.description || null,
        priority: body.priority || "medium",
        status: body.status || "todo",
        follow_up: body.follow_up || null,
        due_date: body.due_date || null,
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? (e as { message: string }).message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabaseFromHeaders(req.headers);
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 400 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const body = await req.json();
    const { data, error } = await supabase
      .from("tasks")
      .update(body)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? (e as { message: string }).message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabaseFromHeaders(req.headers);
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 400 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? (e as { message: string }).message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
