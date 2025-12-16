import { LoginForm } from "@/app/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-6 py-12">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Log in</h1>
        <p className="text-gray-600">Access your dashboard with your email and password.</p>
      </div>
      <LoginForm />
    </main>
  );
}
