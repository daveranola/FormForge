'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    return pathname?.startsWith(href);
  }

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-gray-50">
      <aside className="space-y-6 border-r border-gray-200 bg-white px-6 py-8">
        <div className="text-lg font-semibold text-gray-900">FormForge</div>
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Workspace
        </div>
        <nav className="space-y-1">
          <Link
            className={`block rounded-lg px-3 py-2 text-sm ${
              isActive("/dashboard")
                ? "bg-gray-100 font-medium text-gray-900"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            href="/dashboard"
          >
            Overview
          </Link>
          <Link
            className={`block rounded-lg px-3 py-2 text-sm ${
              isActive("/projects")
                ? "bg-gray-100 font-medium text-gray-900"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            href="/projects"
          >
            Projects
          </Link>
        </nav>
      </aside>
      <section className="p-6 lg:p-8">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </section>
    </div>
  );
}
