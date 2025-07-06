import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Reactivity from './reactive/Reactivity';
import { PixelRain } from './PixelRain';
import VirtualizedChatExample from './virtualiser/VirtualizedChatExample';
import ArrayMethodsPage from './object-example/ObjectExmaple';
import { catSvg } from './assets/svgs';
import LCDCatScrollerDemo from './LCDDemo';
import StateOverview from './StateOverview';

const sections = [
  { name: 'Reactivity', component: Reactivity },
  { name: 'Basic Overview', component: StateOverview },
  // { name: 'Array Reactivity', component: ArrayReactivity },
  { name: 'Virtualized Chat', component: VirtualizedChatExample },
  {
    name: 'LCD Cat Demo',
    component: () => <LCDCatScrollerDemo catSvg={catSvg} />,
  },
  { name: 'Array Methods', component: ArrayMethodsPage },
];

function App() {
  const [activeSection, setActiveSection] = useState(0);
  const ActiveComponent = sections[activeSection].component;

  return (
    <div className="relative z-0 crt">
      <div className="fixed left-0 w-[16vw] h-[100vh] bg-gradient-to-r from-black/70 to-black/00 pointer-events-none" />
      <div className="fixed right-0 w-[16vw] h-[100vh] bg-gradient-to-l from-black/70 to-black/00 pointer-events-none" />
      <div className="fixed left-0 bottom-0 w-[100vw] h-[10vh] bg-gradient-to-t from-black/70 to-black/00 pointer-events-none" />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_center,rgba(0,255,0,0.04),transparent_70%)] pointer-events-none" />
      <div className="pointer-events-none">
        <PixelRain />
        <div className="fixed h-screen w-full bg-gradient-to-b from-black via-gray-900 to-gray-900 z-[-999]" />
      </div>

      <div className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm z-[1000] border-b border-green-500/20">
        <div className="flex gap-2 px-4 py-2 overflow-x-auto">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => setActiveSection(index)}
              className={`px-4 py-2 rounded text-sm transition-all cursor-pointer ${
                activeSection === index
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              {section.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-[10vw] pt-40 flex flex-col gap-4 z-[999]">
        <ActiveComponent />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
