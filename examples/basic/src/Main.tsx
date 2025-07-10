import '../index.css';
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

import Reactivity from './examples/reactive/Reactivity';
import { PixelRain } from './PixelRain';

import ArrayMethodsPage from './examples/object-example/ObjectExmaple';
import { catSvg } from '../assets/svgs';
import LCDCatScrollerDemo from './LCDDemo';
import StateOverview from './examples/basic-overview/StateOverview';
import VirtualizedChatExampleFetch from './examples/virtualiser/VirtualizedChatExampleFetch';
import CogsFormBindings from './examples/form-bindings/FormBindings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AboutMe from './about-me/AboutM';
// --- Query Client Setup ---
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
  },
});

const sections = [
  { id: 'home', name: 'Home' },
  //everythign below is for cogsbox staet
  { id: 'reactivity', name: 'Reactivity' },
  { id: 'basic', name: 'Basic Overview' },
  { id: 'form-bindings', name: 'Form Bindings' },
  // { id: 'array-reactivity', name: 'Array Reactivity' },
  { id: 'chat', name: 'Virtualized Chat' },
  { id: 'lcd', name: 'LCD Cat Demo' },
  { id: 'array', name: 'Array Methods' },
];

function App() {
  const [activeSection, setActiveSection] = useState(sections[0]!.id);
  const urlParams = new URLSearchParams(window.location.search);
  const [bgDisabled, setBgDisabled] = useState(
    urlParams.get('disablebg') === 'true'
  );
  const [contentHidden, setContentHidden] = useState(false);

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

      {/* Simple background when effects are disabled */}
      {bgDisabled && (
        <div className="fixed h-screen w-full bg-gray-900 z-[-999]" />
      )}

      <div className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm z-[1000] border-b border-green-500/20">
        <div className="flex items-center gap-1 px-4 py-3">
          {/* Home button - standalone */}
          <button
            onClick={() => setActiveSection('home')}
            className={`px-4 py-2 rounded text-sm font-medium transition-all  cursor-pointer ${
              activeSection === 'home'
                ? 'bg-gray-300 text-gray-900'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white border border-transparent'
            }`}
          >
            Home
          </button>

          {/* Separator */}
          <div className="mx-3 h-8 w-px bg-gray-700" />

          {/* Cogsbox State section */}
          <div className="flex items-center gap-1">
            <span className="text-[12px] font-mono text-purple-400 px-2 py-1 bg-purple-900/30 rounded-full border border-purple-500/20">
              cogsbox-state
            </span>
            <div className="w-1" />
            {sections.slice(1).map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-3 py-1.5 rounded text-sm transition-all cursor-pointer ${
                  activeSection === section.id
                    ? 'bg-purple-500 text-white '
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>

          {/* Coming soon libraries */}
          <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
            <span>Coming soon:</span>
            <span className="text-blue-400">cogs-auth</span>
            <span className="text-green-400">cogsbox-shape</span>
            <span className="text-orange-400">cogsbox-sync</span>
          </div>
        </div>
      </div>

      {/* Background toggle button */}
      <div className="fixed top-20 right-4 z-[1001] flex items-center gap-2 text-xs text-gray-500">
        {' '}
        <button
          onClick={() => setContentHidden(!contentHidden)}
          className="  p-2 rounded bg-gray-800/80 hover:bg-gray-700/80 text-gray-400 hover:text-gray-200 transition-all text-xs backdrop-blur-sm border border-gray-700/50"
        >
          {contentHidden ? 'Show' : 'Hide'} content
        </button>
        <button
          onClick={() => setBgDisabled(!bgDisabled)}
          className="  p-2 rounded bg-gray-800/80 hover:bg-gray-700/80 text-gray-400 hover:text-gray-200 transition-all text-xs backdrop-blur-sm border border-gray-700/50"
          title={
            bgDisabled
              ? 'Enable background effects'
              : 'Disable background effects'
          }
        >
          Background {bgDisabled ? '🌙' : '✨'}
        </button>
      </div>
      <div className="px-[10vw] pt-40 flex flex-col gap-4 relative z-[10]">
        {/* Hide/Show content button */}

        {!contentHidden && (
          <>
            {activeSection === 'home' ? (
              <AboutMe />
            ) : activeSection === 'reactivity' ? (
              <Reactivity />
            ) : activeSection === 'basic' ? (
              <StateOverview />
            ) : activeSection === 'form-bindings' ? (
              <CogsFormBindings />
            ) : activeSection === 'chat' ? (
              <>
                {/* <VirtualizedChatExample /> */}
                <VirtualizedChatExampleFetch />
              </>
            ) : activeSection === 'lcd' ? (
              <LCDCatScrollerDemo catSvg={catSvg} />
            ) : activeSection === 'array' ? (
              <ArrayMethodsPage />
            ) : null}
          </>
        )}
        <div className="h-40" />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    {' '}
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </QueryClientProvider>
);
