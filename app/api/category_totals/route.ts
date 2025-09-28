// app/api/category_totals/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();

  try {
    const [pushRes, pullRes, legsRes] = await Promise.all([
      supabase
        .from("Skills")
        .select("total:sum(difficulty)")
        .eq("category", "Push"),
      supabase
        .from("Skills")
        .select("total:sum(difficulty)")
        .eq("category", "Pull"),
      supabase
        .from("Skills")
        .select("total:sum(difficulty)")
        .eq("category", "Legs"),
    ]);

    if (pushRes.error || pullRes.error || legsRes.error) {
      throw new Error(
        pushRes.error?.message ||
          pullRes.error?.message ||
          legsRes.error?.message
      );
    }

    return NextResponse.json({
      push: pushRes.data?.[0]?.total ?? 0,
      pull: pullRes.data?.[0]?.total ?? 0,
      legs: legsRes.data?.[0]?.total ?? 0,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
