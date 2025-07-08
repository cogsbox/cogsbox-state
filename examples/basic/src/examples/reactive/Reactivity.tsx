'use client';

import type { OptionsType, StateObject } from '../../../../../src/CogsState';
import { type StateExampleObject, useCogsState } from './state';

import React, { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import stringify from 'stringify-object';
import DotPattern from '../../DotWrapper';
import { FlashWrapper } from '../../FlashOnUpdate';
import { CodeSnippetDisplay } from '../../CodeSnippet';

// Define the structure for our tabs
const TABS = {
  component: { id: 'component', title: 'Component Reactivity (Default)' },
  deps: { id: 'deps', title: 'Dependency-Based' },
  all: { id: 'all', title: 'Entire State' },
  none: { id: 'none', title: 'Signal-Based (None)' },
};
type TabId = keyof typeof TABS;

// --- Main Page Component ---
export default function ReactivityPage() {
  const [activeTab, setActiveTab] = useState<TabId>('component');
  const sharedState = useCogsState('fooBarObject', { reactiveType: 'none' });

  return (
    <>
      <div className="flex gap-6 text-green-400  p-6 font-mono">
        {/* --- LEFT COLUMN (Interactive Examples) --- */}
        <div className="w-3/5 flex flex-col ">
          <DotPattern>
            <div className="px-8 py-4">
              <h1 className="text-2xl font-bold text-gray-200 ">
                Reactivity Types
              </h1>
              <p className="text-sm text-gray-200 max-w-2xl">
                cogsbox-state promotes managing large UI data through large
                monolithic state objects. To avoid unnecessary re-renders from
                this approach, it provides several strategies for fine-grained
                control over component updates. Select a tab to explore each
                strategy in action. Click the "Toggle" buttons to see which
                components flash, indicating a re-render. Notice how the
                isolated component uses a separate useCogsState instance to stay
                unaffected by unrelated state changes.
              </p>
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-700 bg-gray-900/90 rounded-px-2 py-1">
                {Object.values(TABS).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabId)}
                    className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 -mb-px cursor-pointer bg-green-200/30
                  ${
                    activeTab === tab.id
                      ? 'border-b-2 border-green-400 text-green-300'
                      : 'text-gray-300 hover:text-green-400 border-b-2 border-transparent'
                  }`}
                  >
                    {tab.title}
                  </button>
                ))}
              </div>
            </div>
          </DotPattern>
          {/* Tab Content Area */}
          <div className="pl-6">
            {activeTab === 'component' ? (
              <ExampleDisplay
                key={`root-${activeTab}`}
                title="Component Reactivity (Default)"
                description="This is the default. The component re-renders only if the specific state values it calls with .get() are updated."
                options={{ reactiveType: 'component' }}
              />
            ) : activeTab === 'deps' ? (
              <ExampleDisplay
                key={`root-${activeTab}`}
                title="Dependency-Based Reactivity"
                description="The component re-renders only when the specific values returned by the reactiveDeps function change."
                options={{
                  reactiveType: 'deps',
                  reactiveDeps: (state: StateExampleObject['fooBarObject']) => [
                    state.foo,
                    state.nested.foo,
                  ],
                }}
                isolatedOptions={{
                  reactiveType: 'deps',
                  reactiveDeps: (state: StateExampleObject['fooBarObject']) => [
                    state.seperateNested.foo,
                  ],
                }}
              />
            ) : activeTab === 'all' ? (
              <ExampleDisplay
                key={`root-${activeTab}`}
                title="Entire State Reactive"
                description="This component re-renders if *any* part of the 'fooBarObject' state slice changes, even properties it doesn't use."
                options={{ reactiveType: 'all' }}
              />
            ) : activeTab === 'none' ? (
              <ExampleDisplay
                key={`root-${activeTab}`}
                title="Signal-Based Reactivity"
                description="With reactiveType: 'none', the React component *never* re-renders from state changes. Use signals (.$get()) for fine-grained, direct-to-DOM updates."
                options={{ reactiveType: 'none' }}
                isSignal={true}
              />
            ) : null}
          </div>
        </div>
        {/* --- RIGHT COLUMN (Controls & Global State) --- */}
        <div className="w-2/5 flex flex-col gap-4 sticky top-6 ">
          <div className="h-2" />
          <div className="text-lg font-bold px-4 py-1 text-black bg-gray-700 rounded">
            Controls
          </div>

          {/* Group 1: Shared useCogsState Hook */}
          <div className="bg-gray-800 border border-gray-200/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
              Shared useCogsState Hook
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                className="px-3 py-1 bg-blue-900/80 border border-blue-200/70 text-blue-200 rounded hover:bg-blue-800 text-sm cursor-pointer"
                onClick={() =>
                  sharedState.foo.update((s) => (s === 'baz' ? 'bar' : 'baz'))
                }
              >
                Toggle rootValue
              </button>
              <button
                className="px-3 py-1 bg-blue-900/80 border border-blue-200/70 text-blue-200 rounded hover:bg-blue-800 text-sm cursor-pointer"
                onClick={() =>
                  sharedState.nested.foo.update((s) =>
                    s === 'baz' ? 'bar' : 'baz'
                  )
                }
              >
                Toggle nestedValue
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Both buttons update the same hook instance - components using this
              hook will re-render together
            </p>
          </div>

          {/* Group 2: Separate useCogsState Hook */}
          <div className="bg-gray-800 border border-gray-200/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
              Separate useCogsState Hook
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                className="px-3 py-1 bg-purple-900/80 border border-purple-200/70 text-purple-200 rounded hover:bg-purple-800 text-sm cursor-pointer"
                onClick={() =>
                  sharedState.seperateNested.foo.update((s) =>
                    s === 'baz' ? 'bar' : 'baz'
                  )
                }
              >
                Toggle isolatedValue
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              This uses its own hook instance - only components subscribing to
              this specific value will update
            </p>
          </div>

          <ReactivityExplanation />
          <ShowState />
        </div>
      </div>
    </>
  );
}

// --- Generic Display Component ---

function ExampleDisplay({
  title,
  description,
  options,
  isolatedOptions,
  isSignal = false,
}: {
  title: string;
  description: string;
  options: OptionsType<StateExampleObject['fooBarObject']>;
  isolatedOptions?: OptionsType<StateExampleObject['fooBarObject']>;
  isSignal?: boolean;
}) {
  const sharedState = useCogsState('fooBarObject', options);
  const finalIsolatedOptions = isolatedOptions || options;

  const formatOptions = (opts: any) => {
    if (opts.reactiveType === 'deps') {
      if (opts.reactiveDeps.toString().includes('seperateNested.foo')) {
        return `{ reactiveType: "deps", reactiveDeps: (s) => [s.seperateNested.foo] }`;
      }
      return `{ reactiveType: "deps", reactiveDeps: (s) => [s.foo, s.nested.foo] }`;
    }
    return stringify(opts, { indent: '  ', singleQuotes: false });
  };

  const displayString = `const sharedState = useCogsState( "fooBarObject", 
  ${formatOptions(options)} );`;
  const getterString = `${
    isSignal ? 'sharedState.foo.$get()' : 'sharedState.foo.get()'
  } `;

  return (
    <FlashWrapper showCounter={true}>
      <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-4 flex flex-col gap-4 h-full min-h-[600px]">
        <div>
          <h3 className="font-bold text-gray-200 text-lg">{title}</h3>
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        </div>
        <div className="flex-grow overflow-auto bg-black/30 rounded p-1">
          <CodeSnippetDisplay code={displayString} />
        </div>
        <div className="flex gap-2 items-center w-full mt-1 bg-gray-800 p-2 px-8 justify-between rounded border border-gray-700">
          <span className="text-gray-400 text-lg">rootValue</span>{' '}
          <CodeSnippetDisplay code={getterString} />
          <span className="text-xl text-blue-300 font-semibold">
            {!isSignal ? sharedState.foo.get() : sharedState.foo.$get()}
          </span>
        </div>
        <NestedValue state={sharedState} isSignal={isSignal} />
        <IsolatedValueInstance
          options={finalIsolatedOptions}
          isSignal={isSignal}
        />
      </div>
    </FlashWrapper>
  );
}

// --- Helper & Display Components ---

function NestedValue({
  state,
  isSignal,
}: {
  state: StateObject<StateExampleObject['fooBarObject']>;
  isSignal?: boolean;
}) {
  const getterString = `${
    isSignal ? 'props.nested.foo.$get()' : 'props.nested.foo.get()'
  } `;

  return (
    <FlashWrapper showCounter={true}>
      <div className="flex gap-2 items-center w-full mt-1 bg-gray-800 p-2 px-8 justify-between rounded border border-gray-700">
        <span className="text-gray-400 text-lg">
          Nested Component using prop drilling
        </span>{' '}
        <CodeSnippetDisplay code={getterString} />
        <span className="text-xl text-blue-400 font-semibold">
          {!isSignal ? state.nested.foo.get() : state.nested.foo.$get()}
        </span>
      </div>
    </FlashWrapper>
  );
}

function IsolatedValueInstance({
  options,
  isSignal,
}: {
  options: OptionsType<StateExampleObject['fooBarObject']>;
  isSignal?: boolean;
}) {
  const isolatedState = useCogsState('fooBarObject', options);

  const formatOptions2 = (opts: any) => {
    if (
      opts.reactiveType === 'deps' &&
      opts.reactiveDeps?.toString().includes('state.seperateNested.foo')
    ) {
      return `{ reactiveType: "deps", reactiveDeps: (s) => [s.seperateNested.foo] }`;
    }
    return stringify(opts, { indent: '  ', singleQuotes: false });
  };

  const displayString = `// In a separate component...\nconst isolatedState = useCogsState(\n  "fooBarObject",\n  ${formatOptions2(
    options
  )}\n);
  
${!isSignal ? `isolatedState.seperateNested.foo.get()` : `isolatedState.seperateNested.foo.$get()`}
  `;

  return (
    <FlashWrapper showCounter={true}>
      <div className="flex flex-col gap-3 w-full border-t border-gray-700/50 pt-3">
        <div className="overflow-auto bg-gray-950 rounded p-1 text-xs">
          <SyntaxHighlighter
            language="javascript"
            style={atomOneDark}
            customStyle={{
              backgroundColor: 'transparent',
              fontSize: '11px',
              padding: '1rem',
            }}
            codeTagProps={{ style: { fontFamily: 'inherit' } }}
          >
            {displayString}
          </SyntaxHighlighter>
        </div>
        <div className="flex gap-2 w-full justify-between items-center px-4 rounded bg-gray-900">
          <div className="p-1 px-2 rounded bg-gray-700 text-gray-200 text-xs uppercase font-semibold">
            isolatedValue
          </div>
          <span className="text-xl text-purple-400 font-semibold">
            {!isSignal
              ? isolatedState.seperateNested.foo.get()
              : isolatedState.seperateNested.foo.$get()}
          </span>
        </div>
      </div>
    </FlashWrapper>
  );
}

function ReactivityExplanation() {
  const Type = ({ children }: { children: React.ReactNode }) => (
    <code className="bg-gray-700 text-green-300 font-semibold px-1 rounded text-xs">
      {children}
    </code>
  );
  return (
    <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-4 text-gray-400">
      <h2 className="text-gray-200 font-bold text-base mb-3">
        Reactivity Guide
      </h2>
      <dl className="space-y-3 text-sm">
        <div>
          <dt>
            <Type>component</Type>
          </dt>
          <dd className="ml-4 mt-1 text-gray-500">
            Re-renders if state used via <Type>.get()</Type> is updated.
            Smartest option.
          </dd>
        </div>
        <div>
          <dt>
            <Type>deps</Type>
          </dt>
          <dd className="ml-4 mt-1 text-gray-500">
            Re-renders if values from <Type>reactiveDeps</Type> change.
          </dd>
        </div>
        <div>
          <dt>
            <Type>all</Type>
          </dt>
          <dd className="ml-4 mt-1 text-gray-500">
            Re-renders if *any* part of the state slice changes.
          </dd>
        </div>
        <div>
          <dt>
            <Type>none</Type>
          </dt>
          <dd className="ml-4 mt-1 text-gray-500">
            Never re-renders. Use with signals (<Type>$get()</Type>) for
            DOM-only updates.
          </dd>
        </div>
      </dl>

      <div className="mt-4 pt-3 border-t border-gray-700/50">
        <h3 className="text-gray-300 font-semibold text-sm mb-2">
          Key Insight
        </h3>
        <p className="text-xs text-gray-500">
          <span className="text-blue-300">Root component hooks</span> cause
          components to re-render together, while
          <span className="text-purple-300"> isolated hooks</span> only update
          their specific subscribers.
        </p>
      </div>
    </div>
  );
}

function ShowState() {
  const fullState = useCogsState('fooBarObject', { reactiveType: 'all' });
  return (
    <FlashWrapper showCounter={true}>
      <div className="flex-1 flex flex-col bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-3 overflow-hidden">
        <h3 className="text-gray-300 uppercase tracking-wider text-xs pb-2 mb-2 border-b border-gray-700">
          Live Global State
        </h3>
        <pre className="text-xs overflow-auto flex-grow text-gray-300">
          {JSON.stringify(fullState.get(), null, 2)}
        </pre>
      </div>
    </FlashWrapper>
  );
}
