// SyncProviderSPA.tsx
'use client';

import SyncProvider from './SyncProvider';
import { useState, useEffect } from 'react';

export function SyncProviderSPA({
  children,
  getInitialAuth, // Function to get auth on client
  syncServerUrl,
  syncApiUrl,
}: {
  children: React.ReactNode;
  getInitialAuth: () => Promise<{
    token: string;
    refreshToken: string;
    clientId: string;
  } | null>;
  syncServerUrl: string;
  syncApiUrl: string;
}) {
  const [auth, setAuth] = useState<{
    token: string;
    refreshToken: string;
    clientId: string;
  } | null>(null);

  useEffect(() => {
    getInitialAuth().then(setAuth);
  }, []);

  if (!auth) return <div>Loading...</div>;

  return (
    <SyncProvider
      token={auth.token}
      refreshToken={auth.refreshToken}
      socketUrl={syncServerUrl}
      clientId={auth.clientId}
      syncApiUrl={syncApiUrl}
    >
      {children}
    </SyncProvider>
  );
}
