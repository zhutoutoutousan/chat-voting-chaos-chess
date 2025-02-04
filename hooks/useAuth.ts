import { useUser } from '@clerk/nextjs';

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();

  return {
    userId: user?.id,
    user,
    isLoaded,
    isSignedIn,
    signOut: () => window.location.href = '/sign-in'
  };
} 