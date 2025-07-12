import { useRef } from 'react';
import { useNavigate } from 'react-router';
import { SyncProviderSPA } from '../../src/examples/sync/SyncProviderSpa';
import SyncUser from '../../src/examples/user-sync/SyncUser';
import { v4 as uuidv4 } from 'uuid';

export default function Sync() {
  const navigate = useNavigate();
  const syncKeyGet = window.location.search.split('syncKey=')[1];
  const newSyncKey = useRef<string>(syncKeyGet ?? uuidv4());

  const updateUrl = () => {
    navigate(`?syncKey=${newSyncKey.current}`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          Sync Configuration
        </h1>
        <p className="text-gray-300 mb-4">
          Enter a sync key to connect multiple instances. Share the URL with
          others to sync together.
        </p>
      </div>
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1">
          <label className="block text-gray-300 text-sm mb-2" htmlFor="syncKey">
            Sync Key
          </label>
          <input
            id="syncKey"
            className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            value={newSyncKey.current ?? syncKeyGet}
            onChange={(e) => {
              newSyncKey.current = e.target.value;
            }}
            placeholder="Enter or generate a sync key"
          />
        </div>
        <button
          onClick={updateUrl}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors mt-6"
        >
          Update URL
        </button>
      </div>
      <div className="bg-gray-800 rounded-lg p-6">
        <SyncProviderSPA>
          <SyncUser />
        </SyncProviderSPA>
      </div>
    </div>
  );
}
