import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { PublicForm } from "@/app/forms/components/publicForm";

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const form = await prisma.form.findFirst({
    where: { slug },
    include: { fields: { orderBy: { orderIndex: "asc" } } },
  });

  if (!form) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{form.name}</h1>
        <p className="text-gray-700">Fill out the form below.</p>
      </div>
      <PublicForm
        slug={form.slug}
        fields={form.fields.map((field) => ({
          id: field.id,
          key: field.key,
          label: field.label,
          type: field.type,
          required: field.required,
          options: field.options,
        }))}
      />
    </div>
  );
}
