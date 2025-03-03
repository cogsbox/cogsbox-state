import { SyncProvider } from "../SyncProvider";
import { useState, useEffect } from "react";

export default function SyncPage({
  sessionId,
  children,
}: {
  sessionId: string;
  children: React.ReactNode;
}) {
  const [syncConfig, setSyncConfig] = useState<{
    sessionToken: string;
    serverUrl: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const AUTH_API_URL = "http://127.0.0.1:8787"; // Note: changed from ws:// to http://
        const API_SECRET_KEY =
          "dev_b723792b0e48fe95_d720d854b0d4a418e36a9af953471a4ca30210a09d0714dd";

        const response = await fetch(`${AUTH_API_URL}/sync-token`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId, service_id: 5 }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch token: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to get session token");
        }

        setSyncConfig({
          sessionToken: data.sessionToken,
          serverUrl: data.serverUrl,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        console.error("Error fetching sync token:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, [sessionId]);

  if (isLoading) {
    return <div>Loading sync connection...</div>;
  }

  if (error || !syncConfig) {
    return <div>Error connecting to sync service: {error}</div>;
  }

  return (
    <SyncProvider
      sessionToken={syncConfig.sessionToken}
      serverUrl={syncConfig.serverUrl}
    >
      {children}
    </SyncProvider>
  );
}
