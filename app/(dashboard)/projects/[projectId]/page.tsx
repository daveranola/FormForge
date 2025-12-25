import { notFound } from "next/navigation";
import { createSupaBaseClient } from '@/app/lib/supabase/server';
import { prisma } from "@/app/lib/prisma";

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

      <h2>Forms</h2>
      {project.forms.length === 0 ? (
        <p>No forms yet.</p>
      ) : (
        <ul>
          {project.forms.map((f) => (
            <li key={f.id}>{f.name}</li>
          ))}
        </ul>
      )}
    </div>
    );
}
