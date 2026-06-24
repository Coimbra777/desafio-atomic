import { RegisterForm } from '@/components/forms/register-form';
import { AuthPageGuard } from '@/components/ui/auth-page-guard';

export default function RegisterPage(): JSX.Element {
  return (
    <AuthPageGuard>
      <RegisterForm />
    </AuthPageGuard>
  );
}

