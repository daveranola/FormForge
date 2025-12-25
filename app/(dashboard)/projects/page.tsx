import { CreateProject } from "@/app/(dashboard)/projects/components/createProject";
import { ProjectList } from "@/app/(dashboard)/projects/components/projectList";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-gray-500">Create a project or pick an existing one.</p>
        </div>
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <CreateProject />
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <ProjectList />
      </div>
    </div>
  );
}
