import { notFound } from "next/navigation";
import { createSupaBaseClient } from "@/app/lib/supabase/server";
import { prisma } from "@/app/lib/prisma";
import { FieldManager } from "@/app/(dashboard)/forms/components/fieldManager";

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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{form.name}</h1>
        <p className="text-gray-700">Form ID: {form.id}</p>
        <p className="text-gray-700">
          Public URL: <a className="text-blue-600 underline" href={`/forms/${form.slug}`}>/forms/{form.slug}</a>
        </p>
      </div>

      <div>
        <FieldManager
          formId={form.id}
          initialFields={form.fields.map((field) => ({
            id: field.id,
            key: field.key,
            label: field.label,
            type: field.type,
            required: field.required,
            orderIndex: field.orderIndex,
          }))}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold">Submissions</h2>
        {form.submissions.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          <div className="space-y-4">
            {form.submissions.map((submission) => (
              <div key={submission.id} className="rounded border bg-white p-3">
                <div className="text-sm text-gray-600">
                  Submitted: {submission.submittedAt.toISOString()}
                </div>
                <dl className="mt-2 space-y-1">
                  {form.fields.map((field) => (
                    <div key={field.id} className="flex gap-3 text-sm">
                      <dt className="w-40 font-medium">{field.label}</dt>
                      <dd className="flex-1 text-gray-800">
                        {String(
                          (submission.answersJson as Record<string, unknown>)[
                            field.key
                          ] ?? ""
                        ) || "—"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
