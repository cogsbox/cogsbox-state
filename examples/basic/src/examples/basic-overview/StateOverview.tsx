'use client';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import DotPattern from '../../DotWrapper';
import { useCogsState } from './state';
import { FlashWrapper } from '../../FlashOnUpdate';

function SectionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <FlashWrapper>
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

// Setup and Types Section
function SetupSection() {
  return (
    <SectionWrapper>
      <h2 className="text-3xl font-bold text-gray-100 mb-6">
        🏗️ Nested State Builder
      </h2>

      <div className="prose prose-invert max-w-none mb-8">
        <p className="text-lg text-gray-300 leading-relaxed">
          Cogs State is a{' '}
          <strong className="text-blue-400">nested state builder</strong> that
          creates a type-safe proxy mimicking your initial state structure.
          Every property in your state becomes a powerful state object with
          access to methods.
        </p>

        <div className="grid md:grid-cols-3 gap-4 my-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">Primitives</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <div>
                <code className="text-blue-400">.get()</code> - read values
              </div>
              <div>
                <code className="text-green-400">.update()</code> - set values
              </div>
              <div>
                <code className="text-purple-400">.toggle()</code> - flip
                booleans
              </div>
              <div>
                <code className="text-yellow-400">.formElement()</code> - bind
                to inputs
              </div>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-green-400 mb-2">Arrays</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <div>
                <code className="text-green-400">.index(n)</code> - access by
                position
              </div>
              <div>
                <code className="text-blue-400">.insert()</code> - add items at
                index or end
              </div>
              <div>
                <code className="text-red-400">.cut()</code> - remove items at
                index or end
              </div>
              <div>
                <code className="text-orange-400">.setSelected()</code> - mark
                an object in an array as selected
              </div>
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-purple-400 mb-2">Iterators</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <div>
                <code className="text-purple-400">.stateMap()</code> - state
                method enriched version of map
              </div>
              <div>
                <code className="text-yellow-400">.stateList()</code> - JSX
                "state isolated" list
              </div>
              <div>
                <code className="text-cyan-400">.stateFilter()</code> - filter
                items
              </div>
              <div>
                <code className="text-pink-400">.stateSort()</code> - sort items
              </div>
            </div>
          </div>
        </div>

        <p className="text-gray-300 leading-relaxed">
          Instead of complex useState drilling and manual mapping, you directly
          access nested properties and use built-in methods. Arrays get special
          treatment with selection tracking and efficient rendering methods.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold text-blue-400 mb-4">
            🚀 Quick Setup
          </h3>
          <CodeSnippetDisplay
            code={`// 1. Define your state shape
const initialState = {
  user: {
    name: "John",
    settings: { theme: "dark" }
  },
  todos: [
    { id: 1, text: "Learn Cogs", done: false }
  ]
};

// 2. Create your state manager
const { useCogsState } = createCogsState(initialState);

// 3. Use in components
function MyComponent() {
  const state = useCogsState('myApp');
  
  // Direct access to deeply nested state
  return (
    <input 
      value={state.user.settings.theme.get()} 
      onChange={e => state.user.settings.theme.update(e.target.value)}
    />
  );
}`}
          />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-green-400 mb-4">
            📝 Key Types
          </h3>
          <CodeSnippetDisplay
            code={`// State object with all methods
type StateObject<T> = {
  get(): T;
  update(value: T | (prev: T) => T): void;
  toggle(): void; // for booleans
  formElement(render: FormControl<T>): JSX.Element;
  
  // Array methods
  insert(item): void;
  cut(index?): void;
  stateMap(fn): JSX.Element[];
  stateList(fn): JSX.Element;
  getSelected(): StateObject<T> | undefined;
  
  // Plus all your nested properties...
} & YourStateShape;

// Form control function
type FormControl<T> = (params: {
  inputProps: { value, onChange, onBlur, ref };
  get(): T;
  update(value): void;
}) => JSX.Element;`}
          />
        </div>
      </div>
    </SectionWrapper>
  );
}

// Comparison Section - useState vs Cogs
function ComparisonSection() {
  return (
    <SectionWrapper>
      <h2 className="text-3xl font-bold text-gray-100 mb-6">
        ⚡ useState vs Cogs State
      </h2>

      <div className="prose prose-invert max-w-none mb-6">
        <p className="text-lg text-gray-300 leading-relaxed">
          See how Cogs eliminates complex state drilling and immutable update
          patterns.
          <strong className="text-orange-400 ml-2">
            Most operations happen in-place during rendering
          </strong>{' '}
          - no manual loops or complex update logic needed.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* useState Example */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
            <span className="text-2xl">😰</span>
            Traditional useState
          </h3>

          <CodeSnippetDisplay
            code={`// Initial state
const [teams, setTeams] = useState([
  { id: 1, name: "Frontend", members: [
    { id: 1, name: "Alice", role: "dev" },
    { id: 2, name: "Bob", role: "design" }
  ]}
]);

// 1. Change Bob's role (teams[0].members[1].role)
setTeams(prev => prev.map((team, teamIdx) => 
  teamIdx === 0 ? {
    ...team,
    members: team.members.map((member, memberIdx) =>
      memberIdx === 1 ? 
        { ...member, role: "frontend" } : 
        member
    )
  } : team
));

// 2. Change team name (teams[0].name)
setTeams(prev => prev.map((team, teamIdx) =>
  teamIdx === 0 ?
    { ...team, name: "UI Team" } :
    team
));

// 3. Render loop with editable inputs
{teams.map((team, teamIdx) => (
  <div key={team.id}>
    <h3>{team.name}</h3>
    {team.members.map((member, memberIdx) => (
      <input 
        key={member.id}
        value={member.name}
        onChange={e => {
          setTeams(prev => prev.map((t, tIdx) => 
            tIdx === teamIdx ? {
              ...t,
              members: t.members.map((m, mIdx) =>
                mIdx === memberIdx ? 
                  { ...m, name: e.target.value } : 
                  m
              )
            } : t
          ));
        }}
      />
    ))}
  </div>
))}`}
          />
        </div>

        {/* Cogs Example */}
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            Cogs State
          </h3>

          <CodeSnippetDisplay
            code={`// Initial state
const [teams, setTeams] = useState([
  { id: 1, name: "Frontend", members: [
    { id: 1, name: "Alice", role: "dev" },
    { id: 2, name: "Bob", role: "design" }
  ]}
]);

const teams = useCogsState('teams');

// 1. Change Bob's role (teams[0].members[1].role)
teams.index(0).members.index(1).role.update("frontend");

// 2. Change team name (teams[0].name)
teams.index(0).name.update("UI Team");

// 3. Render loop with editable inputs
{teams.stateMap((team, teamIdx) => (
  <div key={team.id.get()}>
    <h3>{team.name.get()}</h3>
    {team.members.stateMap((member, memberIdx) => (
      <input 
        key={member.id.get()}
        value={member.name.get()}
        onChange={e => member.name.update(e.target.value)}
      />
    ))}
  </div>
))}`}
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong>Key Advantage:</strong> Notice how{' '}
          <code className="text-yellow-400">stateList</code> and{' '}
          <code className="text-yellow-400">formElement</code>
          handle the rendering and updates in-place. No manual mapping, no
          complex onChange handlers, no drilling through nested objects.
        </p>
      </div>
    </SectionWrapper>
  );
}

// Core Methods Demo
function CoreMethodsDemo() {
  const state = useCogsState('testData');

  return (
    <SectionWrapper>
      <h2 className="text-3xl font-bold text-gray-100 mb-6">🔧 Core Methods</h2>

      <div className="prose prose-invert max-w-none mb-6">
        <p className="text-gray-300 leading-relaxed">
          Every state property gets powerful methods. Here's a single state
          object demonstrating the core functionality.
        </p>
      </div>

      <CodeSnippetDisplay
        title="Single Hook Call"
        code={`const state = useCogsState('testData');`}
      />

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        {/* Reactive Methods */}
        <div className="bg-blue-500/3 border border-blue-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚛️</span>
            Reactive Methods (.get)
          </h3>

          <div className="space-y-4">
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-300">
                  .update()
                </span>
                <button
                  onClick={() => state.simpleCounter.update((prev) => prev + 1)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm"
                >
                  Increment
                </button>
              </div>
              <CodeSnippetDisplay
                code={`state.simpleCounter.update(prev => prev + 1)`}
              />
              <div className="mt-2 text-green-400 font-mono">
                Current: {state.simpleCounter.get()}
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-300">
                  .toggle()
                </span>
                <button
                  onClick={() => state.isBooleanValue.toggle()}
                  className={`px-3 py-1 text-white rounded text-sm transition-colors ${
                    state.isBooleanValue.get()
                      ? 'bg-green-500 hover:bg-green-400'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                >
                  Toggle
                </button>
              </div>
              <CodeSnippetDisplay code={`state.isBooleanValue.toggle()`} />
              <div className="mt-2 text-green-400 font-mono">
                Current: {state.isBooleanValue.get() ? 'true' : 'false'}
              </div>
            </div>
          </div>
        </div>

        {/* Signal Methods */}
        <div className="bg-green-500/3 border border-green-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            Signal Methods (.$get)
          </h3>

          <div className="space-y-4">
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-300">
                  .$get()
                </span>
                <button
                  onClick={() =>
                    state.simpleCounter2.update((prev) => prev + 1)
                  }
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 text-sm"
                >
                  Increment
                </button>
              </div>
              <CodeSnippetDisplay
                code={`state.simpleCounter2.update(prev => prev + 1)`}
              />
              <div className="mt-2 text-green-400 font-mono">
                Signal: {state.simpleCounter2.$get()}
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-300">
                  .formElement()
                </span>
                {state.isBooleanValue2.formElement((obj) => (
                  <button
                    onClick={() => obj.toggle()}
                    className={`px-3 py-1 text-white rounded text-sm transition-colors ${
                      obj.get()
                        ? 'bg-purple-500 hover:bg-purple-400'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    Isolated Toggle
                  </button>
                ))}
              </div>
              <CodeSnippetDisplay
                code={`state.isBooleanValue2.formElement((obj) => (
  <button
    onClick={() => obj.toggle()}
    className={\`\${obj.get() ? 'bg-purple-500' : 'bg-gray-700'}\`}
  >
    Isolated Toggle
  </button>
))`}
              />
              <div className="mt-2 text-green-400 font-mono">
                Isolated: {state.isBooleanValue2.$get().valueOf()}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
            <p className="text-xs text-yellow-300/80">
              <strong>Note:</strong> Signal-based updates don't trigger React
              re-renders. Use{' '}
              <code className="text-yellow-400">.formElement()</code> for
              isolated components that manage their own updates.
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

// Array Operations Demo
function ArrayOperationsDemo() {
  const state = useCogsState('testData');
  const todos = state.todoList;
  const selectedTodo = todos.getSelected();

  return (
    <SectionWrapper>
      <h2 className="text-3xl font-bold text-gray-100 mb-6">
        📋 Array Operations & Selection
      </h2>

      <div className="prose prose-invert max-w-none mb-6">
        <p className="text-gray-300 leading-relaxed">
          Arrays are first-class citizens with built-in selection tracking and
          metadata. Use{' '}
          <code className="text-purple-400 bg-gray-800 px-2 py-1 rounded">
            .stateList()
          </code>{' '}
          for in-place rendering with automatic key management.
        </p>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div>
          <h3 className="text-xl font-semibold text-purple-400 mb-4">
            Array Methods
          </h3>

          <div className="space-y-4">
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-300">
                  Add Item
                </span>
                <button
                  onClick={() => {
                    todos.insert(({ uuid }) => ({
                      id: uuid,
                      text: `Todo ${todos.get().length + 1}`,
                      done: false,
                    }));
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500 text-sm"
                >
                  Add Todo
                </button>
              </div>
              <CodeSnippetDisplay
                code={`todos.insert(({ uuid }) => ({
  id: uuid,
  text: \`Todo \${todos.get().length + 1}\`,
  done: false,
}))`}
              />
              <div className="mt-2 text-gray-300">
                Count:{' '}
                <span className="text-purple-400 font-mono">
                  {todos.get().length}
                </span>
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-300">
                  Remove Selected
                </span>
                <button
                  onClick={() => todos.cutSelected()}
                  disabled={!selectedTodo}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 text-sm"
                >
                  Cut Selected
                </button>
              </div>
              <CodeSnippetDisplay code={`todos.cutSelected()`} />
              <div className="mt-2 text-gray-300">
                Selected:{' '}
                <span className="text-red-400 font-mono">
                  {selectedTodo ? selectedTodo.text.get() : 'None'}
                </span>
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-300">
                  Select First
                </span>
                <button
                  onClick={() => {
                    if (todos.get().length > 0) {
                      todos.index(0)?.toggleSelected();
                    }
                  }}
                  disabled={todos.get().length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-sm"
                >
                  Toggle First
                </button>
              </div>
              <CodeSnippetDisplay code={`todos.index(0)?.toggleSelected()`} />
              <div className="mt-2 text-gray-300">
                Index:{' '}
                <span className="text-blue-400 font-mono">
                  {todos.getSelectedIndex() !== -1
                    ? todos.getSelectedIndex()
                    : 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Todo List Display */}
        <div>
          <h3 className="text-xl font-semibold text-green-400 mb-4">
            Live Todo List
          </h3>
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 min-h-[600px]">
            <div className="text-sm text-gray-400 mb-3">
              Using .stateList() for in-place rendering:
            </div>

            <CodeSnippetDisplay
              code={`{todos.stateList((todo, index) => (
  <TodoItem 
    key={todo.id.get()} 
    todo={todo} 
    onClick={() => todo.toggleSelected()}
  />
))}`}
            />

            <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
              {todos.get().length > 0 ? (
                todos.stateList((todo, index) => (
                  <div
                    key={todo.id.get()}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm cursor-pointer transition-colors ${
                      todo.isSelected
                        ? 'bg-blue-800/50 text-blue-300 border border-blue-600/30'
                        : 'bg-gray-800/30 text-gray-400 hover:bg-gray-700/30'
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
                    <span className={todo.done.get() ? 'line-through' : ''}>
                      {todo.text.get()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-4 text-sm">
                  No todos yet - click "Add Todo" to start
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

// Navigation Section
function NavigationSection() {
  return (
    <SectionWrapper>
      <h2 className="text-3xl font-bold text-gray-100 mb-6">
        🧭 Explore More Features
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            Form Bindings & Auto-Debouncing
          </h3>
          <p className="text-gray-300 mb-4">
            Automatic two-way binding with intelligent debouncing. Form elements
            maintain local state during typing and sync to global state after
            pauses.
          </p>
          <CodeSnippetDisplay
            code={`// Auto-debounced input with validation
state.firstName.formElement(({ inputProps }) => (
  <input {...inputProps} placeholder="John" />
))

// Complex form with multiple bindings
state.country.formElement(({ state }) => (
  <select value={state.get()} onChange={e => state.update(e.target.value)}>
    <option value="us">United States</option>
  </select>
))`}
          />
          <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500 text-sm">
            → View Form Bindings Page
          </button>
        </div>

        <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-orange-400 mb-4 flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            Advanced Features
          </h3>
          <p className="text-gray-300 mb-4">
            Virtualization, streaming, filtering, sorting, server sync, and
            more. Built-in optimizations for large datasets and real-time
            applications.
          </p>
          <CodeSnippetDisplay
            code={`// Virtual scrolling for large lists
const { virtualState, virtualizerProps } = 
  messages.useVirtualView({ itemHeight: 50, stickToBottom: true });

// Real-time streaming
const stream = messages.stream({ bufferSize: 100 });
stream.write(newMessage);

// Filtering and sorting
messages.stateFilter(msg => msg.important)
       .stateSort((a, b) => a.timestamp - b.timestamp)`}
          />
          <button className="mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-500 text-sm">
            → View Advanced Features
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
}

// Main Component
export default function CogsStateOverview() {
  return (
    <div className="flex-1 flex flex-col gap-8">
      <DotPattern>
        <div className="px-8 py-6">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">Cogs State</h1>
          <p className="text-xl text-gray-400 max-w-3xl">
            Type-safe nested state management that mimics your data structure.
            No drilling, no complex updates, no boilerplate.
          </p>
        </div>
      </DotPattern>

      <div className="px-8 space-y-8">
        <SetupSection />
        <ComparisonSection />
        <CoreMethodsDemo />
        <ArrayOperationsDemo />
        <NavigationSection />
      </div>

      <div className="h-20" />
    </div>
  );
}
