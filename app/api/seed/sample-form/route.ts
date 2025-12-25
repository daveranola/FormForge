import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createSupaBaseClient } from "@/app/lib/supabase/server";
import { Prisma } from "@/app/generated/prisma";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  const body = await request.json();
  const projectId = Number(body.projectId);
  const ownerId = String(body.ownerId || "");
  const formName = String(body.formName || "University Event Registration");
  const projectName = String(body.projectName || "Sample Project");
  const createProject = Boolean(body.createProject);
  const submissionCount = Number(body.submissionCount ?? 8);
  const createProjectFlag = createProject || !Number.isFinite(projectId);

  if (!createProjectFlag && !Number.isFinite(projectId)) {
    return NextResponse.json(
      { error: "projectId is required when createProject is false" },
      { status: 400 }
    );
  }

  if (!ownerId) {
    return NextResponse.json(
      { error: "ownerId is required" },
      { status: 400 }
    );
  }

  const supabase = createSupaBaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || user.id !== ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = createProjectFlag
    ? await prisma.project.create({
        data: {
          name: projectName,
          ownerId,
        },
      })
    : await prisma.project.findFirst({
        where: { id: projectId, ownerId },
      });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const targetProjectId = project.id;
  const baseSlug = slugify(formName) || `form-${Date.now().toString(36)}`;
  let slug = baseSlug;
  const existing = await prisma.form.findFirst({ where: { slug } });
  if (existing) {
    slug = `${baseSlug}-${Date.now().toString(36)}`;
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const form = await tx.form.create({
        data: {
          name: formName,
          slug,
          projectId: targetProjectId,
        },
      });

      await tx.field.createMany({
        data: [
          {
            formId: form.id,
            key: "full_name",
            label: "Full name",
            type: "text",
            required: true,
            orderIndex: 0,
          },
          {
            formId: form.id,
            key: "email",
            label: "Email address",
            type: "email",
            required: true,
            orderIndex: 1,
          },
          {
            formId: form.id,
            key: "major",
            label: "Major",
            type: "text",
            required: false,
            orderIndex: 2,
          },
          {
            formId: form.id,
            key: "grad_year",
            label: "Graduation year",
            type: "number",
            required: false,
            orderIndex: 3,
          },
          {
            formId: form.id,
            key: "attendance_type",
            label: "Attendance type",
            type: "select",
            required: true,
            orderIndex: 4,
            options: [
              { label: "In person", value: "in_person" },
              { label: "Virtual", value: "virtual" },
            ] as Prisma.InputJsonValue,
          },
          {
            formId: form.id,
            key: "dietary",
            label: "Dietary restrictions",
            type: "textarea",
            required: false,
            orderIndex: 5,
          },
          {
            formId: form.id,
            key: "consent",
            label: "I agree to the code of conduct",
            type: "checkbox",
            required: true,
            orderIndex: 6,
          },
        ],
      });

      const sampleSubmissions = Array.from(
        { length: Math.max(3, Number.isFinite(submissionCount) ? submissionCount : 8) },
        (_, index) => {
          const isEven = index % 2 === 0;
          const gradYear = 2025 + (index % 4);
          return {
            formId: form.id,
            answersJson: {
              full_name: `Sample Student ${index + 1}`,
              email: `student${index + 1}@example.com`,
              major: isEven ? "Computer Science" : "Business",
              grad_year: gradYear,
              attendance_type: isEven ? "in_person" : "virtual",
              dietary: isEven ? "Vegetarian" : "",
              consent: true,
            } as Prisma.InputJsonValue,
          };
        }
      );

      await tx.submission.createMany({ data: sampleSubmissions });

      return { form };
    });

    return NextResponse.json(
      {
        form: result.form,
        publicUrl: `/forms/${slug}`,
        project: { id: project.id, name: project.name },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to seed sample form" },
      { status: 500 }
    );
  }
}
