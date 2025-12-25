import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/app/generated/prisma";
import { createSupaBaseClient } from "@/app/lib/supabase/server";
import { createFieldSchema } from "@/app/lib/validation/createField";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const formIdNumber = Number(formId);
  if (!Number.isFinite(formIdNumber)) {
    return NextResponse.json({ error: "Invalid form id" }, { status: 400 });
  }

  const body = await request.json();
  const result = createFieldSchema.safeParse({ ...body, formId: formIdNumber });
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

  const form = await prisma.form.findFirst({
    where: {
      id: formIdNumber,
      project: { ownerId: user.id },
    },
  });

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  const existing = await prisma.field.findFirst({
    where: { formId: formIdNumber, key: result.data.key },
  });

  if (existing) {
    return NextResponse.json({ error: "Field key already exists" }, { status: 409 });
  }

  try {
    const field = await prisma.field.create({
      data: {
        formId: formIdNumber,
        key: result.data.key,
        label: result.data.label,
        type: result.data.type,
        required: result.data.required ?? false,
        orderIndex: result.data.orderIndex ?? 0,
        options:
          result.data.options === undefined
            ? undefined
            : ((result.data.options ?? Prisma.JsonNull) as Prisma.InputJsonValue),
        config:
          result.data.config === undefined
            ? undefined
            : ((result.data.config ?? Prisma.JsonNull) as Prisma.InputJsonValue),
      },
    });

    return NextResponse.json({ field }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create field" }, { status: 500 });
  }
}
