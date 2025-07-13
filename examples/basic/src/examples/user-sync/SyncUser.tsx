// src/pages/TraditionalSyncPage.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useSyncReact } from '../sync/SyncProvider';
import { userState } from './state';
import { FlashWrapper } from '../../FlashOnUpdate';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import DotPattern from '../../DotWrapper';

// --- Reusable Utility Components ---

function SectionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-6 text-white">
      {children}
    </div>
  );
}

function CodeSnippetDisplay({ code }: { code: string }) {
  return (
    <div className="bg-gray-950 rounded-lg overflow-hidden border border-gray-800 mt-2">
      <SyntaxHighlighter
        language="jsx"
        style={atomOneDark}
        customStyle={{
          backgroundColor: 'transparent',
          fontSize: '13px',
          padding: '1rem',
          margin: 0,
        }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
}

function RenderCounter({
  label,
  color = 'bg-blue-500',
}: {
  label: string;
  color?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    if (!ref.current || renderCount.current === 1) return;
    ref.current.style.transform = 'scale(1.2)';
    ref.current.style.boxShadow = `0 0 15px ${color}`;
    const timer = setTimeout(() => {
      if (ref.current) {
        ref.current.style.transform = 'scale(1)';
        ref.current.style.boxShadow = '';
      }
    }, 300);
    return () => clearTimeout(timer);
  });

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-400">{label}:</span>
      <span
        ref={ref}
        className={`px-2 py-1 rounded-md text-white text-xs font-bold transition-all duration-300 ${color}`}
      >
        {renderCount.current}
      </span>
    </div>
  );
}

// --- Main Form Component ---

function TraditionalReactForm() {
  const [state, setState] = useState(userState);
  const syncKey = window.location.search.split('syncKey=')[1]!;

  const [syncState, update] = useSyncReact(state, setState, {
    syncKey: 'userUseState',
    syncId: syncKey,
    inMemoryState: true,
  });

  return (
    <SectionWrapper>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-red-400">
            Form with `useState`
          </h3>
          <p className="text-sm text-red-400/70 mt-1">
            Powered by `useSyncReact`
          </p>
        </div>
        <RenderCounter label="Total Form Renders" color="bg-red-500" />
      </div>
      <FlashWrapper>
        <div className="space-y-4">
          {[
            { label: 'Name', value: syncState.name, type: 'text', key: 'name' },
            { label: 'Age', value: syncState.age, type: 'number', key: 'age' },
            {
              label: 'Email',
              value: syncState.email,
              type: 'email',
              key: 'email',
            },
          ].map(({ label, value, type, key }) => (
            <div className="flex flex-col gap-2" key={key}>
              <div className="flex justify-between items-center">
                <label className="font-medium text-gray-300">{label}:</label>
                <RenderCounter
                  label={`${label} Field Renders`}
                  color="bg-orange-500"
                />
              </div>
              <input
                type={type}
                className="bg-gray-900/50 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                value={value}
                onChange={(e) => {
                  update((s) => ({
                    ...s,
                    [key]:
                      type === 'number'
                        ? parseInt(e.target.value) || 0
                        : e.target.value,
                  }));
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-300 mb-2">
            Live State Object:
          </h4>
          <pre className="bg-gray-950 border border-gray-800 p-3 rounded text-sm overflow-auto text-gray-300">
            {JSON.stringify(syncState, null, 2)}
          </pre>
        </div>
      </FlashWrapper>
    </SectionWrapper>
  );
}

// --- Page Component ---

export default function TraditionalSyncPage() {
  return (
    <div className="flex-1 flex flex-col gap-8 p-4 md:p-8">
      <DotPattern>
        <div className="p-6">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">
            Sync Engine with React `useState`
          </h1>
          <p className="text-xl text-gray-400 max-w-4xl">
            This demonstrates real-time state synchronization using a standard
            React `useState` hook, augmented by our `useSyncReact` utility.
          </p>
        </div>
      </DotPattern>

      <div className="text-center bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
        <h3 className="font-bold text-blue-300">How to Test Real-Time Sync</h3>
        <p className="text-blue-300/80">
          Use the 'Open New Window' button in the top configuration panel.
          Arrange both windows side-by-side. Any change you make here will be
          reflected in the other window instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-1">
          <TraditionalReactForm />
        </div>
        <div className="lg:col-span-1">
          <SectionWrapper>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">
              Implementation
            </h3>
            <p className="text-gray-400 mb-4 text-sm">
              The entire form component state is managed by a single `useState`
              object. `useSyncReact` wraps this state to broadcast and receive
              changes.
            </p>
            <CodeSnippetDisplay
              code={`function TraditionalReactForm() {
  const [state, setState] = useState(initialState);
  
  // This hook syncs the state object and triggers re-renders
  const [syncState, update] = useSyncReact(state, setState, {
    syncKey: 'userUseState',
    syncId: syncKey,   
    inMemoryState: true,
  };

  return (
    <div>
      <input
        value={syncState.name}
        onChange={(e) => update(s => ({ ...s, name: e.target.value }))}
      />
      {/* ...other inputs */}
    </div>
  );
}`}
            />
          </SectionWrapper>
        </div>
      </div>
    </div>
  );
}
