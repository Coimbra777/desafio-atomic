import { AuthPageGuard } from "@/components/ui/auth-page-guard";
import { AuthToggle } from "@/components/forms/auth-toggle";

export default function LoginPage(): JSX.Element {
  return (
    <AuthPageGuard>
      <AuthToggle />
    </AuthPageGuard>
  );
}
