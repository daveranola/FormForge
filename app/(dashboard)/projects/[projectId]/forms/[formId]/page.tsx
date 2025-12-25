import { notFound } from "next/navigation";
import { createSupaBaseClient } from "@/app/lib/supabase/server";
import { prisma } from "@/app/lib/prisma";
import { DeleteFormButton } from "@/app/(dashboard)/forms/components/deleteFormButton";
import { RenameFormButton } from "@/app/(dashboard)/forms/components/renameFormButton";
import { FormTabs } from "@/app/(dashboard)/forms/components/formTabs";

export default async function FormPage({
  params,
}: {
  params: Promise<{ projectId: string; formId: string }>;
}) {
  const { projectId, formId } = await params;
  const projectIdNumber = Number(projectId);
  const formIdNumber = Number(formId);

  if (!Number.isFinite(projectIdNumber) || !Number.isFinite(formIdNumber)) {
    notFound();
  }

  const supabase = createSupaBaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    notFound();
  }

  const form = await prisma.form.findFirst({
    where: {
      id: formIdNumber,
      projectId: projectIdNumber,
      project: { ownerId: user.id },
    },
    include: {
      fields: { orderBy: { orderIndex: "asc" } },
      submissions: { orderBy: { submittedAt: "desc" }, take: 25 },
    },
  });

  if (!form) {
    notFound();
  }

  const allSubmissions = await prisma.submission.findMany({
    where: { formId: form.id },
    orderBy: { submittedAt: "desc" },
    select: { answersJson: true },
  });

  type FieldOption = { label: string; value: string };

  function normalizeOptions(options: unknown): FieldOption[] {
    if (Array.isArray(options)) {
      return options
        .map((item) => {
          if (typeof item === "string") {
            return { label: item, value: item };
          }
          if (
            item &&
            typeof item === "object" &&
            "label" in item &&
            "value" in item
          ) {
            return {
              label: String((item as { label: unknown }).label),
              value: String((item as { value: unknown }).value),
            };
          }
          return null;
        })
        .filter((item): item is FieldOption => Boolean(item));
    }
    return [];
  }

  const insights = form.fields.map((field) => {
    const answers = allSubmissions.map(
      (submission) =>
        (submission.answersJson as Record<string, unknown>)[field.key]
    );
    const total = answers.length;
    let answered = 0;

    if (field.type === "checkbox") {
      let yes = 0;
      let no = 0;
      let missing = 0;

      for (const value of answers) {
        if (value === true) {
          yes += 1;
          answered += 1;
        } else if (value === false) {
          no += 1;
          answered += 1;
        } else {
          missing += 1;
        }
      }

      const breakdown = [
        { label: "Yes", count: yes },
        { label: "No", count: no },
      ];
      if (missing > 0) {
        breakdown.push({ label: "No answer", count: missing });
      }

      return {
        id: field.id,
        label: field.label,
        type: field.type,
        total,
        answered,
        breakdown,
      };
    }

    if (field.type === "select") {
      const options = normalizeOptions(field.options);
      const counts = new Map(options.map((option) => [option.value, 0]));
      let missing = 0;

      for (const value of answers) {
        if (typeof value === "string" && value.trim() !== "") {
          counts.set(value, (counts.get(value) ?? 0) + 1);
          answered += 1;
        } else {
          missing += 1;
        }
      }

      const breakdown = [
        ...options.map((option) => ({
          label: option.label,
          count: counts.get(option.value) ?? 0,
        })),
      ];

      for (const [value, count] of counts.entries()) {
        if (!options.some((option) => option.value === value)) {
          breakdown.push({ label: value, count });
        }
      }

      if (missing > 0) {
        breakdown.push({ label: "No answer", count: missing });
      }

      return {
        id: field.id,
        label: field.label,
        type: field.type,
        total,
        answered,
        breakdown,
      };
    }

    const responses: string[] = [];
    let numericCount = 0;
    let numericSum = 0;

    for (const value of answers) {
      if (value === null || value === undefined || value === "") {
        continue;
      }
      responses.push(String(value));
      const numericValue = typeof value === "number" ? value : Number(value);
      if (Number.isFinite(numericValue)) {
        numericCount += 1;
        numericSum += numericValue;
        answered += 1;
      } else {
        answered += 1;
      }
    }

    const average =
      field.type === "number" && numericCount > 0 ? numericSum / numericCount : null;

    return {
      id: field.id,
      label: field.label,
      type: field.type,
      total,
      answered,
      average,
      responses,
    };
  });

  const submissionsForView = form.submissions.map((submission) => ({
    id: submission.id,
    submittedAt: submission.submittedAt.toISOString(),
    answers: submission.answersJson as Record<string, unknown>,
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{form.name}</h1>
            <p className="text-sm text-gray-500">Form ID: {form.id}</p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600">
              Public link
              <a className="font-medium text-gray-900 hover:underline" href={`/forms/${form.slug}`}>
                /forms/{form.slug}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RenameFormButton formId={form.id} currentName={form.name} />
            <DeleteFormButton formId={form.id} projectId={projectIdNumber} />
          </div>
        </div>
      </div>

      <FormTabs
        formId={form.id}
        fields={form.fields.map((field) => ({
          id: field.id,
          key: field.key,
          label: field.label,
          type: field.type,
          required: field.required,
          orderIndex: field.orderIndex,
          options: field.options,
        }))}
        insights={insights}
        submissions={submissionsForView}
        totalSubmissions={allSubmissions.length}
      />
    </div>
  );
}
