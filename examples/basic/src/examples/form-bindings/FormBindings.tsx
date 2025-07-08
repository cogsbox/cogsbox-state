'use client';

import { useEffect, useRef, useState, createElement, useMemo } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import DotPattern from '../../DotWrapper';
import { useCogsState } from './state';
import { FlashWrapper } from '../../FlashOnUpdate';

function SectionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <FlashWrapper showCounter={true}>
      <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-6 text-white">
        {children}
      </div>
    </FlashWrapper>
  );
}

function CodeSnippetDisplay({
  title,
  code,
  language = 'typescript',
}: {
  title?: string;
  code: string;
  language?: string;
}) {
  return (
    <div className="mt-4">
      {title && (
        <h4 className="text-gray-400 text-sm font-semibold mb-2 uppercase tracking-wider">
          {title}
        </h4>
      )}
      <div className="bg-gray-950 rounded-lg overflow-hidden border border-gray-800">
        <SyntaxHighlighter
          language={language}
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
    </div>
  );
}

// Form Concepts Section
function FormConceptsSection() {
  return (
    <SectionWrapper>
      <h2 className="text-3xl font-bold text-gray-100 mb-6">
        📝 Form Binding Concepts
      </h2>

      <div className="prose prose-invert max-w-none mb-8">
        <p className="text-lg text-gray-300 leading-relaxed">
          The{' '}
          <code className="text-purple-400 bg-gray-800 px-2 py-1 rounded">
            .formElement()
          </code>{' '}
          method provides automatic two-way binding with intelligent debouncing.
          Each form element maintains its own local state during typing, syncing
          to the global state only after the user pauses or blurs the input.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold text-blue-400 mb-4">
            🔄 How It Works
          </h3>
          <CodeSnippetDisplay
            code={`// Basic form element
state.firstName.formElement(({ inputProps }) => (
  <input {...inputProps} placeholder="Enter name" />
))

// The inputProps object includes:
// - value: current state value
// - onChange: debounced state updater  
// - onBlur: immediate sync to global state
// - ref: for validation and focus management

// Advanced form element with custom logic
state.email.formElement(({ inputProps, get, update }) => (
  <div>
    <input 
      {...inputProps}
      type="email"
      className={isValidEmail(get()) ? 'valid' : 'invalid'}
    />
    <button onClick={() => update('')}>Clear</button>
  </div>
))`}
          />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-green-400 mb-4">
            ⚡ Key Benefits
          </h3>
          <div className="space-y-4">
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-300 mb-2">
                Automatic Debouncing
              </h4>
              <p className="text-sm text-gray-300">
                200ms default debounce prevents excessive updates while typing.
                Customizable per field with{' '}
                <code className="text-yellow-400">debounceTime</code> option.
              </p>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-300 mb-2">
                Isolated Updates
              </h4>
              <p className="text-sm text-gray-300">
                Form elements only re-render when their specific value changes,
                preventing unnecessary renders across your form.
              </p>
            </div>

            <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-purple-300 mb-2">
                Built-in Validation
              </h4>
              <p className="text-sm text-gray-300">
                Integration with validation systems. Automatic error clearing
                when values change.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

// Live Form Demo
function LiveFormDemo() {
  const state = useCogsState('formData');

  return (
    <div className="grid grid-cols-[70%_30%] gap-6">
      <SectionWrapper>
        <h2 className="text-3xl font-bold text-gray-100 mb-6">
          🚀 Live Form Example
        </h2>

        <div className="prose prose-invert max-w-none mb-6">
          <p className="text-gray-300 leading-relaxed">
            A complete form with multiple input types, all using{' '}
            <code className="text-purple-400 bg-gray-800 px-2 py-1 rounded">
              .formElement()
            </code>
            for automatic binding. Notice the duplicated first name field to
            demonstrate binding synchronization.
          </p>
        </div>

        <CodeSnippetDisplay
          title="Form Setup"
          code={`const state = useCogsState('formData');

// Each field automatically syncs
state.firstName.formElement(({ inputProps }) => (
  <input {...inputProps} placeholder="John" />
))

// Custom debounce timing
state.email.formElement(({ inputProps }) => (
  <input {...inputProps} type="email" />
), { debounceTime: 500 })

// Complex controls
state.country.formElement(({ get, update }) => (
  <select value={get()} onChange={e => update(e.target.value)}>
    <option value="us">United States</option>
  </select>
))`}
        />

        <div className="mt-8 space-y-6">
          {/* Form Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                First Name
              </label>
              {state.firstName.formElement((obj) => (
                <FlashWrapper showCounter={true}>
                  <input
                    {...obj.inputProps}
                    placeholder="John"
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </FlashWrapper>
              ))}

              <div className="mt-2">
                <label className="block text-xs text-gray-500 mb-1">
                  Duplicate (shows binding sync)
                </label>
                {state.firstName.formElement((obj) => (
                  <FlashWrapper showCounter={true}>
                    <input
                      {...obj.inputProps}
                      placeholder="Bound to same state"
                      className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-500 rounded focus:border-purple-500 focus:outline-none transition-colors text-sm"
                    />
                  </FlashWrapper>
                ))}
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Last Name
              </label>
              {state.lastName.formElement((obj) => (
                <FlashWrapper showCounter={true}>
                  <input
                    {...obj.inputProps}
                    placeholder="Doe"
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </FlashWrapper>
              ))}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              {state.email.formElement((obj) => (
                <FlashWrapper showCounter={true}>
                  <input
                    {...obj.inputProps}
                    type="email"
                    placeholder="john.doe@example.com"
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </FlashWrapper>
              ))}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              {state.phoneNumber.formElement((obj) => (
                <FlashWrapper showCounter={true}>
                  <input
                    {...obj.inputProps}
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </FlashWrapper>
              ))}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Country
              </label>
              {state.country.formElement((obj) => (
                <FlashWrapper showCounter={true}>
                  <select
                    value={obj.get()}
                    onChange={(e) => obj.update(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="us">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="ca">Canada</option>
                    <option value="au">Australia</option>
                  </select>
                </FlashWrapper>
              ))}
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Theme Preference
              </label>
              {state.theme.formElement((obj) => (
                <FlashWrapper showCounter={true}>
                  <select
                    value={obj.get()}
                    onChange={(e) => obj.update(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </FlashWrapper>
              ))}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 border-t border-gray-700 pt-6">
            <div className="flex items-center gap-3">
              {state.newsletter.formElement((obj) => (
                <FlashWrapper showCounter={true}>
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-blue-500 rounded"
                    checked={obj.get()}
                    onChange={() => obj.toggle()}
                  />
                </FlashWrapper>
              ))}
              <label className="text-sm text-gray-300">
                Subscribe to newsletter for updates and special offers
              </label>
            </div>
          </div>

          {/* Days of Week Toggle */}
          <div className="border-t border-gray-700 pt-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Notification Days
            </label>
            {state.daysOfWeek.formElement((obj) => (
              <FlashWrapper showCounter={true}>
                <div className="flex gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                    (day, idx) => (
                      <button
                        key={idx}
                        onClick={() => obj.toggleByValue(idx)}
                        className={`px-3 py-2 rounded text-sm transition-colors ${
                          obj.get().includes(idx)
                            ? 'bg-blue-600 text-white hover:bg-blue-500'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {day}
                      </button>
                    )
                  )}
                </div>
              </FlashWrapper>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Live State Display */}
      <ReactiveFormDisplay />
    </div>
  );
}

// Reactive form display
function ReactiveFormDisplay() {
  const state = useCogsState('formData');

  return (
    <FlashWrapper showCounter={true}>
      <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 sticky top-6">
        <h3 className="text-gray-300 text-lg font-semibold mb-4">
          🔄 Live State Updates
        </h3>

        <div className="space-y-4 text-sm">
          {(state.firstName.get() || state.lastName.get()) && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
              <span className="text-blue-400 font-medium">Full Name:</span>
              <div className="text-gray-200 mt-1">
                {state.firstName.$get()} {state.lastName.$get()}
              </div>
            </div>
          )}

          {state.email.get() && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
              <span className="text-green-400 font-medium">Email:</span>
              <div className="text-gray-200 mt-1">{state.email.$get()}</div>
            </div>
          )}

          {state.phoneNumber.get() && (
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3">
              <span className="text-purple-400 font-medium">Phone:</span>
              <div className="text-gray-200 mt-1">
                {state.phoneNumber.$get()}
              </div>
            </div>
          )}

          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
            <span className="text-yellow-400 font-medium">Country:</span>
            <div className="text-gray-200 mt-1">
              {state.country.get() === 'us' && 'United States'}
              {state.country.get() === 'uk' && 'United Kingdom'}
              {state.country.get() === 'ca' && 'Canada'}
              {state.country.get() === 'au' && 'Australia'}
            </div>
          </div>

          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-3">
            <span className="text-indigo-400 font-medium">Theme:</span>
            <div className="text-gray-200 mt-1 capitalize">
              {state.theme.$get()}
            </div>
          </div>

          <div className="bg-pink-500/5 border border-pink-500/20 rounded-lg p-3">
            <span className="text-pink-400 font-medium">Newsletter:</span>
            <div className="text-gray-200 mt-1">
              {state.newsletter.get() ? '✅ Subscribed' : '❌ Not subscribed'}
            </div>
          </div>

          <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
            <span className="text-orange-400 font-medium">
              Notification Days:
            </span>
            <div className="text-gray-200 mt-1">
              {state.daysOfWeek.get().length > 0
                ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                    .filter((_, i) => state.daysOfWeek.get().includes(i))
                    .join(', ')
                : 'None selected'}
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 bg-gray-800/50 rounded border border-gray-600/30">
          <div className="text-xs text-gray-400 mb-2">Raw State JSON:</div>
          <pre className="text-xs text-gray-300 overflow-auto max-h-32">
            {JSON.stringify(state.get(), null, 2)}
          </pre>
        </div>
      </div>
    </FlashWrapper>
  );
}

// Advanced Form Features
function AdvancedFormFeatures() {
  const state = useCogsState('advancedForm');

  return (
    <SectionWrapper>
      <h2 className="text-3xl font-bold text-gray-100 mb-6">
        🛠️ Advanced Form Features
      </h2>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold text-purple-400 mb-4">
            Custom Debouncing
          </h3>
          <CodeSnippetDisplay
            code={`// Fast updates for simple fields
state.username.formElement(({ inputProps }) => (
  <input {...inputProps} />
), { debounceTime: 100 })

// Slower updates for complex validation
state.email.formElement(({ inputProps }) => (
  <input {...inputProps} type="email" />
), { debounceTime: 1000 })

// Immediate updates (no debouncing)
state.search.formElement(({ inputProps }) => (
  <input {...inputProps} placeholder="Search..." />
), { debounceTime: 0 })`}
          />

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fast Update (100ms debounce)
            </label>
            {state.fastField.formElement(
              (obj) => (
                <input
                  {...obj.inputProps}
                  placeholder="Fast updates..."
                  className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded focus:border-purple-500 focus:outline-none"
                />
              ),
              { debounceTime: 100 }
            )}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Slow Update (1000ms debounce)
            </label>
            {state.slowField.formElement(
              (obj) => (
                <input
                  {...obj.inputProps}
                  placeholder="Slow updates..."
                  className="w-full px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded focus:border-purple-500 focus:outline-none"
                />
              ),
              { debounceTime: 1000 }
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-green-400 mb-4">
            Complex Controls
          </h3>
          <CodeSnippetDisplay
            code={`// Multi-select with custom logic
state.tags.formElement(({ get, update }) => (
  <div className="tag-selector">
    {availableTags.map(tag => (
      <button
        key={tag}
        onClick={() => {
          const current = get();
          const updated = current.includes(tag)
            ? current.filter(t => t !== tag)
            : [...current, tag];
          update(updated);
        }}
        className={current.includes(tag) ? 'selected' : ''}
      >
        {tag}
      </button>
    ))}
  </div>
))

// Rich text or complex components
state.content.formElement(({ get, update }) => (
  <RichTextEditor
    value={get()}
    onChange={update}
    onBlur={() => {/* immediate sync */}}
  />
))`}
          />

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Multi-select Tags
            </label>
            {state.selectedTags.formElement((obj) => (
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', 'Node.js', 'GraphQL', 'Docker'].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        const current = obj.get();
                        const updated = current.includes(tag)
                          ? current.filter((t) => t !== tag)
                          : [...current, tag];
                        obj.update(updated);
                      }}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        obj.get().includes(tag)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            ))}

            <div className="mt-2 text-sm text-gray-400">
              Selected: {state.selectedTags.get().join(', ') || 'None'}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

// Toggle Reference Section
function ToggleReferenceSection() {
  const state = useCogsState('toggleDemo');

  return (
    <SectionWrapper>
      <h2 className="text-3xl font-bold text-gray-100 mb-6">
        🔄 Toggle Methods Reference
      </h2>

      <div className="prose prose-invert max-w-none mb-6">
        <p className="text-gray-300 leading-relaxed">
          Quick reference for the toggle functionality shown in the main
          overview. Boolean values get a special{' '}
          <code className="text-purple-400 bg-gray-800 px-2 py-1 rounded">
            .toggle()
          </code>{' '}
          method.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
          <h3 className="font-semibold text-blue-400 mb-3">Direct Toggle</h3>
          <CodeSnippetDisplay
            code={`// Simple boolean toggle
state.isVisible.toggle()

// In a button
<button onClick={() => state.isVisible.toggle()}>
  {state.isVisible.get() ? 'Hide' : 'Show'}
</button>`}
          />

          <div className="mt-4">
            <button
              onClick={() => state.simpleToggle.toggle()}
              className={`px-4 py-2 rounded text-white transition-colors ${
                state.simpleToggle.get()
                  ? 'bg-green-600 hover:bg-green-500'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            >
              {state.simpleToggle.get() ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
          <h3 className="font-semibold text-green-400 mb-3">
            Form Element Toggle
          </h3>
          <CodeSnippetDisplay
            code={`// Toggle within formElement
state.enabled.formElement(({ get, toggle }) => (
  <label>
    <input 
      type="checkbox" 
      checked={get()} 
      onChange={toggle}
    />
    Enable feature
  </label>
))`}
          />

          <div className="mt-4">
            {state.checkboxToggle.formElement((obj) => (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={obj.get()}
                  onChange={() => obj.toggle()}
                  className="w-4 h-4 accent-green-500"
                />
                <span className="text-gray-300">Enable notifications</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
          <h3 className="font-semibold text-purple-400 mb-3">Array Toggle</h3>
          <CodeSnippetDisplay
            code={`// Toggle items in/out of arrays
state.selectedItems.toggleByValue(itemId)

// Toggle multiple selections
items.map(item => (
  <button 
    onClick={() => state.selected.toggleByValue(item.id)}
    className={selected.includes(item.id) ? 'active' : ''}
  >
    {item.name}
  </button>
))`}
          />

          <div className="mt-4">
            <div className="text-sm text-gray-400 mb-2">
              Selected IDs: {state.selectedIds.get().join(', ') || 'None'}
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((id) => (
                <button
                  key={id}
                  onClick={() => state.selectedIds.toggleByValue(id)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    state.selectedIds.get().includes(id)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Item {id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong>Back to Overview:</strong> For more core functionality and
          setup instructions, return to the{' '}
          <button className="text-blue-400 underline hover:text-blue-300">
            main overview page
          </button>
          .
        </p>
      </div>
    </SectionWrapper>
  );
}

export default function CogsFormBindings() {
  return (
    <div className="flex-1 flex flex-col gap-8">
      <DotPattern>
        <div className="px-8 py-6">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">
            Form Bindings & Auto-Debouncing
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl">
            Automatic two-way binding with intelligent debouncing. Form elements
            maintain local state during typing and sync to global state after
            pauses.
          </p>
        </div>
      </DotPattern>

      <div className="px-8 space-y-8">
        <FormConceptsSection />
        <LiveFormDemo />
        <AdvancedFormFeatures />
        <ToggleReferenceSection />
      </div>

      <div className="h-20" />
    </div>
  );
}
