type AlertVariant = "error" | "warning" | "info";

const styles: Record<AlertVariant, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

type AlertProps = {
  children: React.ReactNode;
  variant?: AlertVariant;
  className?: string;
};

export function Alert({
  children,
  variant = "error",
  className = "",
}: AlertProps): JSX.Element {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${styles[variant]} ${className}`}
      role="alert"
    >
      {children}
    </div>
  );
}
