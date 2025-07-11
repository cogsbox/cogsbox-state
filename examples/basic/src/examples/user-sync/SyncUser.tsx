import { useState } from 'react';

import { useSyncReact } from '../sync/SyncProvider';

import { userState } from './state';

export default function SyncUser() {
  return (
    <>
      <UserUserState />
    </>
  );
}

function UserUserState() {
  const [state, setState] = useState(userState);
  const syncKeyGet = window.location.search.split('syncKey=')[1];
  const [syncState, update, details] = useSyncReact(state, setState, {
    syncKey: 'user',
    syncId: syncKeyGet ?? 'test-form',
    connect: true,
    inMemoryState: true,
  });

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">User Information</h2>
      <form className="bg-white border border-gray-700/50 rounded-lg p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label>Name:</label>
          <input
            className="border border-gray-300 rounded px-3 py-2"
            value={syncState.name}
            onChange={(e) => {
              update((state) => ({
                ...state,
                name: e.target.value,
              }));
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label>Age:</label>
          <input
            type="number"
            className="border border-gray-300 rounded px-3 py-2"
            value={syncState.age}
            onChange={(e) => {
              update((state) => ({
                ...state,
                age: parseInt(e.target.value) || 0,
              }));
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label>Email:</label>
          <input
            type="email"
            className="border border-gray-300 rounded px-3 py-2"
            value={syncState.email}
            onChange={(e) => {
              update((state) => ({
                ...state,
                email: e.target.value,
              }));
            }}
          />
        </div>
      </form>

      <div className="mt-4 bg-gray-100 p-4 rounded">
        <h3 className="font-bold">Current State:</h3>
        <pre>{JSON.stringify(syncState, null, 2)}</pre>
      </div>
    </div>
  );
}
