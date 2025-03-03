import React, { useEffect, useState } from "react";

import { mockFetch } from "./MockDB";
import { useSync } from "./useSync";

const SyncTest = () => {
  const [response, setResponse] = useState("");

  // Handler for fetching state
  const fetchStateHandler = async (syncKey: string): Promise<any> => {
    try {
      // Log the activity
      setResponse((prev) => `${prev}\n\nFetching state for key: ${syncKey}`);

      // Parse the sync key to get components
      const [serviceId, userId, stateKey, stateId] = syncKey.split("_");

      // Fetch data from your API
      const response = await mockFetch(
        `https://goot.co.uk:60002/api/state/${stateKey}/${stateId}`
      );
      console.log("sdsadasdasd", response);
      const data = await response.json();
      setResponse(
        (prev) =>
          `${prev}\n\nReceived state data: ${JSON.stringify(data, null, 2)}`
      );
      return data;
    } catch (error: any) {
      setResponse(
        (prev) => `${prev}\n\nError fetching state: ${error.message}`
      );
      throw error;
    }
  };

  // Handler for updating state
  const updateStateHandler = async (
    syncKey: string,
    newData: any
  ): Promise<any> => {
    try {
      // Log the activity
      setResponse((prev) => `${prev}\n\nUpdating state for key: ${syncKey}`);
      setResponse(
        (prev) => `${prev}\n\nNew data: ${JSON.stringify(newData, null, 2)}`
      );

      // Parse the sync key to get components
      const [serviceId, userId, stateKey, stateId] = syncKey.split("_");

      // Update data via your API
      const response = await mockFetch(
        `https://goot.co.uk:60002/api/state/${stateKey}/${stateId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newData),
        }
      );

      const result = await response.json();
      setResponse(
        (prev) =>
          `${prev}\n\nUpdate response: ${JSON.stringify(result, null, 2)}`
      );
      return result;
    } catch (error: any) {
      setResponse(
        (prev) => `${prev}\n\nError updating state: ${error.message}`
      );
      throw error;
    }
  };

  // Use our custom hook
  const {
    state,
    status,
    error,
    connect,
    disconnect,
    updateState,
    clearStorage,
  } = useSync("asdasdasds_1_user_1", fetchStateHandler, updateStateHandler);
  const handleClearStorage = () => {
    const success = clearStorage();
    setResponse(
      (prev) =>
        `${prev}\n\n${success ? "Sent request to clear storage" : "Cannot clear storage: not connected"}`
    );
  };
  // Log connection status changes
  useEffect(() => {
    setResponse((prev) => `${prev}\n\nConnection status changed to: ${status}`);
    if (error) {
      setResponse((prev) => `${prev}\n\nError: ${error}`);
    }
  }, [status, error]);

  // Test function to send a sample update
  const sendTestUpdate = () => {
    if (state) {
      const updatedData = {
        ...state,
        testUpdate: new Date().toISOString(),
      };

      updateState(updatedData);
      setResponse((prev) => `${prev}\n\nSent test update to server`);
    } else {
      setResponse((prev) => `${prev}\n\nCannot send update: no current state`);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Sync Engine Test</h1>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={connect}
          disabled={status === "connecting" || status === "connected"}
          className="bg-gray-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Connect
        </button>

        <button
          onClick={disconnect}
          disabled={status !== "connected"}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Disconnect
        </button>

        <button
          onClick={sendTestUpdate}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Send Test Update
        </button>

        <div className="ml-auto py-2 px-3 rounded bg-gray-100">
          Status:{" "}
          <span
            className={`font-medium ${
              status === "connected"
                ? "text-green-600"
                : status === "error"
                  ? "text-red-600"
                  : "text-gray-600"
            }`}
          >
            {status}
          </span>
        </div>
      </div>
      <button
        onClick={handleClearStorage}
        disabled={status !== "connected"}
        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
      >
        Clear Storage
      </button>
      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Communication Log:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto h-60 text-sm">
          {response || "No messages yet"}
        </pre>
      </div>

      {state && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Current State:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto h-40 text-sm">
            {JSON.stringify(state, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SyncTest;
