import { AuthToggle } from "@/components/forms/auth-toggle";
import { AuthPageGuard } from "@/components/ui/auth-page-guard";

export default function RegisterPage(): JSX.Element {
  return (
    <AuthPageGuard>
      <AuthToggle initialMode="register" />
    </AuthPageGuard>
  );
}
