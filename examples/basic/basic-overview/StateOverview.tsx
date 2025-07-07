'use client';

import { useEffect, useRef, useState, createElement, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { createCogsState, type StateObject } from '@lib/CogsState';
import { FlashWrapper } from '../FlashOnUpdate';
import DotPattern from '../DotWrapper';
import { useCogsState } from './state';
function SectionWrapper({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <FlashWrapper>
      <div className="bg-[#1a1a1a]  border border-gray-700/50 rounded-lg p-5 text-white">
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
        <h4 className="text-gray-400 text-xm font-semibold mb-1 uppercase tracking-wider">
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
      <div className="px-12 py-8">
        <div className="prose prose-invert mb-6 max-w-none">
          <p className="text-sm text-gray-300 leading-relaxed">
            Cogs State provides two ways to read values:{' '}
            <code className="text-blue-400 bg-gray-800 px-1 py-0.5 rounded">
              .get()
            </code>{' '}
            for reactive reads that trigger re-renders, and{' '}
            <code className="text-green-400 bg-gray-800 px-1 py-0.5 rounded">
              .$get()
            </code>{' '}
            for signal-based reads that update the DOM directly without
            re-rendering. Updates are performed with{' '}
            <code className="text-purple-400 bg-gray-800 px-1 py-0.5 rounded">
              .update()
            </code>{' '}
            which accepts either a value or an updater function.
          </p>
        </div>

        <div className="grid gap-6">
          {/* .get() example */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="grid grid-cols-[15%_35%_15%_30%] items-center gap-4">
              {' '}
              <button
                onClick={() => {
                  state.simpleCounter.update((p) => p + 1);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 text-sm"
              >
                Increment
              </button>{' '}
              <CodeSnippetDisplay
                code={`state.simpleCounter.update((prev) => prev + 1);`}
              />
              <GetCounterDisplay />
              <CodeSnippetDisplay code={`state.simpleCounter.get();`} />
            </div>
          </div>

          {/* .$get() example */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="grid grid-cols-[15%_35%_15%_30%] items-center gap-4">
              {' '}
              <button
                onClick={() => state.simpleCounter.update((prev) => prev * 2)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 text-sm"
              >
                Double Counter
              </button>
              <CodeSnippetDisplay
                code={`state.simpleCounter.update((prev) => prev * 2);`}
              />
              <SignalCounterDisplay />
              <CodeSnippetDisplay code={`state.simpleCounter.$get();`} />
            </div>
          </div>

          <div className="bg-black/20 rounded-lg p-4">
            <div className="grid grid-cols-[15%_35%_15%_30%] items-center gap-4">
              {' '}
              <button
                onClick={() => state.isBooleanValue.toggle()}
                className={`px-4 py-2 text-white rounded-lg hover:bg-green-200 text-sm ${
                  state.isBooleanValue.get() ? 'bg-green-500' : 'bg-gray-700'
                }`}
              >
                is Boolean Value
              </button>
              <CodeSnippetDisplay code={`state.isBooleanValue.toggle();`} />
              <span className="text-green-400">
                {state.isBooleanValue.get() ? 'true' : 'false'}
              </span>
              <CodeSnippetDisplay code={`state.isBooleanValue.get();`} />
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

// --- Enhanced Form Elements Example ---
function FormElementsExample() {
  const state = useCogsState('appData');

  return (
    <div className="grid grid-cols-[70%_30%] gap-6">
      <SectionWrapper title="User Profile Form">
        <div className="prose prose-invert mb-6 max-w-none">
          <p className="text-sm text-gray-300 leading-relaxed">
            The{' '}
            <code className="text-purple-400 bg-gray-800 px-1 py-0.5 rounded">
              .formElement()
            </code>{' '}
            method provides automatic two-way binding for form inputs with
            intelligent debouncing. It returns a fully type-safe state setter
            that preserves all methods available on the underlying state type -
            whether it's a primitive value, object with nested properties, or
            array with methods like{' '}
            <code className="text-blue-400 bg-gray-800 px-1 py-0.5 rounded">
              .insert()
            </code>
            ,{' '}
            <code className="text-blue-400 bg-gray-800 px-1 py-0.5 rounded">
              .cut()
            </code>
            , and{' '}
            <code className="text-blue-400 bg-gray-800 px-1 py-0.5 rounded">
              .stateMap()
            </code>
            . The{' '}
            <code className="text-blue-400 bg-gray-800 px-1 py-0.5 rounded">
              inputProps
            </code>{' '}
            object handles value binding, change events, and form validation
            while maintaining complete access to the state's API through the
            same setter instance.
          </p>
        </div>
        <CodeSnippetDisplay
          code={`// Text input with automatic debouncing
state.firstName.formElement(({inputProps}) => (
  <input {...inputProps} />
))

// Select dropdown
state.country.formElement(({state}) => (
  <select value={state.get()} onChange={(e) => state.update(e.target.value)}>
    <option>...</option>
  </select>
))

// Checkbox with toggle
state.newsletter.formElement(({state}) => (
  <input type="checkbox" checked={state.get()} onChange={() => state.toggle()} />
))
`}
        />
        <div className="space-y-6">
          {/* Form Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                First Name
              </label>
              <FlashWrapper>
                {state.firstName.formElement((obj) => (
                  <input
                    {...obj.inputProps}
                    placeholder="John"
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  />
                ))}
              </FlashWrapper>{' '}
              <FlashWrapper>
                {state.firstName.formElement((obj) => (
                  <input
                    {...obj.inputProps}
                    placeholder="John"
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  />
                ))}
              </FlashWrapper>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Last Name
              </label>
              <FlashWrapper>
                {state.lastName.formElement((obj) => (
                  <input
                    {...obj.inputProps}
                    placeholder="Doe"
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  />
                ))}
              </FlashWrapper>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <FlashWrapper>
                {state.email.formElement((obj) => (
                  <input
                    {...obj.inputProps}
                    type="email"
                    placeholder="john.doe@example.com"
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  />
                ))}
              </FlashWrapper>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <FlashWrapper>
                {state.phoneNumber.formElement((obj) => (
                  <input
                    {...obj.inputProps}
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  />
                ))}
              </FlashWrapper>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Country
              </label>
              <FlashWrapper>
                {state.country.formElement((obj) => (
                  <select
                    value={obj.get()}
                    onChange={(e) => obj.update(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  >
                    <option value="us">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="ca">Canada</option>
                    <option value="au">Australia</option>
                  </select>
                ))}
              </FlashWrapper>
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Theme Preference
              </label>
              <FlashWrapper>
                {state.theme.formElement((obj) => (
                  <select
                    value={obj.get()}
                    onChange={(e) => obj.update(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                ))}
              </FlashWrapper>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 border-t border-gray-700 pt-4">
            <div className="flex items-center gap-3">
              <FlashWrapper>
                {state.newsletter.formElement((obj) => (
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-blue-500 rounded"
                    checked={obj.get()}
                    onChange={() => obj.toggle()}
                  />
                ))}
              </FlashWrapper>
              <label className="text-sm text-gray-300">
                Subscribe to newsletter for updates and special offers
              </label>
            </div>
          </div>

          {/* Active Numbers Toggle */}
          <div className="border-t border-gray-700 pt-4">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Notification Days
            </label>
            <div className="flex gap-2">
              {state.daysOfWeek.formElement((obj) => (
                <>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                    (day, idx) => (
                      <button
                        key={idx}
                        onClick={() => obj.toggleByValue(idx)}
                        className={`px-3 py-1.5 rounded text-sm transition-colors ${
                          obj.get().includes(idx)
                            ? 'bg-blue-600 text-white hover:bg-blue-500'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {day}
                      </button>
                    )
                  )}
                </>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>
      <ReactiveFormDisplay />
    </div>
  );
}

// Reactive form display moved to right column
function ReactiveFormDisplay() {
  const state = useCogsState('appData');
  const hasFormData =
    state.firstName.get() || state.lastName.get() || state.email.get();

  return (
    <FlashWrapper>
      <div className="bg-gray-900/30 border border-gray-700/50 rounded-lg p-4 ">
        <h3 className="text-gray-300 text-sm font-semibold mb-3 uppercase tracking-wider">
          Form State
        </h3>

        {hasFormData ? (
          <div className="space-y-3 text-sm">
            {(state.firstName.get() || state.lastName.get()) && (
              <div>
                <span className="text-gray-500">Name:</span>
                <div className="text-gray-200">
                  {state.firstName.$get()} {state.lastName.$get()}
                </div>
              </div>
            )}

            {state.email.get() && (
              <div>
                <span className="text-gray-500">Email:</span>
                <div className="text-gray-200">{state.email.$get()}</div>
              </div>
            )}

            {state.phoneNumber.get() && (
              <div>
                <span className="text-gray-500">Phone:</span>
                <div className="text-gray-200">{state.phoneNumber.$get()}</div>
              </div>
            )}

            <div>
              <span className="text-gray-500">Country:</span>
              <div className="text-gray-200">
                {state.country.get() === 'us' && 'United States'}
                {state.country.get() === 'uk' && 'United Kingdom'}
                {state.country.get() === 'ca' && 'Canada'}
                {state.country.get() === 'au' && 'Australia'}
              </div>
            </div>

            <div>
              <span className="text-gray-500">Theme:</span>
              <div className="text-gray-200">{state.theme.$get()}</div>
            </div>

            <div>
              <span className="text-gray-500">Newsletter:</span>
              <div className="text-gray-200">
                {state.newsletter.get() ? '✅ Subscribed' : '❌ Not subscribed'}
              </div>
            </div>

            <div>
              <span className="text-gray-500">Notification Days:</span>
              <div className="text-gray-200">
                {state.daysOfWeek.get().length > 0
                  ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                      .filter((_, i) => state.daysOfWeek.get().includes(i))
                      .join(', ')
                  : 'None selected'}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            Fill in the form to see reactive updates...
          </p>
        )}
      </div>
    </FlashWrapper>
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
todos.insert(({ uuid }) => ({...}));

// Remove items
todos.cut(0);
todos.cutSelected();

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
          style={{ maxHeight: '400px' }}
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
    <div className="flex-1 flex flex-col gap-8">
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

      <div>
        <h2 className="text-2xl font-semibol</div> text-gray-200 mb-4 tracking-tight">
          Primitives & Core Methods
        </h2>
        <CounterExample />
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-200 mb-4 tracking-tight">
          Form Bindings
        </h2>
        <FormElementsExample />
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-200 mb-4 tracking-tight">
          Array Manipulation
        </h2>
        <ArrayManipulationExample />
      </div>
    </div>
  );
}
