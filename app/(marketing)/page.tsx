import Link from "next/link";

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <div className="text-lg font-semibold text-gray-900">FormForge</div>
        <div className="flex items-center gap-3">
          <Link className="text-sm text-gray-600 hover:text-gray-900" href="/auth/login">
            Log in
          </Link>
          <Link
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            href="/auth/signup"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16">
        <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Modern form workflows
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              Launch forms fast and keep responses organized.
            </h1>
            <p className="text-lg text-gray-600">
              Create projects, design forms, and track submissions with a calm, modern
              workspace built for teams that move quickly.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                href="/auth/signup"
              >
                Create your first form
              </Link>
              <Link
                className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                href="/auth/login"
              >
                Log in
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span>Unlimited projects</span>
              <span>•</span>
              <span>Shareable links</span>
              <span>•</span>
              <span>Live insights</span>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="text-xs text-gray-500">Workspace snapshot</div>
                <div className="mt-2 text-lg font-semibold text-gray-900">
                  Event feedback
                </div>
                <div className="mt-3 grid gap-3">
                  <div className="rounded-xl border border-gray-200 p-3">
                    <div className="text-xs text-gray-500">Submissions last 7 days</div>
                    <div className="text-2xl font-semibold text-gray-900">128</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-3">
                    <div className="text-xs text-gray-500">Top form</div>
                    <div className="text-sm font-medium text-gray-900">
                      Session feedback
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-sm font-medium text-gray-900">Build fast</div>
                  <p className="mt-1 text-xs text-gray-500">
                    Drag questions, auto keys, and clean defaults.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-sm font-medium text-gray-900">Stay organized</div>
                  <p className="mt-1 text-xs text-gray-500">
                    Projects, forms, and responses in one place.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Focus on responses",
              body: "Keep submissions tidy, searchable, and easy to review.",
            },
            {
              title: "Ship quickly",
              body: "Spin up projects and publish new forms in minutes.",
            },
            {
              title: "Share confidently",
              body: "Public links are ready to send and easy to access.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="text-sm font-medium text-gray-900">{item.title}</div>
              <p className="mt-2 text-sm text-gray-600">{item.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-16 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Ready to build your next form?
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Start collecting responses today with a clean, modern workflow.
              </p>
            </div>
            <Link
              className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              href="/auth/signup"
            >
              Get started
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
