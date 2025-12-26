import { SignupForm } from "@/app/components/forms/SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div className="text-center">
          <div className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            FormForge
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign up to start collecting form responses.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <SignupForm />
        </div>
      </div>
    </main>
  );
}
