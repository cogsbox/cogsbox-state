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
  const AUTH_API_URL = "http://127.0.0.1:8787"; // Note: changed from ws:// to http://
  const API_SECRET_KEY =
    "dev_0494bb347d30cb7a_8c8b9f51814618700f53344139bb25fc3fcdc6a897b30b80";
  const SERVICE_ID = "5";
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch(`${AUTH_API_URL}/sync-token`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId, service_id: SERVICE_ID }),
        });
        console.log("response", response);
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
      serviceId={SERVICE_ID}
      sessionId={sessionId}
    >
      {children}
    </SyncProvider>
  );
}
