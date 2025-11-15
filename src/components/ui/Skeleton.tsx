export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse ${className}`}
    />
  );
}
