import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createSupaBaseClient } from "@/app/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const formIdNumber = Number(formId);
  if (!Number.isFinite(formIdNumber)) {
    return NextResponse.json({ error: "Invalid form id" }, { status: 400 });
  }

  const body = await request.json();
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (name.length < 3 || name.length > 100) {
    return NextResponse.json({ error: "Invalid form name" }, { status: 400 });
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
    where: { id: formIdNumber, project: { ownerId: user.id } },
  });

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  try {
    const updated = await prisma.form.update({
      where: { id: formIdNumber },
      data: { name },
    });
    return NextResponse.json({ form: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update form" }, { status: 500 });
  }
}

export async function DELETE(
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
    where: { id: formIdNumber, project: { ownerId: user.id } },
  });

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  try {
    await prisma.form.delete({ where: { id: formIdNumber } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete form" }, { status: 500 });
  }
}
