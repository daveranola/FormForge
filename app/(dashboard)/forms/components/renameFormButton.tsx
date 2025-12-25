'use client';

import { useRouter } from "next/navigation";

type RenameFormButtonProps = {
  formId: number;
  currentName: string;
};

export function RenameFormButton({ formId, currentName }: RenameFormButtonProps) {
  const router = useRouter();

  async function handleRename() {
    const nextName = window.prompt("New form name:", currentName);
    if (!nextName || nextName.trim() === currentName) return;

    const response = await fetch(`/api/forms/${formId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nextName.trim() }),
    });
    if (!response.ok) {
      const data = await response.json();
      window.alert(data.error || "Failed to update form.");
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
      onClick={handleRename}
    >
      Rename form
    </button>
  );
}
