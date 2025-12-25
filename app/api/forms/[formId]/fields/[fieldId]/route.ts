import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/app/generated/prisma";
import { createSupaBaseClient } from "@/app/lib/supabase/server";
import { updateFieldSchema } from "@/app/lib/validation/createField";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ formId: string; fieldId: string }> }
) {
  const { formId, fieldId } = await params;
  const formIdNumber = Number(formId);
  const fieldIdNumber = Number(fieldId);

  if (!Number.isFinite(formIdNumber) || !Number.isFinite(fieldIdNumber)) {
    return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
  }

  const body = await request.json();
  const result = updateFieldSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid field data", details: result.error.issues },
      { status: 400 }
    );
  }

  const supabase = createSupaBaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const field = await prisma.field.findFirst({
    where: {
      id: fieldIdNumber,
      formId: formIdNumber,
      form: { project: { ownerId: user.id } },
    },
  });

  if (!field) {
    return NextResponse.json({ error: "Field not found" }, { status: 404 });
  }

  const data: Prisma.FieldUpdateInput = {
    label: result.data.label,
    type: result.data.type,
    required: result.data.required,
    orderIndex: result.data.orderIndex,
    options:
      result.data.options === undefined
        ? undefined
        : ((result.data.options ?? Prisma.JsonNull) as Prisma.InputJsonValue),
    config:
      result.data.config === undefined
        ? undefined
        : ((result.data.config ?? Prisma.JsonNull) as Prisma.InputJsonValue),
  };

  try {
    const updated = await prisma.field.update({
      where: { id: fieldIdNumber },
      data,
    });
    return NextResponse.json({ field: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update field" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ formId: string; fieldId: string }> }
) {
  const { formId, fieldId } = await params;
  const formIdNumber = Number(formId);
  const fieldIdNumber = Number(fieldId);

  if (!Number.isFinite(formIdNumber) || !Number.isFinite(fieldIdNumber)) {
    return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
  }

  const supabase = createSupaBaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const field = await prisma.field.findFirst({
    where: {
      id: fieldIdNumber,
      formId: formIdNumber,
      form: { project: { ownerId: user.id } },
    },
  });

  if (!field) {
    return NextResponse.json({ error: "Field not found" }, { status: 404 });
  }

  try {
    await prisma.field.delete({ where: { id: fieldIdNumber } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete field" }, { status: 500 });
  }
}
