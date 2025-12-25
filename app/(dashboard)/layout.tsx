import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-gray-50">
      <aside className="space-y-6 border-r bg-white px-6 py-8">
        <div className="text-lg font-semibold">FormForge</div>
        <nav className="space-y-3">
          <Link className="block rounded px-3 py-2 hover:bg-gray-100" href="/dashboard">
            Overview
          </Link>
          <Link className="block rounded px-3 py-2 hover:bg-gray-100" href="/projects">
            Projects
          </Link>
        </nav>
      </aside>
      <section className="p-8">
        {children}
      </section>
    </div>
  );
}
