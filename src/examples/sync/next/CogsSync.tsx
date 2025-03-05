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
    "dev_0494bb347d30cb7a_8c8b9f51814618700f53344139bb25fc3fcdc6a897b30b80";
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
    <SyncProvider
      sessionToken={sessionToken}
      serverUrl={serverUrl}
      serviceId={"5"}
      sessionId="test"
    >
      {children}
    </SyncProvider>
  );
}
