'use client'

import { useEffect } from 'react';

export function AblyErrorBoundary() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('Ably')) {
        console.error('Ably error:', event.reason);
        // Optionally show a user-friendly error message
        // toast.error('Lost connection to game server. Attempting to reconnect...');
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
} 