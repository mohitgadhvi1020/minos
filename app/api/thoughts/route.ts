import { NextRequest, NextResponse } from "next/server";
import { getSupabaseFromHeaders } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseFromHeaders(req.headers);
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 400 });
    }

    const url = new URL(req.url);

    if (url.searchParams.get("identity") === "true") {
      const { data, error } = await supabase
        .from("core_identity")
        .select("*")
        .order("category")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (url.searchParams.get("daily_goals") === "true") {
      const date = url.searchParams.get("date") || new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("daily_goals")
        .select("*")
        .eq("goal_date", date)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return NextResponse.json(data || { goal_date: date, goals: [], reflection: null });
    }

    const { data, error } = await supabase
      .from("thoughts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
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

    if (url.searchParams.get("identity") === "true") {
      if (body.id) {
        const { data, error } = await supabase
          .from("core_identity")
          .update({ category: body.category, trait: body.trait, value: body.value, updated_at: new Date().toISOString() })
          .eq("id", body.id)
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json(data);
      }
      const { data, error } = await supabase
        .from("core_identity")
        .insert({ category: body.category, trait: body.trait, value: body.value })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (url.searchParams.get("daily_goals") === "true") {
      const { data: existing } = await supabase
        .from("daily_goals")
        .select("id")
        .eq("goal_date", body.goal_date)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from("daily_goals")
          .update({ goals: body.goals, reflection: body.reflection })
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json(data);
      }

      const { data, error } = await supabase
        .from("daily_goals")
        .insert({ goal_date: body.goal_date, goals: body.goals, reflection: body.reflection })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(data);
    }

    const { data, error } = await supabase
      .from("thoughts")
      .insert({
        content: body.content,
        type: body.type || "thought",
        source: body.source || "text",
        ai_analysis: body.ai_analysis || null,
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

export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabaseFromHeaders(req.headers);
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 400 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    if (url.searchParams.get("identity") === "true") {
      const { error } = await supabase.from("core_identity").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase.from("thoughts").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? (e as { message: string }).message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
