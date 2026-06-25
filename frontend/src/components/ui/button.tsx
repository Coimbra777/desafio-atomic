type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-pine text-white shadow-sm hover:bg-pine/90 focus-visible:ring-pine/40',
  secondary:
    'border border-ink/12 bg-white text-ink hover:bg-gray-50 focus-visible:ring-ink/20',
  danger:
    'border border-red-200 bg-white text-red-600 hover:bg-red-50 focus-visible:ring-red-200',
  ghost:
    'text-ink/60 hover:bg-ink/5 hover:text-ink focus-visible:ring-ink/20',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-7 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-10 px-5 text-sm',
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-55 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}
