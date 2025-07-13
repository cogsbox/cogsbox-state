// src/pages/CogsStateSyncPage.tsx
'use client';
import { useEffect, useRef } from 'react';
import { useSync } from '../sync/SyncProvider';
import { useCogsState } from './state';
import { FlashWrapper } from '../../FlashOnUpdate';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import DotPattern from '../../DotWrapper';
import z from 'zod';

// --- Reusable Utility Components (same as above) ---

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

// --- Main Form Components ---
const zodschema = z.object({
  name: z.string().min(1),
  age: z.number().min(1),
  email: z.string().email(),
});
function CogsStateForm() {
  const syncKeyGet = window.location.search.split('syncKey=')[1];
  const syncState = useCogsState('user', {
    validation: {
      key: 'user.name',
      zodSchema: zodschema,
    },
  });

  return (
    <SectionWrapper>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-green-400">
            Form with `CogsState`
          </h3>
          <p className="text-sm text-green-400/70 mt-1">
            Optimized, Granular Syncing
          </p>
        </div>
        <RenderCounter label="Total Form Renders" color="bg-green-500" />
      </div>

      <FlashWrapper>
        <div className="space-y-4">
          {[
            { label: 'Name', state: syncState.name, type: 'text' },
            { label: 'Age', state: syncState.age, type: 'number' },
            { label: 'Email', state: syncState.email, type: 'email' },
          ].map(({ label, state, type }) => (
            <div className="flex flex-col gap-2" key={label}>
              <label className="font-medium text-gray-300">{label}:</label>
              {state.formElement((obj) => (
                <div className="flex items-center gap-2">
                  <FlashWrapper>
                    <input
                      type={type}
                      {...obj.inputProps}
                      className="flex-1 bg-gray-900/50 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </FlashWrapper>
                  <RenderCounter
                    label={`${label} Input Renders`}
                    color="bg-blue-500"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        <CogsStateDisplay />
      </FlashWrapper>
    </SectionWrapper>
  );
}

function CogsStateDisplay() {
  const syncState = useCogsState('user');
  return (
    <FlashWrapper>
      <div className="mt-6">
        <h4 className="text-md font-semibold text-gray-300 mb-2">
          Live State Object:
        </h4>
        <pre className="bg-gray-950 border border-gray-800 p-3 rounded text-sm overflow-auto text-gray-300">
          {JSON.stringify(syncState.get(), null, 2)}
        </pre>
      </div>
    </FlashWrapper>
  );
}

// --- Page Component ---

export default function CogsStateSyncPage() {
  return (
    <div className="flex-1 flex flex-col gap-8 p-4 md:p-8">
      <DotPattern>
        <div className="p-6">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">
            Sync Engine with `CogsState`
          </h1>
          <p className="text-xl text-gray-400 max-w-4xl">
            This demonstrates real-time synchronization using `CogsState`, a
            library designed for performant, granular state management.
          </p>
        </div>
      </DotPattern>

      <div className="text-center bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
        <h3 className="font-bold text-blue-300">How to Test Real-Time Sync</h3>
        <p className="text-blue-300/80">
          Use the 'Open New Window' button in the top configuration panel.
          Notice how changes from the other window update individual fields here
          without re-rendering the entire form.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-1">
          <CogsStateForm />
        </div>
        <div className="lg:col-span-1">
          <SectionWrapper>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">
              Implementation
            </h3>
            <p className="text-gray-400 mb-4 text-sm">
              `useCogsState` creates a proxy where each property is its own
              state-aware object. The `.formElement()` method creates isolated
              components that update independently.
            </p>
            <CodeSnippetDisplay
              code={`function CogsStateForm() {
  const syncState = useCogsState('user', {
    // Add sync middleware
    cogsSync: (stateObject) => useSync(stateObject, ...),
  });

  return (
    <div>
      {/* .formElement() creates a performant, self-contained input */}
      {syncState.name.formElement((obj) => (
        <input {...obj.inputProps} />
      ))}
      
      {syncState.age.formElement((obj) => (
        <input type="number" {...obj.inputProps} />
      ))}
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
