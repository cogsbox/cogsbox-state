import { SyncProvider } from "../SyncProvider";

export default async function SyncPage({
  sessionId,
  children,
}: {
  sessionId: string;
  children: React.ReactNode;
}) {
  const AUTH_API_URL = "ws://127.0.0.1:8787";
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

  const { sessionToken, serverUrl } = await response.json();

  return (
    <SyncProvider sessionToken={sessionToken} serverUrl={serverUrl}>
      {children}
    </SyncProvider>
  );
}
