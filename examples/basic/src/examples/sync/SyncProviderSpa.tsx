'use client';

import SyncProvider from './SyncProvider';
import { useState, useEffect, type ReactNode } from 'react';
import { getSyncToken } from './vite/getSyncInfo';
import { refreshSyncToken } from './vite/getRefreshtoken';

export function SyncProviderSPA({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<{
    sessionToken?: string;
    refreshToken?: string;
    serverUrl?: string;
  } | null>();

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const result = await getSyncToken({
          clientId: '1',
          boundaryId: '1',
          ctx: { userId: '1' },
        });
        setTokens(result);
      } catch (error) {
        console.error('Failed to fetch tokens:', error);
      }
    };

    fetchTokens();
  }, []);

  if (!tokens) {
    return null; // or a loading spinner
  }

  const syncApiUrl = `http://localhost:4000/api/sync`;
  return (
    <SyncProvider
      token={tokens.sessionToken}
      refreshToken={tokens.refreshToken}
      socketUrl={tokens.serverUrl!}
      clientId={'1'}
      syncApiUrl={syncApiUrl}
    >
      {children}
    </SyncProvider>
  );
}
