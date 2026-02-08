interface SkeletonProps {
  className?: string;
}

/** Dark-themed loading skeleton with subtle pulse animation */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-border ${className}`}
      aria-hidden="true"
    />
  );
}
