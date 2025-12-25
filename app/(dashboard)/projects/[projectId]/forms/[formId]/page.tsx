import { notFound } from "next/navigation";
import { createSupaBaseClient } from "@/app/lib/supabase/server";
import { prisma } from "@/app/lib/prisma";

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
      </div>

      <div>
        <h2 className="text-lg font-semibold">Fields</h2>
        {form.fields.length === 0 ? (
          <p>No fields yet.</p>
        ) : (
          <ul className="space-y-2">
            {form.fields.map((field) => (
              <li key={field.id}>
                {field.label} ({field.type})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
