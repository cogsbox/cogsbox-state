import React, { useEffect, useState } from "react";

import { initialUserState, useCogsState } from "./MockDB";
import { useSync } from "./useSync";

const SyncTest = () => {
  const [response, setResponse] = useState("");
  const [userId, setUserId] = useState<number | undefined>(undefined);

  // Use our custom hook
  const {
    state,
    status,
    error,
    connect,
    disconnect,
    updateState,
    clearStorage,
  } = useSync<typeof initialUserState>(`users-${userId}`, {
    enabled: Boolean(userId),
  });

  const user = useCogsState("testUser", {
    initState: {
      initialState: state ?? initialUserState,
      dependencies: [state],
    },
    validation: { key: "userValidation" },
    middleware: ({ update }) => {
      console.log("update", update);
      updateState(update);
    },
  });

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

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Sync Engine Test</h1>
      <div className="flex gap-2 items-center">
        <button
          className="bg-amber-400 text-white p-1 rounded cursor-pointer hover:bg-amber-600 px-2"
          onClick={() => setUserId(undefined)}
        >
          Clear Storage
        </button>
        <button
          onClick={() => setUserId(1)}
          className="bg-gray-500 text-white p-1 rounded cursor-pointer hover:bg-amber-600 px-2"
        >
          User 1
        </button>
        <button
          onClick={() => setUserId(2)}
          className="bg-gray-500 text-white p-1 rounded cursor-pointer hover:bg-amber-600 px-2"
        >
          User 2
        </button>
      </div>
      {user.name.formElement((params) => (
        <input
          {...params.inputProps}
          className="bg-white border border-gray-500 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-[300px] p-2 "
        />
      ))}
      {user.age.formElement((params) => (
        <input
          {...params.inputProps}
          className="bg-white border border-gray-500 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-[300px] p-2 "
        />
      ))}
      {user.email.formElement((params) => (
        <input
          {...params.inputProps}
          className="bg-white border border-gray-500 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-[300px] p-2 "
        />
      ))}
      <div className="h-2" />
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
