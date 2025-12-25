import Link from "next/link";
import { createSupaBaseClient } from "@/app/lib/supabase/server";
import { prisma } from "@/app/lib/prisma";

export async function ProjectList() {
  const supabase = createSupaBaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return (
      <div className="space-y-2">
        <p>Please log in to view your projects.</p>
        <Link className="text-blue-600 underline" href="/auth/login">
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
    return <p>No projects yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {projects.map((project) => (
        <li key={project.id}>
          <Link className="text-blue-600 underline" href={`/projects/${project.id}`}>
            {project.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
