# Cogsbox State: A Comprehensive Guide

> **🚨 DANGER: DO NOT USE - UNSTABLE & EXPERIMENTAL 🚨**
>
> This library is in extremely early development and constantly changing.
>
> **DO NOT USE IN ANY PROJECT YET - ONLY FOR TESTING AND PROVIDING FEEDBACK.**

## What is Cogsbox State?

Cogsbox State is a React state management library that creates a **nested state builder** - a type-safe proxy that mimics your initial state structure. Every property in your state becomes a powerful state object with built-in methods for updates, arrays, forms, and more.

**Key Philosophy**: Instead of complex useState drilling and manual mapping, you directly access nested properties and use built-in methods.

## Getting Started

### Basic Setup

```typescript
import { createCogsState } from 'cogsbox-state';

// 1. Define your initial state structure
const initialState = {
  user: {
    name: "John",
    stats: {
      counter: 0,
      lastUpdated: null
    },
    age: 30,
    online:false
  },
  todos: [],
  settings: {
    darkMode: false,
    notifications: true
  }
};

// 2. Create your state manager
const { useCogsState } = createCogsState(initialState);

// 3. Use in components - access specific state slices by their keys
function UserComponent() {
  const user = useCogsState('user'); // Access the 'user' slice

  return (
    <div>
      <p>Name: {user.name.get()}</p>
      <p>Counter: {user.stats.counter.get()}</p>
      <button onClick={() => user.stats.counter.update(prev => prev + 1)}>
        Increment Counter
      </button>
    </div>
  );
}

function TodoComponent() {
  const todos = useCogsState('todos'); // Access the 'todos' slice

  return (
    <div>
      <p>Todo count: {todos.get().length}</p>
      <button onClick={() => todos.insert({ id: Date.now(), text: 'New todo', done: false })}>
        Add Todo
      </button>
    </div>
  );
}
```

## Core Concepts

### State Access Patterns

Every state property gets these core methods:

#### Primitives (strings, numbers, booleans)

- `.get()` - read values reactively
- `.update()` - set values
- `.toggle()` - flip booleans
- `.$get()` - non-reactive read (signals)
- `.$derive()` - computed signals

#### Objects

- All primitive methods plus access to nested properties
- `.update()` can do partial updates

#### Arrays

- All core methods plus array-specific operations
- Built-in selection tracking and metadata

### Reading State

```typescript
const user = useCogsState('user');
const todos = useCogsState('todos');
const settings = useCogsState('settings');

// Reactive reads (triggers re-renders)
const userName = user.name.get();
const allTodos = todos.get();
const isDarkMode = settings.darkMode.get();

// Access nested properties
const counterValue = user.stats.counter.get();
const firstTodo = todos.index(0)?.get();

// Non-reactive reads (no re-renders, for signals)
const userNameStatic = user.name.$get();

// Computed signals (transforms value without re-renders)
const todoCount = todos.$derive((todos) => todos.length);
```

### Updating State

```typescript
const user = useCogsState('user');
const settings = useCogsState('settings');
const todos = useCogsState('todos');

// Direct updates
user.name.update('Jane');
settings.darkMode.toggle();

// Functional updates
user.stats.counter.update((prev) => prev + 1);

// Object updates
user.update((prev) => ({ ...prev, name: 'Jane', age: 30 }));

// Deep nested updates
todos.index(0).text.update('Updated todo text');
```

## Working with Arrays

Arrays are first-class citizens with powerful built-in operations:

### Basic Array Operations

```typescript
const todos = useCogsState('todos');

// Add items
todos.insert({ id: 'uuid', text: 'New todo', done: false });
todos.insert(({ uuid }) => ({
  id: uuid,
  text: 'Auto-generated ID',
  done: false,
}));

// Remove items
todos.cut(2); // Remove at index 2
todos.cutSelected(); // Remove currently selected item

// Access items
const firstTodo = todos.index(0);
const lastTodo = todos.last();
```

### Array Iteration and Rendering

#### `stateMap()` - Enhanced Array Mapping

```typescript
const todos = useCogsState('todos');

// Returns transformed array, each item is a full state object
const todoElements = todos.stateMap((todoState, index, arrayState) => (
  <TodoItem
    key={todoState.id.get()}
    todo={todoState}
    onToggle={() => todoState.done.toggle()}
    onDelete={() => arrayState.cut(index)}
  />
));
```

#### `stateList()` - JSX List Rendering

```typescript
const todos = useCogsState('todos');

// Renders directly in place with automatic key management
{todos.stateList((todoState, index, arrayState) => (
  <div key={todoState.id.get()}>
    <span>{todoState.text.get()}</span>
    <button onClick={() => todoState.done.toggle()}>Toggle</button>
    <button onClick={() => arrayState.cut(index)}>Delete</button>
  </div>
))}
```

#### `$stateMap()` - Signal-Based Rendering

```typescript
const todos = useCogsState('todos');

// Most efficient - updates only changed items, no React re-renders
{todos.$stateMap((todoState, index, arrayState) => (
  <TodoItem todo={todoState} />
))}
```

### Advanced Array Methods

#### Filtering and Sorting

```typescript
const todos = useCogsState('todos');

// Filter items (returns new state object with filtered view)
const completedTodos = todos.stateFilter((todo) => todo.done);
const incompleteTodos = todos.stateFilter((todo) => !todo.done);

// Sort items (returns new state object with sorted view)
const sortedTodos = todos.stateSort((a, b) => a.text.localeCompare(b.text));

// Chain operations
const sortedCompletedTodos = todos
  .stateFilter((todo) => todo.done)
  .stateSort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
```

#### Finding and Searching

```typescript
const todos = useCogsState('todos');

// Find by property value
const todoById = todos.findWith('id', 'some-id');
if (todoById) {
  todoById.text.update('Updated text');
}

// Find with custom function
const firstIncompleteTodo = todos.stateFind((todo) => !todo.done);
```

#### Unique Operations

```typescript
const todos = useCogsState('todos');

// Insert only if unique (prevents duplicates)
todos.uniqueInsert(
  { id: 'new-id', text: 'New todo', done: false },
  ['id'], // Fields to check for uniqueness
  (existingItem) => {
    // Optional: callback if match found
    return { ...existingItem, text: 'Updated existing' };
  }
);

// Toggle presence (insert if missing, remove if present)
todos.toggleByValue('some-id');
```

#### Selection Management

```typescript
const todos = useCogsState('todos');

// Built-in selection tracking
const selectedTodo = todos.getSelected();
const selectedIndex = todos.getSelectedIndex();

// Set selection on individual items
todos.index(0).setSelected(true);
todos.index(0).toggleSelected();

// Clear all selections
todos.clearSelected();

// Check if item is selected
const isSelected = todos.index(0).isSelected;
```

### Virtualization for Large Lists

For performance with large datasets:

```typescript
function MessageList() {
  const messages = useCogsState('messages', { reactiveType: 'none' });

  const { virtualState, virtualizerProps, scrollToBottom } =
    messages.useVirtualView({
      itemHeight: 65,        // Height per item
      overscan: 10,         // Items to render outside viewport
      stickToBottom: true,  // Auto-scroll to bottom
      scrollStickTolerance: 75 // Distance tolerance for bottom detection
    });

  return (
    <div {...virtualizerProps.outer} className="h-96 overflow-auto">
      <div style={virtualizerProps.inner.style}>
        <div style={virtualizerProps.list.style}>
          {virtualState.stateList((messageState, index) => (
            <MessageItem key={messageState.id.get()} message={messageState} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Streaming for Real-time Data

```typescript
const messages = useCogsState('messages');

// Create a stream for efficient batch operations
const messageStream = messages.stream({
  bufferSize: 100, // Buffer size before auto-flush
  flushInterval: 100, // Auto-flush interval (ms)
  bufferStrategy: 'sliding', // 'sliding' | 'dropping' | 'accumulate'
  store: (buffer) => buffer, // Transform buffered items before insertion
  onFlush: (buffer) => console.log('Flushed', buffer.length, 'items'),
});

// Write individual items
messageStream.write(newMessage);

// Write multiple items
messageStream.writeMany([msg1, msg2, msg3]);

// Manual flush
messageStream.flush();

// Pause/resume
messageStream.pause();
messageStream.resume();

// Close stream
messageStream.close();
```

## Reactivity Control

Cogsbox offers different reactivity modes for performance optimization:

### Component Reactivity (Default)

```typescript
// Re-renders when any accessed state changes
const user = useCogsState('user');
// or explicitly:
const user = useCogsState('user', { reactiveType: 'component' });
```

### Dependency-Based Reactivity

```typescript
// Only re-renders when specified dependencies change
const user = useCogsState('user', {
  reactiveType: 'deps',
  reactiveDeps: (state) => [state.name, state.stats.counter],
});
```

### Full Reactivity

```typescript
// Re-renders on ANY change to the state slice
const user = useCogsState('user', { reactiveType: 'all' });
```

### No Reactivity

```typescript
// Never re-renders (useful with signals)
const todos = useCogsState('todos', { reactiveType: 'none' });
```

### Multiple Reactivity Types

```typescript
// Combine multiple reactivity modes
const user = useCogsState('user', {
  reactiveType: ['component', 'deps'],
  reactiveDeps: (state) => [state.online],
});
```

## Signal-Based Updates

The most efficient rendering method - bypasses React entirely:

```typescript
function PerformantComponent() {
  const user = useCogsState('user', { reactiveType: 'none' });
  const todos = useCogsState('todos', { reactiveType: 'none' });

  return (
    <div>
      {/* These update DOM directly, no React re-renders */}
      <div>Name: {user.name.$get()}</div>
      <div>Counter: {user.stats.counter.$get()}</div>
      <div>Todo Count: {todos.$derive(todos => todos.length)}</div>

      {/* Signal-based list rendering */}
      {todos.$stateMap((todo, index) => (
        <div key={todo.id.$get()}>
          <span>{todo.text.$get()}</span>
          <button onClick={() => todo.done.toggle()}>Toggle</button>
        </div>
      ))}

      {/* Wrap with formElement for isolated reactivity */}
      {user.stats.counter.formElement((obj) => (
        <button onClick={() => obj.update(prev => prev + 1)}>
          Increment: {obj.get()}
        </button>
      ))}
    </div>
  );
}
```

## Form Management

Cogsbox excels at form handling with automatic debouncing and validation:

### Basic Form Elements

```typescript
import { z } from 'zod';

// Define validation schema
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18+")
});

// Create state with validation
const { useCogsState } = createCogsState({
  userForm: {
    initialState: { name: "", email: "", age: 18 },
    validation: {
      key: "userValidation",
      zodSchema: userSchema,
      onBlur: true // Validate on blur
    },
    formElements: {
      validation: ({ children, active, message }) => (
        <div className="form-field">
          {children}
          {active && <span className="error">{message}</span>}
        </div>
      )
    }
  }
});

function UserForm() {
  const userForm = useCogsState('userForm');

  return (
    <form>
      {/* Auto-debounced input with validation wrapper */}
      {userForm.name.formElement(({ inputProps }) => (
        <>
          <label>Name</label>
          <input {...inputProps} />
        </>
      ))}

      {/* Custom debounce time */}
      {userForm.email.formElement(({ inputProps, get, update }) => (
        <>
          <label>Email</label>
          <input {...inputProps} />
          <small>Current: {get()}</small>
        </>
      ), { debounceTime: 500 })}

      {/* Custom form control */}
      {userForm.age.formElement(({ get, update }) => (
        <>
          <label>Age</label>
          <input
            type="number"
            value={get()}
            onChange={e => update(parseInt(e.target.value))}
          />
        </>
      ))}

      <button onClick={() => {
        if (userForm.validateZodSchema()) {
          console.log('Valid!', userForm.get());
        }
      }}>
        Submit
      </button>
    </form>
  );
}
```

## Advanced Features

### Server Synchronization

```typescript
const { useCogsState } = createCogsState({
  userProfile: {
    initialState: { name: "", email: "" },
    sync: {
      action: async (state) => {
        const response = await fetch('/api/user', {
          method: 'PUT',
          body: JSON.stringify(state)
        });
        return response.ok
          ? { success: true, data: await response.json() }
          : { success: false, error: 'Failed to save' };
      },
      onSuccess: (data) => console.log('Saved!', data),
      onError: (error) => console.error('Save failed:', error)
    }
  }
});

function UserProfile() {
  const userProfile = useCogsState('userProfile');

  return (
    <div>
      <div>Status: {userProfile.getStatus()}</div> {/* 'fresh' | 'dirty' | 'synced' | 'restored' */}
      <input
        value={userProfile.name.get()}
        onChange={e => userProfile.name.update(e.target.value)}
      />
      <button onClick={() => userProfile.sync()}>Save to Server</button>
    </div>
  );
}
```

### Local Storage Integration

```typescript
const { useCogsState } = createCogsState({
  userPrefs: {
    initialState: { theme: 'dark', language: 'en' },
    localStorage: {
      key: 'user-preferences',
      onChange: (state) => console.log('Saved to localStorage:', state),
    },
  },
});

function PreferencesComponent() {
  const userPrefs = useCogsState('userPrefs');

  return (
    <div>
      <select
        value={userPrefs.theme.get()}
        onChange={e => userPrefs.theme.update(e.target.value)}
      >
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
    </div>
  );
}
```

### State Status and History

```typescript
const user = useCogsState('user');

// Check what changed from initial state
const differences = user.getDifferences();

// Get current status
const status = user.getStatus(); // 'fresh' | 'dirty' | 'synced' | 'restored'

// Revert to initial state
user.revertToInitialState();

// Update initial state (useful for findign diffs and server-synced data)
const newServerData = {
  name: 'Jane Doe',
  age: 31,
  stats: { counter: 100, lastUpdated: new Date() },
};
user.updateInitialState(newServerData);
```

### Component Isolation

```typescript
// Each component can have its own reactive settings
function ComponentA() {
  const user = useCogsState('user', {
    reactiveType: 'deps',
    reactiveDeps: (state) => [state.name],
  });
  // Only re-renders when user.name changes
}

function ComponentB() {
  const user = useCogsState('user', {
    reactiveType: 'all',
  });
  // Re-renders on any change to 'user' state
}
```

## Performance Tips

1. **Use signals for high-frequency updates**: `.$get()` and `.$derive()` don't trigger React re-renders
2. **Use `reactiveType: 'none'` with signals**: Maximum performance for signal-heavy components
3. **Use virtualization for large lists**: `useVirtualView()` handles thousands of items efficiently
4. **Use streaming for real-time data**: Batch operations with `stream()` for better performance
5. **Chain filter/sort operations**: `stateFilter().stateSort()` creates efficient views
6. **Use `formElement` for forms**: Automatic debouncing and validation handling

## Common Patterns

### Master-Detail Interface

```typescript
function TodoApp() {
  const todos = useCogsState('todos');
  const selectedTodo = todos.getSelected();

  return (
    <div className="flex">
      <div className="list">
        {todos.stateList((todo, index) => (
          <div
            key={todo.id.get()}
            className={todo.isSelected ? 'selected' : ''}
            onClick={() => todo.toggleSelected()}
          >
            {todo.text.get()}
          </div>
        ))}
      </div>

      <div className="detail">
        {selectedTodo ? (
          <TodoDetail todo={selectedTodo} />
        ) : (
          <p>Select a todo</p>
        )}
      </div>
    </div>
  );
}
```

### Real-time Chat with Virtualization

```typescript
function ChatRoom() {
  const messages = useCogsState('messages', { reactiveType: 'none' });

  const { virtualState, virtualizerProps, scrollToBottom } =
    messages.useVirtualView({
      itemHeight: 65,
      overscan: 10,
      stickToBottom: true,
    });

  return (
    <div {...virtualizerProps.outer} className="chat-container">
      <div style={virtualizerProps.inner.style}>
        <div style={virtualizerProps.list.style}>
          {virtualState.stateList((message) => (
            <MessageItem key={message.id.$get()} message={message} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Multiple State Slices in One Component

```typescript
function Dashboard() {
  const user = useCogsState('user');
  const todos = useCogsState('todos');
  const settings = useCogsState('settings');

  return (
    <div>
      <header>
        <h1>Welcome, {user.name.get()}</h1>
        <button onClick={() => settings.darkMode.toggle()}>
          Toggle Theme
        </button>
      </header>

      <main>
        <p>You have {todos.get().length} todos</p>
        <p>Counter: {user.stats.counter.get()}</p>
      </main>
    </div>
  );
}
```

This library provides a unique approach to React state management by creating a proxy that mirrors your data structure while adding powerful methods for manipulation, rendering, and performance optimization.
