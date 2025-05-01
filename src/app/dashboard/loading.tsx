export default function DashboardLoading() {
  return (
    <div className="container mx-auto py-6">
      <header className="mb-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted"></div>
        <div className="mt-2 h-4 w-72 animate-pulse rounded-lg bg-muted"></div>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        <section className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 animate-pulse rounded-lg bg-muted"></div>
            <div className="h-9 w-32 animate-pulse rounded-lg bg-muted"></div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-lg border bg-muted/50"
              />
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="h-6 w-32 animate-pulse rounded-lg bg-muted"></div>

          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg border bg-muted/50"
              />
            ))}
          </div>

          <div className="h-32 animate-pulse rounded-lg border bg-muted/50"></div>
        </section>
      </div>
    </div>
  );
}
