import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold">Sports Stats Hub</h1>
      <p className="text-gray-500">Live stats for your favorite sports.</p>
      <Link
        href="/baseball"
        className="mt-4 rounded-full bg-foreground px-6 py-3 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        View Baseball Stats
      </Link>
    </main>
  );
}
