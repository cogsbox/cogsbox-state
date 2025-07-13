import { useRef } from 'react';

import { SyncProviderSPA } from '../examples/sync/SyncProviderSpa';
import SyncUser from '../../src/examples/user-sync/SyncUser';
import { v4 as uuidv4 } from 'uuid';
import { NavLink, Outlet } from 'react-router';
const stateSections = [
  { id: 'usestate sync', name: 'useState Sync', path: 'useState-sync' },
  { id: 'form sync', name: 'Cogsbox-state Sync ', path: 'form-state' },
];

export default function Sync() {
  const syncKeyGet = window.location.search.split('syncKey=')[1];
  const newSyncKey = useRef<string>(syncKeyGet ?? uuidv4());

  const updateUrl = () => {
    window.location.href = `${window.location.pathname}?syncKey=${newSyncKey.current}`;
  };

  const openNewWindow = () => {
    window.open(window.location.href, '_blank', 'width=800,height=600');
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-white mb-2">
          Sync Configuration
        </h1>
        <p className="text-gray-300 mb-4">
          Enter a sync key to connect multiple instances. Open a new window or
          share the URL with others to sync together.
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
            defaultValue={newSyncKey.current ?? syncKeyGet}
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
        <button
          onClick={openNewWindow}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors mt-6"
        >
          Open New Window
        </button>
      </div>{' '}
      <div className="flex items-center gap-1 bg-blue-500/10 rounded-full mb-6">
        <span className="text-[12px] font-mono text-blue-400 px-2 py-1 bg-blue-900/30 rounded-full border border-blue-500/20">
          cogsbox-sync
        </span>
        <div className="w-1" />
        {stateSections.map((section) => (
          <NavLink
            key={section.id}
            to={section.path}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {section.name}
          </NavLink>
        ))}{' '}
      </div>
      <div className="bg-gray-800 rounded-lg p-6">
        <SyncProviderSPA>
          <Outlet />
        </SyncProviderSPA>
      </div>{' '}
    </div>
  );
}
