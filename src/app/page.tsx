import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-5xl font-bold tracking-tight">
        Coin<span className="text-accent">ball</span>
      </h1>
      <p className="text-muted">Sports stats, traded like an asset.</p>
      <Link
        href="/baseball"
        className="mt-4 rounded-md bg-accent px-6 py-3 font-medium text-black transition-colors hover:opacity-90"
      >
        View Baseball Stats
      </Link>
    </main>
  );
}
