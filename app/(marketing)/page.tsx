import Link from "next/link";
import { LoginForm } from "@/app/components/forms/LoginForm";
import { SignupForm } from "@/app/components/forms/SignupForm";

export default function MarketingPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-12 px-6 py-12">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold">FormForge</h1>
        <p className="max-w-2xl text-gray-700">
          Launch forms fast, collect responses securely, and move straight into your dashboard.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link className="rounded bg-blue-600 px-4 py-2 text-white" href="/auth/signup">
            Get started
          </Link>
          <Link className="rounded border border-gray-300 px-4 py-2" href="/auth/login">
            Log in
          </Link>
        </div>
      </section>

      <section className="grid gap-10 md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Create an account</h2>
          <SignupForm />
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Already with us?</h2>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
