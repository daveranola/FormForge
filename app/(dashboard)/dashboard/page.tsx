import { CreateProject } from "@/app/(dashboard)/projects/components/createProject";
import { ProjectList } from "@/app/(dashboard)/projects/components/projectList";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-gray-700">This is your dashboard home. Add widgets and stats here.</p>
    </div>
  );
}
