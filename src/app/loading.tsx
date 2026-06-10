export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-16">
      <div className="grid gap-4 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-accent" />
        <p className="text-sm font-semibold text-muted-foreground">Loading Plickify...</p>
      </div>
    </main>
  );
}
