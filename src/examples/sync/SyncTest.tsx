import React, { useState } from "react";

export default function SyncTest() {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSyncTest = async () => {
    const userId = 1;
    const stateKEy = "stateKeyTest";
    const stateId = 2;
    try {
      setLoading(true);
      const testData = {
        syncKey: `${userId}_${stateKEy}_${stateId}`,
        timestamp: new Date().toISOString(),
      };

      //   const response = await fetch("http://127.0.0.1:8787/sync", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer cak_74907976a33f10b1_013ab1bffd9925765ec04f8c0a4060502dcc069e2dc78f7c`,
      //     },
      //     body: JSON.stringify(testData),
      //   });
      const ws = new WebSocket(
        `ws://127.0.0.1:8787/websocket?token=${encodeURIComponent("cak_74907976a33f10b1_013ab1bffd9925765ec04f8c0a4060502dcc069e2dc78f7c")}`
      );

      ws.onopen = () => {
        console.log("WebSocket Connected");
        ws.send(JSON.stringify({ type: "auth", testData }));
      };

      ws.onmessage = (event) => {
        console.log("WebSocket Message:", event.data);
        setResponse(`WebSocket Message: ${event.data}`);
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket Disconnected");
      };
    } catch (error: any) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Sync Test</h1>

      <button
        onClick={handleSyncTest}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        {loading ? "Sending..." : "Send Test Data to Worker"}
      </button>

      <p className="mb-4">
        This component tests the sync feature by sending data to your Cloudflare
        Worker.
      </p>

      {response && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Response:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
}
