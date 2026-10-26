export default function Loading() {
  return (
    <main
      id="main"
      className="page-shell py-8"
      aria-label="Loading stays"
      aria-busy="true"
    >
      <div className="mb-12 h-96 animate-pulse rounded-3xl bg-muted" />
      <div className="mb-8 h-16 animate-pulse rounded-2xl bg-muted" />
      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i}>
            <div className="aspect-[4/3] animate-pulse rounded-3xl bg-muted" />
            <div className="mt-4 h-4 w-3/4 animate-pulse rounded-full bg-muted" />
            <div className="mt-3 h-4 w-1/2 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </main>
  );
}
