'use client';

import { useRouter } from "next/navigation";

type DeleteFormButtonProps = {
  formId: number;
  projectId: number;
};

export function DeleteFormButton({ formId, projectId }: DeleteFormButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this form? All fields and submissions will be removed."
    );
    if (!confirmed) return;

    const response = await fetch(`/api/forms/${formId}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json();
      window.alert(data.error || "Failed to delete form.");
      return;
    }

    router.push(`/projects/${projectId}`);
    router.refresh();
  }

  return (
    <button
      type="button"
      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:border-red-300 hover:bg-red-50"
      onClick={handleDelete}
    >
      Delete form
    </button>
  );
}
