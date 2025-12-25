import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupaBaseClient } from '@/app/lib/supabase/server';
import { prisma } from "@/app/lib/prisma";
import { CreateForm } from "@/app/(dashboard)/forms/components/createForm";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
    const { projectId } = await params;
    const projectIdNumber = Number(projectId);
    if (!Number.isFinite(projectIdNumber)) notFound();
    
    const supabase = createSupaBaseClient();
    const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();
    
    if (authError || !user) {
        notFound();
    }   

    const project = await prisma.project.findFirst({
        where: {
            id: projectIdNumber,
            ownerId: user.id,
        },
        include: {
            forms: {
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!project) {
        notFound();
    }

    return (
    <div>
      <h1>{project.name}</h1>
      <CreateForm projectId={projectIdNumber} />

      <h2>Forms</h2>
      {project.forms.length === 0 ? (
        <p>No forms yet.</p>
      ) : (
        <ul>
          {project.forms.map((f) => (
            <li key={f.id}>
              <Link className="text-blue-600 underline" href={`/projects/${project.id}/forms/${f.id}`}>
                {f.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
    );
}
