import { AuthPageGuard } from '@/components/ui/auth-page-guard';
import { LoginForm } from '@/components/forms/login-form';

export default function LoginPage(): JSX.Element {
  return (
    <AuthPageGuard>
      <LoginForm />
    </AuthPageGuard>
  );
}

