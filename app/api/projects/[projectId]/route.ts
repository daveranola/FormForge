import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createSupaBaseClient } from "@/app/lib/supabase/server";
import { createProjectSchema } from "@/app/lib/validation/createProject";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const projectIdNumber = Number(projectId);
  if (!Number.isFinite(projectIdNumber)) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
  }

  const body = await request.json();
  const result = createProjectSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid project data", details: result.error.issues },
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

  const project = await prisma.project.findFirst({
    where: { id: projectIdNumber, ownerId: user.id },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    const updated = await prisma.project.update({
      where: { id: projectIdNumber },
      data: { name: result.data.name },
    });
    return NextResponse.json({ project: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const projectIdNumber = Number(projectId);
  if (!Number.isFinite(projectIdNumber)) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
  }

  const supabase = createSupaBaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findFirst({
    where: { id: projectIdNumber, ownerId: user.id },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    await prisma.$transaction([
      prisma.form.deleteMany({ where: { projectId: projectIdNumber } }),
      prisma.project.delete({ where: { id: projectIdNumber } }),
    ]);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
