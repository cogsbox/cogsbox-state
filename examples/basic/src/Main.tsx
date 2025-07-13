// src/main.jsx

import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Reactivity from './examples/reactive/Reactivity';
import StateOverview from './examples/basic-overview/StateOverview';
import CogsFormBindings from './examples/form-bindings/FormBindings';
import VirtualizedChatExampleFetch from './examples/virtualiser/VirtualizedChatExampleFetch';
import ArrayMethodsPage from './examples/object-example/ObjectExmaple';

import '../index.css';
import { PixelRain } from './PixelRain';
import { NavLink, Outlet } from 'react-router';
import AboutMe from './about-me/AboutM';
import State from './pages/State';
import Sync from './pages/Sync';
import { v4 as uuidv4 } from 'uuid';
import Shape from './pages/Shape';
import ShapeOverview from './examples/shape-overview.tsx/ShapeOverview';
// --- Query Client Setup ---
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />, // This is your main layout component
      children: [
        {
          index: true, // This makes it the default child route
          element: <AboutMe />,
        },
        {
          path: 'state',
          element: <State />, // Layout for state examples with its own navigation
          children: [
            // Default child for /state
            { index: true, element: <Reactivity /> },
            { path: 'reactivity', element: <Reactivity /> },
            { path: 'basic-overview', element: <StateOverview /> },
            { path: 'form-bindings', element: <CogsFormBindings /> },
            {
              path: 'virtualized-chat',
              element: <VirtualizedChatExampleFetch />,
            },
            { path: 'array-methods', element: <ArrayMethodsPage /> },
          ],
        },
        {
          path: 'shape',
          element: <Shape />, // The layout for the Shape section
          children: [
            {
              index: true, // Default page for /shape
              element: <ShapeOverview />,
            },
            // You can add more pages like 'shape/relations' here later
          ],
        },
        {
          path: 'sync',
          element: <Sync />,
        },
      ],
    },
  ],
  {
    // Add this basename option
    basename: '/chris/',
  }
);
// src/App.jsx

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const [bgDisabled, setBgDisabled] = useState(
    urlParams.get('disablebg') === 'true'
  );
  const [contentHidden, setContentHidden] = useState(false);
  const syncKey = useRef<string>(uuidv4());
  return (
    <div className="relative h-[100vh] crt">
      {!bgDisabled && (
        <div className="pointer-events-none">
          <PixelRain />
          <div className="fixed left-0 w-[16vw] h-[100vh] bg-gradient-to-r from-black/50 to-black/00 pointer-events-none z-[1]" />
          <div className="fixed right-0 w-[16vw] h-[100vh] bg-gradient-to-l from-black/50 to-black/00 pointer-events-none z-[1]" />
          <div className="fixed left-0 bottom-0 w-[100vw] h-[10vh] bg-gradient-to-t from-black/70 to-black/00 pointer-events-none z-[1]" />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_center,rgba(0,255,0,0.04),transparent_70%)] pointer-events-none z-[1]" />
          <div className="fixed h-screen w-full bg-gradient-to-b from-black via-gray-900 to-gray-900 z-[-999]" />
        </div>
      )}

      {bgDisabled && (
        <div className="fixed h-screen w-full bg-gray-900 z-[-999]" />
      )}

      <div className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm z-[1000] border-b border-green-500/20">
        <div className="flex items-center gap-1 px-4 py-3">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-2 rounded text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-gray-300 text-gray-900'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white border border-transparent'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/state"
            className={({ isActive }) =>
              `px-4 py-2 rounded text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white border border-transparent'
              }`
            }
          >
            State
          </NavLink>{' '}
          <NavLink
            to="/shape"
            className={({ isActive }) =>
              `px-4 py-2 rounded text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white border border-transparent'
              }`
            }
          >
            Shape
          </NavLink>
          <NavLink
            to={`/sync?syncKey=${syncKey.current}`}
            className={({ isActive }) =>
              `px-4 py-2 rounded text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white border border-transparent'
              }`
            }
          >
            Sync
          </NavLink>
          <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
            <span>Examples coming soon:</span>
            <span className="text-blue-400">cogs-auth</span>
            <span className="text-green-400">cogsbox-shape</span>
            <span className="text-orange-400">cogsbox-sync</span>
          </div>
        </div>
      </div>

      <div className="fixed top-20 right-4 z-[1001] flex items-center gap-2 text-xs text-gray-500">
        <button
          onClick={() => setContentHidden(!contentHidden)}
          className="p-2 rounded bg-gray-800/80 hover:bg-gray-700/80 text-gray-400 hover:text-gray-200 transition-all text-xs backdrop-blur-sm border border-gray-700/50"
        >
          {contentHidden ? 'Show' : 'Hide'} content
        </button>
        <button
          onClick={() => setBgDisabled(!bgDisabled)}
          className="p-2 rounded bg-gray-800/80 hover:bg-gray-700/80 text-gray-400 hover:text-gray-200 transition-all text-xs backdrop-blur-sm border border-gray-700/50"
          title={
            bgDisabled
              ? 'Enable background effects'
              : 'Disable background effects'
          }
        >
          Background {bgDisabled ? '🌙' : '✨'}
        </button>
      </div>

      <main className="px-[10vw] pt-20 flex flex-col gap-4 relative z-[10]">
        {!contentHidden && <Outlet />}
        <div className="h-40" />
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
