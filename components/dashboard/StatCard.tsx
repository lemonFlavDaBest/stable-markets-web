import { Skeleton } from "@/components/shared/Skeleton";

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  /** Color for the value text */
  color?: "default" | "success" | "warning" | "error";
  isLoading?: boolean;
}

const COLOR_MAP = {
  default: "text-text-primary",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
} as const;

/** Single metric card for the dashboard grid */
export function StatCard({
  label,
  value,
  subtitle,
  color = "default",
  isLoading = false,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-text-muted">{label}</p>
      {isLoading ? (
        <Skeleton className="mt-2 h-7 w-3/4" />
      ) : (
        <p className={`mt-1 font-mono text-xl font-semibold ${COLOR_MAP[color]}`}>
          {value}
        </p>
      )}
      {subtitle && (
        <p className="mt-1 text-xs text-text-muted">{subtitle}</p>
      )}
    </div>
  );
}
