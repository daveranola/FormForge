import { CreateProject } from "@/app/(dashboard)/projects/components/createProject";
import { ProjectList } from "@/app/(dashboard)/projects/components/projectList";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-gray-700">Create a project or pick an existing one.</p>
      </div>
      <CreateProject />
      <ProjectList />
    </div>
  );
}
