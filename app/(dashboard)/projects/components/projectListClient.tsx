'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";

type Project = {
  id: number;
  name: string;
};

type ProjectListClientProps = {
  projects: Project[];
};

export function ProjectListClient({ projects }: ProjectListClientProps) {
  const router = useRouter();

  async function handleDelete(projectId: number) {
    const confirmed = window.confirm(
      "Delete this project? All forms and submissions will be removed."
    );
    if (!confirmed) return;

    const response = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const data = await response.json();
      window.alert(data.error || "Failed to delete project.");
      return;
    }

    router.refresh();
  }

  async function handleRename(projectId: number, currentName: string) {
    const nextName = window.prompt("New project name:", currentName);
    if (!nextName || nextName.trim() === currentName) return;

    const response = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nextName.trim() }),
    });
    if (!response.ok) {
      const data = await response.json();
      window.alert(data.error || "Failed to update project.");
      return;
    }

    router.refresh();
  }

  return (
    <ul className="space-y-1">
      {projects.map((project) => (
        <li
          key={project.id}
          className="flex flex-col gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <Link
              className="font-medium text-gray-900 hover:text-black"
              href={`/projects/${project.id}`}
            >
              {project.name}
            </Link>
            <div className="text-xs text-gray-500">Manage forms and responses</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => handleRename(project.id, project.name)}
            >
              Rename
            </button>
            <button
              type="button"
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:border-red-300 hover:bg-red-50"
              onClick={() => handleDelete(project.id)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
