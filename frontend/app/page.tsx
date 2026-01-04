import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Chat Voting Chaos Chess
        </h1>
        <p className="text-center text-lg mb-8">
          Welcome to the interactive chess platform!
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Register
          </Link>
          <Link
            href="/games"
            className="px-6 py-3 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Browse Games
          </Link>
        </div>
      </div>
    </main>
  );
}
