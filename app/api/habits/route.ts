import { NextRequest, NextResponse } from "next/server";
import { getSupabaseFromHeaders } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseFromHeaders(req.headers);
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 400 });
    }

    const { data: habits, error: hErr } = await supabase
      .from("habits")
      .select("*")
      .order("created_at", { ascending: true });
    if (hErr) throw hErr;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: logs, error: lErr } = await supabase
      .from("habit_logs")
      .select("*")
      .gte("log_date", thirtyDaysAgo.toISOString().split("T")[0]);
    if (lErr) throw lErr;

    const habitsWithLogs = (habits || []).map((habit) => {
      const habitLogs = (logs || []).filter((l) => l.habit_id === habit.id);
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        if (habitLogs.some((l) => l.log_date === dateStr && l.completed)) {
          streak++;
        } else {
          break;
        }
      }
      return { ...habit, logs: habitLogs, streak };
    });

    return NextResponse.json(habitsWithLogs);
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

    const body = await req.json();
    const { data, error } = await supabase
      .from("habits")
      .insert({
        name: body.name,
        frequency: body.frequency || "daily",
        color: body.color || "#6366f1",
        active: body.active !== false,
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

export async function PUT(req: NextRequest) {
  try {
    const supabase = getSupabaseFromHeaders(req.headers);
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 400 });
    }

    const body = await req.json();
    const { habit_id, log_date } = body;

    const { data: existing } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("habit_id", habit_id)
      .eq("log_date", log_date)
      .single();

    if (existing) {
      if (existing.completed) {
        const { error } = await supabase.from("habit_logs").delete().eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("habit_logs")
          .update({ completed: true })
          .eq("id", existing.id);
        if (error) throw error;
      }
    } else {
      const { error } = await supabase
        .from("habit_logs")
        .insert({ habit_id, log_date, completed: true });
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
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
      .from("habits")
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
