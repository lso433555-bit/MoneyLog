export function PageSkeleton() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-6" aria-hidden="true">
      <div className="h-40 animate-pulse rounded-2xl bg-gray-100" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
