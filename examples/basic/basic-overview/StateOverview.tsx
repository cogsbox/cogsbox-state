'use client';

import { useEffect, useRef, useState, createElement, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { createCogsState, type StateObject } from '@lib/CogsState';
import { FlashWrapper } from '../FlashOnUpdate';
import DotPattern from '../DotWrapper';
import { useCogsState } from './state';
function SectionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <FlashWrapper>
      <div className="bg-[#1a1a1a]  border border-gray-700/50 rounded-lg p-5 text-white">
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

// --- Enhanced Counter Example ---
function CounterExample() {
  const state = useCogsState('appData');

  return (
    <SectionWrapper>
      <h2 className="text-2xl font-semibol</div> text-gray-200 mb-4 tracking-tight">
        Primitives & Core Methods
      </h2>
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
            <div className="grid grid-cols-[20%_15%_25%_15%_20%] items-center gap-4">
              <div className="text-lg font-bold">.update()</div>
              <button
                onClick={() => {
                  state.simpleCounter.update((p) => p + 1);
                }}
                className="px-4 py-2 bg-blue-600  cursor-pointer  text-white rounded-lg hover:bg-blue-500 text-sm"
              >
                Increment
              </button>{' '}
              <CodeSnippetDisplay
                code={`state.simpleCounter.update((prev) => prev + 1);`}
              />
              <span className="text-green-400">
                {state.simpleCounter.get()}
              </span>
              <CodeSnippetDisplay code={`state.simpleCounter.get();`} />
            </div>
          </div>
          <div className="bg-black/20 rounded-lg p-4">
            <div className="grid grid-cols-[20%_15%_25%_15%_20%] items-center gap-4">
              <div className="text-lg font-bold">.toggle()</div>
              <button
                onClick={() => state.isBooleanValue.toggle()}
                className={`px-4 py-2 cursor-pointer text-white rounded-lg hover:bg-green-700 text-sm ${
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
          </div>{' '}
          <div className="bg-black/20 rounded-lg p-4">
            Below are the signal versions
          </div>
          <div className="bg-black/20 rounded-lg p-4">
            <div className="grid grid-cols-[20%_15%_25%_15%_20%] items-center gap-4">
              <div className="text-lg font-bold">.update()</div>
              <button
                onClick={() => {
                  state.simpleCounter2.update((p) => p + 1);
                }}
                className="px-4 py-2 bg-blue-600 cursor-pointer text-white rounded-lg hover:bg-blue-500 text-sm"
              >
                Increment
              </button>{' '}
              <CodeSnippetDisplay
                code={`state.simpleCounter2.update((prev) => prev + 1);`}
              />
              <span className="text-green-400">
                {state.simpleCounter2.$get()}
              </span>
              <CodeSnippetDisplay code={`state.simpleCounter2.$get();`} />
            </div>
          </div>
          <div className="bg-black/20 rounded-lg p-4">
            <div className="grid grid-cols-[20%_15%_25%_15%_20%] items-center gap-4">
              <div className="text-lg font-bold">.toggle()</div>
              <button
                onClick={() => state.isBooleanValue2.toggle()}
                className={`px-4 py-2 text-white rounded-lg  cursor-pointer hover:bg-green-700 bg-gray-400 text-sm `}
              >
                is Boolean Value
              </button>
              <CodeSnippetDisplay code={`state.isBooleanValue2.toggle();`} />
              <span className="text-green-400">
                {state.isBooleanValue2.$get().valueOf()}
              </span>
              <CodeSnippetDisplay code={`state.isBooleanValue2.$get();`} />
            </div>
          </div>
          <div className=" p-4">
            <p>
              {' '}
              You may notice in the signal based toggle example above, the
              button itself is not changing color. That is because the signal
              can only exist in a dom node, if we alter the classes (which is
              possible) then react can lose track of the element and the event
              handlers.
            </p>
            <p>
              The toggle example below is the "formElement" way to do it, which
              isolates the form element and allows in place updates.
            </p>
          </div>
          <div className="bg-black/20 rounded-lg p-4">
            <div className="grid grid-cols-[20%_15%_25%_15%_20%] items-center gap-4">
              <div className="text-lg font-bold">.toggle()</div>
              {state.isBooleanValue2.formElement((obj) => (
                <button
                  onClick={() => obj.toggle()}
                  className={`px-4 py-2 text-white rounded-lg  cursor-pointer hover:bg-green-700 text-sm ${
                    obj.get() ? 'bg-green-500' : 'bg-gray-700'
                  }`}
                >
                  is Boolean Value
                </button>
              ))}

              <CodeSnippetDisplay
                code={`state.isBooleanValue2.formElement((obj) => (
                <button
                  onClick={() => obj.toggle()}...`}
              />
              <span className="text-green-400">
                {state.isBooleanValue2.$get().valueOf()}
              </span>
              <CodeSnippetDisplay code={`state.isBooleanValue2.$get();`} />
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
      {' '}
      <SectionWrapper>
        {' '}
        <h2 className="text-2xl font-semibold text-gray-200 mb-4 tracking-tight">
          Form Bindings
        </h2>
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
              {state.firstName.formElement((obj) => (
                <FlashWrapper>
                  <input
                    {...obj.inputProps}
                    placeholder="John"
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  />{' '}
                </FlashWrapper>
              ))}
              First Name (copy to show binding)
              {state.firstName.formElement((obj) => (
                <FlashWrapper>
                  {' '}
                  <input
                    {...obj.inputProps}
                    placeholder="John"
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  />{' '}
                </FlashWrapper>
              ))}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Last Name
              </label>

              {state.lastName.formElement((obj) => (
                <FlashWrapper>
                  {' '}
                  <input
                    {...obj.inputProps}
                    placeholder="Doe"
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  />{' '}
                </FlashWrapper>
              ))}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>

              {state.email.formElement((obj) => (
                <FlashWrapper>
                  {' '}
                  <input
                    {...obj.inputProps}
                    type="email"
                    placeholder="john.doe@example.com"
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  />{' '}
                </FlashWrapper>
              ))}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>

              {state.phoneNumber.formElement((obj) => (
                <FlashWrapper>
                  {' '}
                  <input
                    {...obj.inputProps}
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  />{' '}
                </FlashWrapper>
              ))}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Country
              </label>

              {state.country.formElement((obj) => (
                <FlashWrapper>
                  {' '}
                  <select
                    value={obj.get()}
                    onChange={(e) => obj.update(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  >
                    <option value="us">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="ca">Canada</option>
                    <option value="au">Australia</option>
                  </select>{' '}
                </FlashWrapper>
              ))}
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Theme Preference
              </label>

              {state.theme.formElement((obj) => (
                <FlashWrapper>
                  {' '}
                  <select
                    value={obj.get()}
                    onChange={(e) => obj.update(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>{' '}
                </FlashWrapper>
              ))}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 border-t border-gray-700 pt-4">
            <div className="flex items-center gap-3">
              {state.newsletter.formElement((obj) => (
                <FlashWrapper>
                  {' '}
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-blue-500 rounded"
                    checked={obj.get()}
                    onChange={() => obj.toggle()}
                  />{' '}
                </FlashWrapper>
              ))}

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
// --- Enhanced Array Example ---
function ArrayManipulationExample() {
  const state = useCogsState('appData');
  const todos = state.todoList;
  const selectedTodo = todos.getSelected();

  return (
    <SectionWrapper>
      <h2 className="text-2xl font-semibold text-gray-200 mb-4 tracking-tight">
        Array Manipulation
      </h2>

      <div className="px-12 py-8">
        <div className="prose prose-invert mb-6 max-w-none">
          <p className="text-sm text-gray-300 leading-relaxed">
            Arrays in Cogs State support rich manipulation methods like{' '}
            <code className="text-purple-400 bg-gray-800 px-1 py-0.5 rounded">
              .insert()
            </code>
            ,{' '}
            <code className="text-red-400 bg-gray-800 px-1 py-0.5 rounded">
              .cut()
            </code>
            , and{' '}
            <code className="text-blue-400 bg-gray-800 px-1 py-0.5 rounded">
              .getSelected()
            </code>
            . Items can be selected with{' '}
            <code className="text-green-400 bg-gray-800 px-1 py-0.5 rounded">
              .toggleSelected()
            </code>{' '}
            and operations can target selected items directly.
          </p>
        </div>

        {/* Condensed Todo List Display */}
        <div className="bg-black/20 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-400 mb-2">
            Current Todos ({todos.get().length} items):
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {todos.get().length > 0 ? (
              todos.stateList((todo, index) => {
                const isSelected = todo._selected;
                return (
                  <div
                    key={todo.id.get()}
                    className={`flex items-center gap-2 px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-800/50 text-blue-300'
                        : 'bg-gray-800/30 text-gray-400 hover:bg-gray-700/30'
                    }`}
                    onClick={() => todo.toggleSelected()}
                  >
                    <input
                      type="checkbox"
                      checked={todo.done.get()}
                      onChange={(e) => todo.done.update(e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-3 h-3 accent-green-500"
                    />
                    <span className={todo.done.get() ? 'line-through' : ''}>
                      {todo.text.get()}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500 text-center py-2 text-xs">
                Empty list
              </div>
            )}
          </div>
          {selectedTodo && (
            <div className="text-xs text-gray-400 mt-2 border-t border-gray-700 pt-2">
              Selected:{' '}
              <span className="text-blue-400">{selectedTodo.text.get()}</span>
            </div>
          )}
        </div>

        {/* Button Action Rows */}
        <div className="grid gap-6">
          {/* Insert Operations */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="grid grid-cols-[15%_35%_15%_30%] items-center gap-4">
              <button
                onClick={() => {
                  todos.insert(({ uuid }) => ({
                    id: uuid,
                    text: `Todo ${todos.get().length + 1}`,
                    done: false,
                  }));
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 text-sm"
              >
                Add Todo
              </button>
              <CodeSnippetDisplay
                code={`todos.insert(({ uuid }) => ({
  id: uuid,
  text: \`Todo \${todos.get().length + 1}\`,
  done: false,
}));`}
              />
              <div className="text-gray-200 font-medium">
                Count:{' '}
                <span className="text-purple-400">{todos.get().length}</span>
              </div>
              <CodeSnippetDisplay code={`todos.get().length`} />
            </div>
          </div>

          {/* Cut First */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="grid grid-cols-[15%_35%_15%_30%] items-center gap-4">
              <button
                onClick={() => todos.cut(0)}
                disabled={todos.get().length === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 text-sm"
              >
                Cut First
              </button>
              <CodeSnippetDisplay code={`todos.cut(0);`} />
              <div className="text-gray-200 font-medium">
                First:{' '}
                <span className="text-red-400">
                  {todos.get().length > 0 ? todos.get()[0].text : 'None'}
                </span>
              </div>
              <CodeSnippetDisplay code={`todos.get()[0]?.text`} />
            </div>
          </div>

          {/* Cut Selected */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="grid grid-cols-[15%_35%_15%_30%] items-center gap-4">
              <button
                onClick={() => todos.cutSelected()}
                disabled={!selectedTodo}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 text-sm"
              >
                Cut Selected
              </button>
              <CodeSnippetDisplay code={`todos.cutSelected();`} />
              <div className="text-gray-200 font-medium">
                Selected:{' '}
                <span className="text-red-400">
                  {selectedTodo ? selectedTodo.text.get() : 'None'}
                </span>
              </div>
              <CodeSnippetDisplay code={`todos.getSelected()?.text`} />
            </div>
          </div>

          {/* Toggle Selection */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="grid grid-cols-[15%_35%_15%_30%] items-center gap-4">
              <button
                onClick={() => {
                  if (todos.get().length > 0) {
                    todos.index(0)?.toggleSelected();
                  }
                }}
                disabled={todos.get().length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-sm"
              >
                Select First
              </button>
              <CodeSnippetDisplay code={`todos.index(0)?.toggleSelected();`} />
              <div className="text-gray-200 font-medium">
                Index:{' '}
                <span className="text-blue-400">
                  {todos.getSelectedIndex() !== -1
                    ? todos.getSelectedIndex()
                    : 'None'}
                </span>
              </div>
              <CodeSnippetDisplay code={`todos.getSelectedIndex()`} />
            </div>
          </div>

          {/* Clear Selection */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="grid grid-cols-[15%_35%_15%_30%] items-center gap-4">
              <button
                onClick={() => todos.clearSelected()}
                disabled={!selectedTodo}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 disabled:bg-gray-700 disabled:text-gray-500 text-sm"
              >
                Clear Selection
              </button>
              <CodeSnippetDisplay code={`todos.clearSelected();`} />
              <div className="text-gray-200 font-medium">
                Has Selection:{' '}
                <span className="text-gray-400">
                  {selectedTodo ? 'Yes' : 'No'}
                </span>
              </div>
              <CodeSnippetDisplay code={`!!todos.getSelected()`} />
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
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

      <CounterExample />

      <FormElementsExample />

      <ArrayManipulationExample />
      <div className="h-40" />
    </div>
  );
}
