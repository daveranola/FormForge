import { SignupForm } from "@/app/components/forms/SignupForm";

export default function SignupPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-6 py-12">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-gray-600">Sign up to start collecting form responses.</p>
      </div>
      <SignupForm />
    </main>
  );
}
