import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthForm } from "@/components/auth/auth-form";

export default function SignupPage() {
  return (
    <AuthLayout>
      <AuthForm type="signup" />
    </AuthLayout>
  );
}
