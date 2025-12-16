import { LoginForm } from "@/app/forms/LoginForm";
import { SignupForm } from "@/app/forms/SignupForm";

export default function Home() {
  return (
    <div>
      <SignupForm />
      <LoginForm />
      </div>
  );
}
