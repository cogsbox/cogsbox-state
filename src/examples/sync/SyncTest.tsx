import React, { useState, useEffect, useRef } from "react";
import { mockFetch } from "./MockDB";
type ExampleStateType = {
  user: {
    name: string;
    age: number;
  };
  settings: {
    theme: string;
  };
};

const exampleState: ExampleStateType = {
  user: {
    name: "John Doe",
    age: 30,
  },
  settings: {
    theme: "light",
  },
};

export default function SyncTest() {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const testSyncKey = "asdasdasds_1_user_1";
  const connectWebSocket = () => {
    try {
      setLoading(true);
      const token =
        "tapi_d07811ebce02e85c_d136a589de91a9d28776bcbf1a1de93108e0dbc438d9b7b3";

      // Create WebSocket connection
      const ws = new WebSocket(
        `ws://127.0.0.1:8787/websocket?token=${encodeURIComponent(token)}`
      );

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: "register",
            syncKey: testSyncKey,
          })
        );
        console.log("WebSocket Connected");
        setConnectionStatus("Connected");
        setResponse("WebSocket connected successfully");
        setLoading(false);
      };

      ws.onmessage = (event) => {
        console.log("Message from sync engine:", event.data);
        const message = JSON.parse(event.data);
        switch (message.type) {
          case "fetchState":
            // Durable Object is requesting us to fetch state
            console.log("fetchState", message);
            handleFetchState(ws, message.syncKey);
            break;

          case "updateState":
            // Durable Object is requesting us to update state
            handleUpdateState(ws, message.syncKey, message.data);
            break;

          default:
            console.log("Unknown message type:", message.type);
        }
        setResponse((prev) => `${prev}\n\nReceived: ${event.data}`);
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
        setConnectionStatus("Error");
        setLoading(false);
      };

      ws.onclose = (event) => {
        setConnectionStatus("Disconnected");

        // Handle specific auth error codes
        switch (event.code) {
          case 4000:
            setResponse(`Authentication Error: Invalid token`);
            break;
          case 4001:
            setResponse(`Authentication Error: Missing token`);
            break;
          case 4002:
            setResponse(
              `Authentication Error: Service error (${event.reason})`
            );
            break;
          case 4003:
            setResponse(`Authentication Error: Service unavailable`);
            break;
          case 1000:
            setResponse((prev) => `${prev}\n\nWebSocket closed normally`);
            break;
          default:
            setResponse(
              (prev) =>
                `${prev}\n\nConnection closed with code ${event.code}: ${event.reason || "Unknown reason"}`
            );
        }

        setLoading(false);
      };

      wsRef.current = ws;
    } catch (error: any) {
      setResponse(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  const disconnectWebSocket = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close(1000, "User disconnected");
      setConnectionStatus("Disconnected");
    }
  };

  // Handle fetchState request from Durable Object
  async function handleFetchState(ws: WebSocket, syncKey: string) {
    try {
      // Parse the sync key to get components
      const [serviceId, userId, stateKey, stateId] = syncKey.split("_");

      // Fetch data from your API
      const response = await mockFetch(
        `https://goot.co.uk:60002/api/state/${serviceId}/${userId}/${stateKey}/${stateId}`
      );
      const data = await response.json();

      // Send the fetched data back to the Durable Object
      ws.send(
        JSON.stringify({
          type: "stateData",
          syncKey: syncKey,
          data: data,
        })
      );
    } catch (error: any) {
      // Report error back to Durable Object
      console.log(error, mockFetch); //mockfetchis nto defiensd
      ws.send(
        JSON.stringify({
          type: "error",
          syncKey: syncKey,
          message: error.message,
        })
      );
    }
  }

  // Handle updateState request from Durable Object
  async function handleUpdateState(
    ws: WebSocket,
    syncKey: string,
    newData: any
  ) {
    try {
      // Parse the sync key to get components
      const [serviceId, userId, stateKey, stateId] = syncKey.split("_");

      // Update data via your API
      const response = await mockFetch(
        `https://goot.co.uk:60002/api/state/${serviceId}/${userId}/${stateKey}/${stateId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newData),
        }
      );

      const result = await response.json();

      // Notify the Durable Object of the update result
      ws.send(
        JSON.stringify({
          type: "stateUpdated",
          syncKey: syncKey,
          success: true,
          result: result,
        })
      );
    } catch (error: any) {
      // Report error back to Durable Object
      ws.send(
        JSON.stringify({
          type: "stateUpdateError",
          syncKey: syncKey,
          message: error.message,
        })
      );
    }
  }

  // Clean up WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounted");
      }
    };
  }, []);

  // Predefined commands for testing
  const sendGetCounter = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setResponse("WebSocket is not connected");
      return;
    }

    const command = JSON.stringify({ type: "getCounter" });
    wsRef.current.send(command);
    setResponse((prev) => `${prev}\n\nSent: ${command}`);
  };

  const sendIncrement = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setResponse("WebSocket is not connected");
      return;
    }

    const command = JSON.stringify({ type: "increment", amount: 1 });
    wsRef.current.send(command);
    setResponse((prev) => `${prev}\n\nSent: ${command}`);
  };

  const sendDecrement = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setResponse("WebSocket is not connected");
      return;
    }

    const command = JSON.stringify({ type: "decrement", amount: 1 });
    wsRef.current.send(command);
    setResponse((prev) => `${prev}\n\nSent: ${command}`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Sync Engine Test</h1>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={connectWebSocket}
          disabled={loading || connectionStatus === "Connected"}
          className="bg-gray-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Connect
        </button>

        <button
          onClick={disconnectWebSocket}
          disabled={connectionStatus !== "Connected"}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Disconnect
        </button>

        <div className="ml-auto py-2 px-3 rounded bg-gray-100">
          Status:{" "}
          <span
            className={`font-medium ${
              connectionStatus === "Connected"
                ? "text-green-600"
                : connectionStatus === "Error"
                  ? "text-red-600"
                  : "text-gray-600"
            }`}
          >
            {connectionStatus}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex space-x-2 mb-2">
          <button
            onClick={sendGetCounter}
            disabled={connectionStatus !== "Connected"}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Get Counter
          </button>

          <button
            onClick={sendIncrement}
            disabled={connectionStatus !== "Connected"}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Increment
          </button>

          <button
            onClick={sendDecrement}
            disabled={connectionStatus !== "Connected"}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Decrement
          </button>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Communication Log:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto h-60 text-sm">
          {response || "No messages yet"}
        </pre>
      </div>
    </div>
  );
}
