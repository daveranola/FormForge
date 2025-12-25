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

    const now = new Date();
    function formatRelative(date: Date) {
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 2) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <p className="text-sm text-gray-500">Manage forms and responses for this project.</p>
        </div>
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <CreateForm projectId={projectIdNumber} />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Forms</h2>
          <span className="text-xs text-gray-500">{project.forms.length} total</span>
        </div>
        {project.forms.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
            <p>No forms yet.</p>
            <p>Create your first form to start collecting responses.</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {project.forms.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-gray-50"
              >
                <Link className="font-medium text-gray-900 hover:underline" href={`/projects/${project.id}/forms/${f.id}`}>
                  {f.name}
                </Link>
                <time className="text-xs text-gray-500" dateTime={f.createdAt.toISOString()}>
                  {formatRelative(f.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
    );
}
