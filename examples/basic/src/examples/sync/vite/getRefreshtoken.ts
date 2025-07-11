// This is your only real option for a pure SPA
export async function refreshSyncToken({
  refreshToken,
  clientId,
}: {
  refreshToken: string;
  clientId: string;
}) {
  // Access Vite environment variables using import.meta.env
  const apiToken = import.meta.env.VITE_COGS_SYNC_API_TOKEN;
  const serverUrl = import.meta.env.VITE_COGS_SYNC_SERVER_URL;

  if (!apiToken) return null;

  try {
    const response = await fetch(`${serverUrl}/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Use the apiToken from Vite's env
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        refreshToken,
        clientId,
      }),
    });

    if (!response.ok) return null;

    const { sessionToken } = await response.json();
    return sessionToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}
