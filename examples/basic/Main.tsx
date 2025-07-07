import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Reactivity from './reactive/Reactivity';
import { PixelRain } from './PixelRain';
import VirtualizedChatExample from './virtualiser/VirtualizedChatExample';
import ArrayMethodsPage from './object-example/ObjectExmaple';
import { catSvg } from './assets/svgs';
import LCDCatScrollerDemo from './LCDDemo';
import StateOverview from './basic-overview/StateOverview';
import VirtualizedChatExampleFetch from './virtualiser/VirtualizedChatExampleFetch';

const sections = [
  { id: 'home', name: 'Home' },
  { id: 'reactivity', name: 'Reactivity' },
  { id: 'basic', name: 'Basic Overview' },
  // { id: 'array-reactivity', name: 'Array Reactivity' },
  { id: 'chat', name: 'Virtualized Chat' },
  { id: 'lcd', name: 'LCD Cat Demo' },
  { id: 'array', name: 'Array Methods' },
];

function App() {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  return (
    <div className="relative crt">
      <div className="pointer-events-none">
        <PixelRain />
        {/* <div className="fixed left-0 w-[16vw] h-[100vh] bg-gradient-to-r from-black/50 to-black/00 pointer-events-none z-[1]" />
        <div className="fixed right-0 w-[16vw] h-[100vh] bg-gradient-to-l from-black/50 to-black/00 pointer-events-none z-[1]" />
        <div className="fixed left-0 bottom-0 w-[100vw] h-[10vh] bg-gradient-to-t from-black/70 to-black/00 pointer-events-none z-[1]" />
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_center,rgba(0,255,0,0.04),transparent_70%)] pointer-events-none z-[1]" /> */}
        <div className="fixed h-screen w-full bg-gradient-to-b from-black via-gray-900 to-gray-900 z-[-999]" />
      </div>

      <div className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm z-[1000] border-b border-green-500/20">
        <div className="flex gap-2 px-4 py-2 overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded text-sm transition-all cursor-pointer ${
                activeSection === section.id
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              {section.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-[10vw] pt-40 flex flex-col gap-4 relative z-[10]">
        {activeSection === 'home' ? null : activeSection === 'reactivity' ? (
          <Reactivity />
        ) : activeSection === 'basic' ? (
          <StateOverview />
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
        <div className="h-40" />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
