import Link from "next/link";
import { createSupaBaseClient } from "@/app/lib/supabase/server";
import { prisma } from "@/app/lib/prisma";
import { ProjectListClient } from "@/app/(dashboard)/projects/components/projectListClient";

export async function ProjectList() {
  const supabase = createSupaBaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center">
        <p className="text-sm text-gray-600">Please log in to view your projects.</p>
        <Link className="mt-2 inline-flex text-sm font-medium text-gray-900" href="/auth/login">
          Go to login
        </Link>
      </div>
    );
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center">
        <p className="text-sm text-gray-600">No projects yet. Create your first one.</p>
      </div>
    );
  }

  return <ProjectListClient projects={projects} />;
}
