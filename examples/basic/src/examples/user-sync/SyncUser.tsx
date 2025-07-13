'use client';
import { useState, useEffect, useRef } from 'react';
import { useSync, useSyncReact } from '../sync/SyncProvider';
import { useCogsState, userState } from './state';
import { FlashWrapper } from '../../FlashOnUpdate';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import DotPattern from '../../DotWrapper';

// Reusable wrapper for consistent section styling
function SectionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-6 text-white">
      {children}
    </div>
  );
}

// Reusable component for displaying code snippets with syntax highlighting
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

// Render counter component with flash effect, styled for the dark theme
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

// The form using traditional React state (useState)
function TraditionalReactForm() {
  const [state, setState] = useState(userState);
  const syncKeyGet = window.location.search.split('syncKey=')[1];
  const [syncState, update] = useSyncReact(state, setState, {
    syncKey: 'userUseState',
    syncId: syncKeyGet ?? 'test-form',
    connect: true,
    inMemoryState: true,
  });

  return (
    <div className="bg-red-900/10 border-2 border-red-500/20 rounded-lg p-6 h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-red-400">
            Traditional React State
          </h3>
          <p className="text-sm text-red-400/70 mt-1">
            useSyncReact + useState
          </p>
        </div>
        <RenderCounter label="Form Renders" color="bg-red-500" />
      </div>

      <div className="bg-red-500/10 border border-red-500/20 rounded p-3 mb-4">
        <p className="text-sm text-red-300">
          <strong>⚠️ Problem:</strong> Every keystroke re-renders the entire
          form, including all inputs and displays. This is inefficient for
          complex components.
        </p>
      </div>

      <FlashWrapper>
        <div className="space-y-4">
          {/* Form Fields */}
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
                <RenderCounter label={`${label} Field`} color="bg-orange-500" />
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
          <pre className="bg-gray-950 border border-gray-800 p-3 rounded text-sm overflow-auto text-gray-300">
            {JSON.stringify(syncState, null, 2)}
          </pre>
        </div>
      </FlashWrapper>
    </div>
  );
}

// The form using CogsState for optimized re-rendering
function CogsStateForm() {
  const syncKeyGet = window.location.search.split('syncKey=')[1];
  const syncState = useCogsState('user', {
    cogsSync: (stateObject) =>
      useSync(stateObject, {
        syncId: syncKeyGet!,
        connect: true,
        inMemoryState: true,
      }),
  });

  return (
    <div className="bg-green-900/10 border-2 border-green-500/20 rounded-lg p-6 h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-green-400">
            CogsState Smart Re-rendering
          </h3>
          <p className="text-sm text-green-400/70 mt-1">
            useCogsState + formElement
          </p>
        </div>
        <RenderCounter label="Form Renders" color="bg-green-500" />
      </div>

      <div className="bg-green-500/10 border border-green-500/20 rounded p-3 mb-4">
        <p className="text-sm text-green-300">
          <strong>✅ Solution:</strong> Only the specific component that changes
          will re-render. The form container and other inputs remain static.
        </p>
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
                  <RenderCounter label={`${label} Input`} color="bg-blue-500" />
                </div>
              ))}
            </div>
          ))}
        </div>

        <CogsStateDisplay />
      </FlashWrapper>
    </div>
  );
}

// A separate component to display the CogsState, demonstrating component isolation
function CogsStateDisplay() {
  const syncState = useCogsState('user');

  return (
    <FlashWrapper>
      <div className="mt-6">
        <pre className="bg-gray-950 border border-gray-800 p-3 rounded text-sm overflow-auto text-gray-300">
          {JSON.stringify(syncState.get(), null, 2)}
        </pre>
      </div>
    </FlashWrapper>
  );
}

// Section displaying the code examples for both approaches
function CodeExamples() {
  return (
    <SectionWrapper>
      <h2 className="text-2xl font-bold text-gray-100 mb-4">Code Comparison</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            Traditional React State
          </h3>
          <CodeSnippetDisplay
            code={`function TraditionalReactForm() {
  const [state, setState] = useState(userState);
  
  // This hook triggers a re-render of the whole component
  const [syncState, update] = useSyncReact(state, setState, ...);

  return (
    <div>
      {/* Every keystroke re-renders ALL inputs */}
      <input
        value={syncState.name}
        onChange={(e) => update(s => ({ ...s, name: e.target.value }))}
      />
      <input
        value={syncState.age}
        onChange={(e) => update(s => ({ ...s, age: parseInt(e.target.value) }))}
      />
    </div>
  );
}`}
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-green-400 mb-2">
            CogsState Smart Re-rendering
          </h3>
          <CodeSnippetDisplay
            code={`function CogsStateForm() {
  const syncState = useCogsState('user', ...);

  return (
    <div>
      {/* Only the specific input re-renders on change */}
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
        </div>
      </div>
    </SectionWrapper>
  );
}

// The main component that brings everything together
export default function SyncUser() {
  return (
    <div className="flex-1 flex flex-col gap-8 p-4 md:p-8">
      <DotPattern>
        <div className="py-6">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">
            Real-Time State Synchronization Demo
          </h1>
          <p className="text-xl text-gray-400 max-w-4xl">
            This demo showcases two approaches to state management in a
            real-time, multi-user environment. Open this page in a new window to
            see the state sync instantly across both.
          </p>
        </div>
      </DotPattern>

      <div className="text-center bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
        <h3 className="font-bold text-blue-300">How to Test Real-Time Sync</h3>
        <p className="text-blue-300/80">
          Use the 'Open New Window' button in the top configuration panel.
          Arrange both windows side-by-side. Any change you make in one form
          will be reflected in the other instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <TraditionalReactForm />
        <CogsStateForm />
      </div>

      <CodeExamples />
    </div>
  );
}
