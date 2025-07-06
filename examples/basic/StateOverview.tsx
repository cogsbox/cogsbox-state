// src/pages/BasicCogsExamplePage.tsx
'use client';

import { useEffect, useRef, useState, createElement, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { createCogsState, type StateObject } from '@lib/CogsState';
import { FlashWrapper } from './FlashOnUpdate';
import DotPattern from './DotWrapper';

// --- State Definition ---
export type TodoItem = {
  id: string;
  text: string;
  done: boolean;
};

export type AppState = {
  simpleCounter: number;
  inputMessage: string;
  isBooleanValue: boolean;
  todoList: TodoItem[];
  activeNumbers: number[]; // Changed from statusMessage to activeNumbers
};

// --- Initial state ---
const initialAppState: AppState = {
  simpleCounter: 0,
  inputMessage: 'Hello Cogs State!',
  isBooleanValue: false,
  todoList: [
    { id: uuidv4(), text: 'Initial Todo 1', done: false },
    { id: uuidv4(), text: 'Initial Todo 2 (Done)', done: true },
    { id: uuidv4(), text: 'Initial Todo 3', done: false },
  ],
  activeNumbers: [1, 3, 5], // List of active numbers
};

// --- Create Cogs State Instance ---
export const { useCogsState } = createCogsState({
  appData: initialAppState,
});

// --- Helper Components ---
function SectionWrapper({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <FlashWrapper>
      <div className="bg-gray-900/80 border border-gray-700/50 rounded-lg p-5">
        <h3 className="font-bold text-lg text-gray-100 mb-4">{title}</h3>
        {children}
      </div>
    </FlashWrapper>
  );
}

function CodeSnippetDisplay({ title, code }: { title?: string; code: string }) {
  return (
    <div className="mt-3">
      {title && (
        <h4 className="text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wider">
          {title}
        </h4>
      )}
      <div className="bg-gray-950 rounded-lg overflow-hidden border border-gray-800">
        <SyntaxHighlighter
          language="typescript"
          style={atomOneDark}
          customStyle={{
            backgroundColor: 'transparent',
            fontSize: '12px',
            padding: '0.75rem',
            margin: 0,
          }}
        >
          {code.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

// Separate component for .get() display to show it causes re-renders
function GetCounterDisplay() {
  const state = useCogsState('appData');
  return (
    <div className="text-gray-200 font-medium">
      Value (reactive):{' '}
      <FlashWrapper>
        <span className="text-blue-400">{state.simpleCounter.get()}</span>
      </FlashWrapper>
    </div>
  );
}

// Separate component for .$get() display to show it doesn't cause re-renders
function SignalCounterDisplay() {
  const state = useCogsState('appData', { reactiveType: 'none' });
  return (
    <div className="text-gray-200 font-medium">
      Value (signal):{' '}
      <FlashWrapper>
        <span className="text-green-400">{state.simpleCounter.$get()}</span>
      </FlashWrapper>
    </div>
  );
}

// --- Enhanced Counter Example ---
function CounterExample() {
  const state = useCogsState('appData');

  return (
    <SectionWrapper title="Getting & Updating Values">
      <div className="space-y-6">
        {/* .get() example */}
        <div className="bg-black/20 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                state.simpleCounter.update((p) => p + 1);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 text-sm"
            >
              Increment
            </button>
            <CodeSnippetDisplay
              code={`set {state.simpleCounter.update((prev) => prev +1) 
get state.simpleCounter.get()}`}
            />
            <GetCounterDisplay />
          </div>
        </div>
        {/* .$get() example */}

        <div className="bg-black/20 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => state.simpleCounter.update((prev) => prev * 2)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 text-sm"
            >
              Double Counter
            </button>
            <CodeSnippetDisplay
              code={`set {state.simpleCounter.update((prev) => prev * 2) 
get state.simpleCounter.$get()}`}
            />
            <SignalCounterDisplay />
          </div>
        </div>
        <div className="bg-black/20 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => state.isBooleanValue.toggle()}
              className={`px-4 py-2  text-white rounded-lg hover:bg-green-200 text-sm  ${
                state.isBooleanValue.get() ? 'bg-green-500' : 'bg-gray-700'
              }`}
            >
              is Boolean Value
            </button>
            <CodeSnippetDisplay
              code={`//  boolean special method
{state.isFeatureEnabled.toggle()}`}
            />
          </div>
        </div>
        {/* Additional operations */}
        <div className="bg-black/20 rounded-lg p-4 space-y-3 ">
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-400">
              Toggle numbers in/out of array:
            </p>
            <div className="flex gap-2">
              {state.activeNumbers.formElement((obj) => (
                <>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <button
                      key={num}
                      onClick={() => obj.toggleByValue(num)}
                      className={`px-3 py-1.5 rounded text-sm transition-colors ${
                        obj.get().includes(num)
                          ? 'bg-green-600 text-white hover:bg-green-500'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </>
              ))}
            </div>
            <div className="text-sm text-gray-300">
              Active:{' '}
              <FlashWrapper>
                [ {state.activeNumbers.$derive((s) => s.join(', '))}]
              </FlashWrapper>
            </div>
          </div>

          <CodeSnippetDisplay
            code={`// Double using function update
state.simpleCounter.update(prev => prev * 2);

// Toggle array values in/out
state.activeNumbers.toggleByValue(5); // Adds 5 if not present, removes if present

// Current implementation:
// If value exists in array -> removes it
// If value doesn't exist -> adds it`}
          />
        </div>
      </div>
    </SectionWrapper>
  );
}

// Separate component to demonstrate reactive .get() calls
function ReactiveFormDisplay() {
  const state = useCogsState('appData');

  return (
    <div className="space-y-3">
      <div className="bg-black/20 rounded p-3">
        <span className="text-gray-400 text-xs">Message:</span>
        <div className="text-gray-100">
          <FlashWrapper>{state.inputMessage.get()}</FlashWrapper>
        </div>
      </div>
      <div className="bg-black/20 rounded p-3">
        <span className="text-gray-400 text-xs">Feature:</span>
        <div className="text-gray-100">
          <FlashWrapper>
            {state.isBooleanValue.get() ? '✅ Enabled' : '❌ Disabled'}
          </FlashWrapper>
        </div>
      </div>
      <div className="bg-black/20 rounded p-3">
        <span className="text-gray-400 text-xs">Active Numbers:</span>
        <div className="text-gray-100">
          <FlashWrapper>[{state.activeNumbers.get().join(', ')}]</FlashWrapper>
        </div>
      </div>
    </div>
  );
}

// --- Enhanced Form Elements Example ---
function FormElementsExample() {
  const state = useCogsState('appData');

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Form inputs */}
      <SectionWrapper title="Form Bindings">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Message</label>
            <FlashWrapper>
              {state.inputMessage.formElement((obj) => (
                <input
                  {...obj.inputProps}
                  className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded"
                />
              ))}
            </FlashWrapper>
          </div>

          <div className="flex items-center gap-3">
            <FlashWrapper>
              {state.isBooleanValue.formElement((obj) => (
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-green-500"
                  checked={obj.get()}
                  onChange={(e) => obj.toggle()}
                />
              ))}
            </FlashWrapper>
            <label className="text-sm text-gray-300">Enable Feature</label>
          </div>
        </div>

        <CodeSnippetDisplay
          title="Form Bindings"
          code={`// Text input
state.inputMessage.formElement((obj) => (
  <input {...obj.inputProps} />
))

// Checkbox
state.isFeatureEnabled.formElement((obj) => (
  <input
    type="checkbox"
    checked={obj.get()}
    onChange={(e) => obj.set(e.target.checked)}
  />
))`}
        />
      </SectionWrapper>

      {/* Reactive display */}
      <SectionWrapper title="Reactive Display">
        <p className="text-sm text-gray-400 mb-4">
          These values update automatically when you change the form inputs
          (separate component to show reactivity)
        </p>
        <ReactiveFormDisplay />
      </SectionWrapper>
    </div>
  );
}

// --- Enhanced Array Example ---
function ArrayManipulationExample() {
  const state = useCogsState('appData');
  const todos = state.todoList;
  const selectedTodo = todos.getSelected();

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Todo List */}
      <SectionWrapper title="Todo List">
        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {todos.get().length > 0 ? (
            todos.stateList((todo, index) => {
              const isSelected = todo._selected;
              return (
                <FlashWrapper key={todo.id.get()}>
                  <div
                    className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-800/50 ring-1 ring-blue-500'
                        : 'bg-gray-800/50 hover:bg-gray-700/50'
                    }`}
                    onClick={() => todo.toggleSelected()}
                  >
                    <input
                      type="checkbox"
                      checked={todo.done.get()}
                      onChange={(e) => todo.done.update(e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 accent-green-500"
                    />
                    <span
                      className={`flex-grow text-sm ${
                        todo.done.get()
                          ? 'line-through text-gray-500'
                          : 'text-gray-200'
                      }`}
                    >
                      {todo.text.$get()}
                    </span>
                  </div>
                </FlashWrapper>
              );
            })
          ) : (
            <div className="text-gray-500 text-center py-4">Empty list</div>
          )}
        </div>

        {selectedTodo && (
          <div className="text-sm text-gray-400 mb-4">
            Selected:{' '}
            <FlashWrapper>
              <span className="text-blue-400">{selectedTodo.text.$get()}</span>
            </FlashWrapper>
          </div>
        )}
      </SectionWrapper>

      {/* Array Operations */}
      <SectionWrapper title="Array Operations">
        <div className="space-y-3">
          <button
            onClick={() => {
              todos.insert(({ uuid }) => ({
                id: uuid,
                text: `New Todo ${todos.get().length + 1}`,
                done: false,
              }));
            }}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm"
          >
            Add Todo
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => todos.cut(0)}
              className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-500 text-sm"
            >
              Cut First
            </button>
            <button
              onClick={() => todos.cutSelected()}
              disabled={!selectedTodo}
              className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 text-sm"
            >
              Cut Selected
            </button>
          </div>

          <button
            onClick={() => todos.clearSelected()}
            disabled={!selectedTodo}
            className="w-full px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 disabled:bg-gray-700 text-sm"
          >
            Clear Selection
          </button>
        </div>

        <CodeSnippetDisplay
          title="Array Methods"
          code={`// Add item
todos.insert(({ uuid }) => ({
  id: uuid,
  text: 'New todo',
  done: false
}));

// Remove items
todos.cut(0);  // Remove at index
todos.cutSelected();  // Remove selected

// Selection
todo.toggleSelected();
const selected = todos.getSelected();`}
        />
      </SectionWrapper>
    </div>
  );
}

// --- Full State Display ---
function ShowFullStateDisplay() {
  const state = useCogsState('appData', { reactiveType: 'all' });
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (preRef.current) {
      preRef.current.scrollTop = preRef.current.scrollHeight;
    }
  }, [JSON.stringify(state.get())]);

  return (
    <FlashWrapper>
      <div className="bg-gray-900/30 border border-gray-700/50 rounded-lg p-4 h-full">
        <h3 className="text-gray-300 text-sm font-semibold mb-3 uppercase tracking-wider">
          Live State
        </h3>
        <pre
          ref={preRef}
          className="text-xs overflow-auto text-gray-300 font-mono"
          style={{ maxHeight: '600px' }}
        >
          {JSON.stringify(state.get(), null, 2)}
        </pre>
      </div>
    </FlashWrapper>
  );
}

// --- Main Page ---
export default function BasicCogsExamplePage() {
  return (
    <div className="flex gap-6 p-6 ">
      {/* Left Column */}
      <div className="flex-1 flex flex-col gap-6">
        <DotPattern>
          <div className="px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-100">
              Cogs State Overview
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl">
              Core methods and functionality demonstrations
            </p>
          </div>
        </DotPattern>

        <CounterExample />
        <FormElementsExample />
        <ArrayManipulationExample />
      </div>

      {/* Right Column */}
      <div className="w-96 sticky top-6">
        <ShowFullStateDisplay />
      </div>
    </div>
  );
}
