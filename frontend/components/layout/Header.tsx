'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'next-auth/react';

export function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Chaos Chess
          </Link>

          <nav className="flex items-center gap-4">
            {isLoading ? (
              <span className="text-gray-500">Loading...</span>
            ) : isAuthenticated ? (
              <>
                <Link href="/games" className="text-gray-700 hover:text-blue-600">
                  Games
                </Link>
                <Link href="/profile" className="text-gray-700 hover:text-blue-600">
                  {user?.username}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
