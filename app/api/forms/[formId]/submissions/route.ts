import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createSupaBaseClient } from "@/app/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const formIdNumber = Number(formId);
  if (!Number.isFinite(formIdNumber)) {
    return NextResponse.json({ error: "Invalid form id" }, { status: 400 });
  }

  const supabase = createSupaBaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await prisma.form.findFirst({
    where: {
      id: formIdNumber,
      project: { ownerId: user.id },
    },
  });

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  const submissions = await prisma.submission.findMany({
    where: { formId: formIdNumber },
    orderBy: { submittedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ submissions }, { status: 200 });
}
