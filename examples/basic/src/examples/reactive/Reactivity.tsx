'use client';

import type { OptionsType, StateObject } from '../../../../../src/CogsState';
import { type StateExampleObject, useCogsState } from './state';

import React, { useEffect, useRef, useState } from 'react';
import DotPattern from '../../DotWrapper';
import { CodeSnippetDisplay } from '../../CodeSnippet';

// Simple render counter that flashes red on updates
function RenderBadge() {
  const ref = useRef<HTMLSpanElement>(null);
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;

    if (!ref.current || renderCount.current === 1) return;

    // Flash red
    ref.current.style.backgroundColor = '#dc2626';
    ref.current.style.color = 'white';
    ref.current.style.transform = 'scale(1.2)';
    ref.current.style.boxShadow = '0 0 20px rgba(220, 38, 38, 0.8)';

    const timer = setTimeout(() => {
      if (ref.current) {
        ref.current.style.backgroundColor = '#374151';
        ref.current.style.color = '#d1d5db';
        ref.current.style.transform = 'scale(1)';
        ref.current.style.boxShadow = 'none';
      }
    }, 600);

    return () => clearTimeout(timer);
  }); // NO DEPENDENCIES - runs after every render

  return (
    <span
      ref={ref}
      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gray-700 text-gray-300 transition-all duration-300"
      style={{ backgroundColor: '#374151', color: '#d1d5db' }}
    >
      {renderCount.current - 1}
    </span>
  );
}

// Main Page Component
export default function ReactivityPage() {
  const sharedState = useCogsState('fooBarObject', { reactiveType: 'none' });

  return (
    <div className="flex gap-6 text-gray-200 p-6 font-mono">
      {/* LEFT COLUMN - Examples */}
      <div className="w-3/5 flex flex-col">
        <DotPattern>
          <div className="px-8 py-4">
            <h1 className="text-3xl font-bold text-gray-100">
              Reactivity Types Demo
            </h1>
            <p className="text-sm text-gray-300 max-w-2xl mt-3 leading-relaxed">
              cogsbox-state manages large UI data through monolithic state
              objects. To prevent unnecessary re-renders, it provides several
              reactivity strategies. Watch the render counters below to see
              exactly when components update. The{' '}
              <span className="text-green-400 font-semibold">component</span>{' '}
              type intelligently tracks only the values you use. The{' '}
              <span className="text-purple-400 font-semibold">deps</span> type
              gives you explicit control but requires careful dependency
              management. The{' '}
              <span className="text-orange-400 font-semibold">all</span> type
              re-renders on any state change, which can be wasteful. Click the
              buttons to see how different components react based on their
              reactivity configuration.
            </p>
          </div>
        </DotPattern>

        <div className="bg-gray-900 rounded-lg p-6 space-y-6">
          <ComponentExample />
          <div className="grid grid-cols-2 gap-4">
            <DepsCounter1Example />
            <DepsCounter2Example />
          </div>
          <AllComponentExample />
        </div>
      </div>

      {/* RIGHT COLUMN - Controls & Info */}
      <div className="w-2/5 flex flex-col gap-4 sticky top-6">
        <ControlPanel />
        <ReactivityGuide />
        <LiveState />
      </div>
    </div>
  );
}

// Control Panel
function ControlPanel() {
  const sharedState = useCogsState('fooBarObject', { reactiveType: 'none' });

  return (
    <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700">
      <h3 className="text-white font-bold mb-4 text-lg">🎮 Control Panel</h3>
      <div className="space-y-3">
        <button
          className="w-full px-4 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-bold text-sm transition-colors shadow-lg hover:shadow-xl"
          onClick={() => sharedState.counter1.update((s) => s + 1)}
        >
          Increment Counter 1
        </button>
        <button
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-colors shadow-lg hover:shadow-xl"
          onClick={() => sharedState.counter2.update((s) => s + 1)}
        >
          Increment Counter 2
        </button>
      </div>
    </div>
  );
}

// Component with smart reactivity
function ComponentExample() {
  const state = useCogsState('fooBarObject', {
    reactiveType: 'component',
  });

  return (
    <div className="bg-green-900/20 border-2 border-green-600 rounded-lg p-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <code className="text-sm text-green-400 bg-gray-800 px-3 py-2 rounded font-bold">
            reactiveType: 'component'
          </code>
          <h3 className="text-xl font-bold text-white mt-2">
            Smart Component Tracking - (Default)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Renders:</span>
          <RenderBadge />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">counter1.get()</div>
          <div className="text-3xl font-bold text-pink-400">
            {state.counter1.get()}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">
            counter2.$get() (Signal)
          </div>
          <div className="text-3xl font-bold text-blue-400">
            {state.counter2.$get()}
          </div>
        </div>
      </div>

      <NestedExample />
    </div>
  );
}

// Nested component that only uses counter2
function NestedExample() {
  const state = useCogsState('fooBarObject', {
    reactiveType: 'component',
  });

  return (
    <div className="mt-4 bg-gray-800/30 rounded-lg p-4 border border-green-700/30">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm text-gray-400">
            Nested - Only uses counter2
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {state.counter2.get()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Renders:</span>
          <RenderBadge />
        </div>
      </div>
    </div>
  );
}

// Deps example - counter1 only
function DepsCounter1Example() {
  const state = useCogsState('fooBarObject', {
    reactiveType: 'deps',
    reactiveDeps: (state) => [state.counter1],
  });

  return (
    <div className="bg-purple-900/20 border-2 border-purple-600 rounded-lg p-4">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <code className="text-sm text-purple-400 bg-gray-800 px-3 py-2 rounded font-bold">
            deps: [counter1]
          </code>
          <h4 className="text-sm font-bold text-white mt-2">Only Counter 1</h4>
        </div>
        <RenderBadge />
      </div>
    </div>
  );
}

// Deps example - counter2 only
function DepsCounter2Example() {
  const state = useCogsState('fooBarObject', {
    reactiveType: 'deps',
    reactiveDeps: (state) => [state.counter2],
  });

  return (
    <div className="bg-blue-900/20 border-2 border-blue-600 rounded-lg p-4">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <code className="text-sm text-blue-400 bg-gray-800 px-3 py-2 rounded font-bold">
            deps: [counter2]
          </code>
          <h4 className="text-sm font-bold text-white mt-2">Only Counter 2</h4>
        </div>
        <RenderBadge />
      </div>
    </div>
  );
}

// All reactivity - rerenders on any change
function AllComponentExample() {
  const state = useCogsState('fooBarObject', { reactiveType: 'all' });

  return (
    <div className="bg-orange-900/20 border-2 border-orange-600 rounded-lg p-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <code className="text-sm text-orange-400 bg-gray-800 px-3 py-2 rounded font-bold">
            reactiveType: 'all'
          </code>
          <h3 className="text-xl font-bold text-white mt-2">
            Re-renders on ANY Change
          </h3>
          <p className="text-sm text-gray-400 mt-1">⚠️ Can be wasteful</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Renders:</span>
          <RenderBadge />
        </div>
      </div>
    </div>
  );
}

// Guide
function ReactivityGuide() {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-white font-bold mb-4 text-lg">Reactive Types</h2>
      <div className="space-y-3 text-sm">
        <div className="flex gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
          <div>
            <div className="font-semibold text-green-400">component</div>
            <div className="text-gray-400 text-xs">
              Smart default - only re-renders for used values
            </div>
          </div>
        </div>
        <CodeSnippetDisplay
          title=""
          code={` useCogsState('fooBarObject', { reactiveType: 'component' })`}
        />
        <div className="flex gap-3">
          <div className="w-3 h-3 bg-purple-500 rounded-full mt-1"></div>
          <div>
            <div className="font-semibold text-purple-400">deps</div>
            <div className="text-gray-400 text-xs">
              Explicit - you specify what triggers re-renders
            </div>
          </div>
        </div>
        <CodeSnippetDisplay
          title=""
          code={` useCogsState('fooBarObject', { 
    reactiveType: 'deps', 
    reactiveDeps: (state) => [state.counter1] 
    })`}
        />
        <div className="flex gap-3">
          <div className="w-3 h-3 bg-orange-500 rounded-full mt-1"></div>
          <div>
            <div className="font-semibold text-orange-400">all</div>
            <div className="text-gray-400 text-xs">
              Brute force - re-renders on any change
            </div>
          </div>
        </div>{' '}
        <CodeSnippetDisplay
          title=""
          code={` useCogsState('fooBarObject', { reactiveType: 'all' })`}
        />
        <div className="flex gap-3">
          <div className="w-3 h-3 bg-gray-500 rounded-full mt-1"></div>
          <div>
            <div className="font-semibold text-gray-400">none</div>
            <div className="text-gray-400 text-xs">
              Never re-renders - use with signals for DOM updates
            </div>
          </div>
        </div>
      </div>{' '}
      <CodeSnippetDisplay
        title=""
        code={` useCogsState('fooBarObject', { reactiveType: 'none' })`}
      />
    </div>
  );
}

// Live state view
function LiveState() {
  const state = useCogsState('fooBarObject', { reactiveType: 'all' });

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-gray-300 font-bold mb-2">🔍 Live State</h3>
      <pre className="text-xs text-gray-400 overflow-auto max-h-32">
        {JSON.stringify(state.get(), null, 2)}
      </pre>
    </div>
  );
}
