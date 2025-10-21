import { SignupLayout } from "@/components/auth/signup-layout";
import { AuthForm } from "@/components/auth/auth-form";

export default function SignupPage() {
  return (
    <SignupLayout>
      <AuthForm type="signup" />
    </SignupLayout>
  );
}
