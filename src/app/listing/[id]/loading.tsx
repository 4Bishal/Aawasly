export default function LoadingStay() {
  return (
    <main
      id="main"
      className="page-shell space-y-6 py-10"
      aria-label="Loading stay"
      aria-busy="true"
    >
      <div className="h-10 w-1/2 animate-pulse rounded-full bg-muted" />
      <div className="aspect-[2/1] animate-pulse rounded-3xl bg-muted" />
      <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="h-64 animate-pulse rounded-3xl bg-muted" />
        <div className="h-80 animate-pulse rounded-3xl bg-muted" />
      </div>
    </main>
  );
}
