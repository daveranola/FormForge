import { NextResponse } from "next/server";
import { createSupaBaseClient } from "@/app/lib/supabase/server";

export async function POST() {
  const supabase = createSupaBaseClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
