import Link from "next/link";
import { createSupaBaseClient } from "@/app/lib/supabase/server";
import { prisma } from "@/app/lib/prisma";
import { CreateProject } from "@/app/(dashboard)/projects/components/createProject";

export default async function DashboardHomePage() {
  const supabase = createSupaBaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return (
      <div className="space-y-2">
        <p>Please log in to view your dashboard.</p>
        <Link className="text-blue-600 underline" href="/auth/login">
          Go to login
        </Link>
      </div>
    );
  }

  function formatRelative(date: Date) {
    const nowTime = Date.now();
    const diffMs = nowTime - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 2) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalProjects,
    totalForms,
    totalSubmissions,
    recentSubmissionsCount,
    projects,
    submissions,
    topForms,
  ] = await Promise.all([
    prisma.project.count({ where: { ownerId: user.id } }),
    prisma.form.count({ where: { project: { ownerId: user.id } } }),
    prisma.submission.count({ where: { form: { project: { ownerId: user.id } } } }),
    prisma.submission.count({
      where: {
        form: { project: { ownerId: user.id } },
        submittedAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.project.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: {
        _count: { select: { forms: true } },
      },
    }),
    prisma.submission.findMany({
      where: { form: { project: { ownerId: user.id } } },
      orderBy: { submittedAt: "desc" },
      take: 6,
      include: {
        form: {
          select: {
            id: true,
            name: true,
            projectId: true,
            project: { select: { name: true } },
          },
        },
      },
    }),
    prisma.form.findMany({
      where: { project: { ownerId: user.id } },
      orderBy: { submissions: { _count: "desc" } },
      take: 5,
      select: {
        id: true,
        name: true,
        projectId: true,
        project: { select: { name: true } },
        _count: { select: { submissions: true } },
        submissions: {
          select: { submittedAt: true },
          orderBy: { submittedAt: "desc" },
          take: 1,
        },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="text-sm text-gray-500">
            Keep track of projects, forms, and recent activity.
          </p>
        </div>
        <details className="group relative">
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400">
            <span className="text-base leading-none">+</span>
            New Project
          </summary>
          <div className="absolute right-0 z-10 mt-3 w-80 rounded-2xl border border-gray-200 bg-white p-5 shadow-lg">
            <CreateProject />
          </div>
        </details>
      </div>

      <section className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">Total Projects</div>
            <div className="text-3xl font-semibold tracking-tight">{totalProjects}</div>
            <div className="text-xs text-gray-400">All time</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">Total Forms</div>
            <div className="text-3xl font-semibold tracking-tight">{totalForms}</div>
            <div className="text-xs text-gray-400">All time</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">Total Submissions</div>
            <div className="text-3xl font-semibold tracking-tight">{totalSubmissions}</div>
            <div className="text-xs text-gray-400">All time</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">Last 7 days submissions</div>
            <div className="text-3xl font-semibold tracking-tight">
              {recentSubmissionsCount}
            </div>
            <div className="text-xs text-gray-400">Last 7 days</div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Projects</h2>
              <Link
                className="text-sm text-gray-600 hover:text-gray-900"
                href="/projects"
              >
                View all
              </Link>
            </div>
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                <p>No projects yet. Create your first project.</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {projects.map((project) => (
                  <li
                    key={project.id}
                    className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-gray-50"
                  >
                    <div>
                      <Link
                        className="font-medium text-gray-900 hover:text-black"
                        href={`/projects/${project.id}`}
                      >
                        {project.name}
                      </Link>
                      <div className="text-xs text-gray-500">
                        {project._count.forms} forms
                      </div>
                    </div>
                    <time
                      className="text-xs text-gray-500"
                      dateTime={project.updatedAt.toISOString()}
                    >
                      {formatRelative(project.updatedAt)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Submissions</h2>
            </div>
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                <p>No submissions yet.</p>
                <p>Share your form link to start collecting responses.</p>
              </div>
            ) : (
              <ul className="max-h-[420px] space-y-1 overflow-auto pr-1">
                {submissions.map((submission) => (
                  <li key={submission.id} className="rounded-lg px-2 py-2 hover:bg-gray-50">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-medium text-gray-900">
                          {submission.form.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {submission.form.project.name}
                        </div>
                      </div>
                      <time
                        className="text-xs text-gray-500"
                        dateTime={submission.submittedAt.toISOString()}
                      >
                        {formatRelative(submission.submittedAt)}
                      </time>
                    </div>
                    <div className="mt-2">
                      <Link
                        className="inline-flex items-center rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                        href={`/projects/${submission.form.projectId}/forms/${submission.formId}`}
                      >
                        View responses
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {topForms.length > 0 && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Top Forms</h2>
            </div>
            <div className="overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="py-2 font-medium">Form</th>
                    <th className="py-2 font-medium">Project</th>
                    <th className="py-2 text-right font-medium">Total Submissions</th>
                    <th className="py-2 text-right font-medium">Last Submission</th>
                  </tr>
                </thead>
                <tbody>
                  {topForms.map((form) => (
                    <tr key={form.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2">
                        <Link
                          className="font-medium text-gray-900 hover:underline"
                          href={`/projects/${form.projectId}/forms/${form.id}`}
                        >
                          {form.name}
                        </Link>
                      </td>
                      <td className="py-2 text-gray-600">{form.project.name}</td>
                      <td className="py-2 text-right text-gray-600">
                        {form._count.submissions}
                      </td>
                      <td className="py-2 text-right text-gray-600">
                        {form.submissions[0]?.submittedAt ? (
                          <time dateTime={form.submissions[0].submittedAt.toISOString()}>
                            {formatRelative(form.submissions[0].submittedAt)}
                          </time>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
