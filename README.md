# Cogsbox State

> **🚨 DANGER: DO NOT USE - UNSTABLE & EXPERIMENTAL 🚨**
>
> This library is in early development and constantly changing.
>
> **DO NOT USE IN ANY PROJECT YET - ONLY FOR TESTING AND PROVIDING FEEDBACK.**

## What is Cogsbox State?

Cogsbox State is a React state management library that creates a **nested state builder** - a type-safe proxy that mimics your initial state structure. Every property in your state becomes a powerful state object with built-in methods for updates, arrays, forms, and more.

**Key Philosophy**: Instead of complex useState drilling and manual mapping, you directly access nested properties and use built-in methods.

## Getting Started

### Basic Setup

```typescript
import { createCogsState } from 'cogsbox-state';

type Todo = {
  id: number;
  text: string;
  done: boolean;
}

type AppState = {
  user: {
    name: string;
    stats: {
      counter: number;
      lastUpdated: number | null; // Be specific with types
    },
    age: number;
    online: boolean;
  };
  todos: Todo[]; // Use the interface here
  settings: {
    darkMode: boolean;
    notifications: boolean;
  }
}
// 1. Define your initial state structure
const initialState: AppState = {
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
      <p>Name: {user.name.$get()}</p>
      <p>Counter: {user.stats.counter.$get()}</p>
      <button onClick={() => user.stats.counter.$update(prev => prev + 1)}>
        Increment Counter
      </button>
    </div>
  );
}

function TodoComponent() {
  const todos = useCogsState('todos'); // Access the 'todos' slice

  return (
    <div>
      <p>Todo count: {todos.$get().length}</p>
      <button onClick={() => todos.$insert({ id: Date.now(), text: 'New todo', done: false })}>
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

- `.$get()` - read values reactively
- `.$derive()` - calculate a React value and track every `.$get()` it reads
- `.$update()` - set values
- `.$toggle()` - flip booleans
- `.$$get()` - render a value as a DOM signal without re-rendering the component
- `.$$derive()` - render a computed DOM signal

#### Objects

- All primitive methods plus access to nested properties
- `.$update()` can do partial updates

#### Arrays

- All core methods plus array-specific operations
- Built-in selection tracking and metadata

### Reading State

```typescript
const user = useCogsState('user');
const todos = useCogsState('todos');
const settings = useCogsState('settings');

// Reactive reads (triggers re-renders)
const userName = user.name.$get();
const allTodos = todos.$get();
const isDarkMode = settings.darkMode.$get();

// Access nested properties
const counterValue = user.stats.counter.$get();
const firstTodo = todos.$index(0)?.$get();

// A React-derived value automatically tracks both paths
const fullName = user.$derive(
  (current) => `${current.firstName.$get()} ${current.lastName.$get()}`
);

// Signals are rendered directly in JSX without re-rendering this component
return (
  <>
    <span>{user.name.$$get()}</span>
    <span>{todos.$$derive((items) => items.length)}</span>
  </>
);
```

For a signal derived from multiple paths, pass the paths followed by a selector:

```tsx
<span>
  {order.$$derive(
    [order.price, order.quantity],
    ([price, quantity]) => price * quantity
  )}
</span>
```

Signal selectors are serialized, so they must be self-contained and must not
capture variables from the surrounding component.

### Updating State

```typescript
const user = useCogsState('user');
const settings = useCogsState('settings');
const todos = useCogsState('todos');

// Direct updates
user.name.$update('Jane');
settings.darkMode.$toggle();

// Functional updates
user.stats.counter.$update((prev) => prev + 1);

// Object updates
user.$update((prev) => ({ ...prev, name: 'Jane', age: 30 }));

// Deep nested updates
todos.$index(0).text.$update('Updated todo text');
```

## Working with Arrays

Arrays are first-class citizens with powerful built-in operations:

### Basic Array Operations

```typescript
const todos = useCogsState('todos');

// Add items
todos.$insert({ id: 'uuid', text: 'New todo', done: false });
todos.$insert(({ uuid }) => ({
  id: uuid,
  text: 'Auto-generated ID',
  done: false,
}));

// Remove items
todos.$cut(2); // Remove at index 2
todos.$cutSelected(); // Remove currently selected item

// Access items
const firstTodo = todos.$index(0);
const lastTodo = todos.$last();
```

### Array Iteration and Rendering

#### `$map()` - Enhanced Array Mapping

```typescript
const todos = useCogsState('todos');

// Returns transformed array, each item is a full state object
const todoElements = todos.$map((todoState, index, arrayState) => (
  <TodoItem
    key={todoState.id.$get()}
    todo={todoState}
    onToggle={() => todoState.done.$toggle()}
    onDelete={() => arrayState.$cut(index)}
  />
));
```

#### `$list()` - JSX List Rendering

```typescript
const todos = useCogsState('todos');

// Renders directly in place with automatic key management
{todos.$list((todoState, index, arrayState) => (
  <div key={todoState.id.$get()}>
    <span>{todoState.text.$get()}</span>
    <button onClick={() => todoState.done.$toggle()}>Toggle</button>
    <button onClick={() => arrayState.$cut(index)}>Delete</button>
  </div>
))}
```

### Advanced Array Methods

#### Filtering and Sorting

```typescript
const todos = useCogsState('todos');

// Filter items (returns new state object with filtered view)
const completedTodos = todos.$filter((todo) => todo.done);
const incompleteTodos = todos.$filter((todo) => !todo.done);

// Sort items (returns new state object with sorted view)
const sortedTodos = todos.$sort((a, b) => a.text.localeCompare(b.text));

// Chain operations
const sortedCompletedTodos = todos
  .$filter((todo) => todo.done)
  .$sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
```

#### Finding and Searching

```typescript
const todos = useCogsState('todos');

// Find by property value
const todoById = todos.$findWith('id', 'some-id');
if (todoById) {
  todoById.text.$update('Updated text');
}

// Find with custom function
const firstIncompleteTodo = todos.$find((todo) => !todo.done);
```

#### Unique Operations

```typescript
const todos = useCogsState('todos');

// Insert only if unique (prevents duplicates)
todos.$uniqueInsert(
  { id: 'new-id', text: 'New todo', done: false },
  ['id'], // Fields to check for uniqueness
  (existingItem) => {
    // Optional: callback if match found
    return { ...existingItem, text: 'Updated existing' };
  }
);
```

#### Selection Management

```typescript
const todos = useCogsState('todos');

// Built-in selection tracking
const selectedTodo = todos.$getSelected();
const selectedIndex = todos.$getSelectedIndex();

// Set selection on individual items
todos.$index(0).$setSelected(true);
todos.$index(0).$toggleSelected();

// Clear all selections
todos.$clearSelected();

// Check if item is selected
const isSelected = todos.$index(0).isSelected;
```

## Plugin Chain Methods

For a full plugin how-to (registration, hooks, validation, etc.) see [PLUGINS.md](./PLUGINS.md).

Plugins can add custom methods to the state builder chain with `.methods(...)`.
This is useful for reusable behaviours such as uploads, persistence, analytics,
or domain-specific state actions.

```typescript
import { createCogsState, createPluginContext } from 'cogsbox-state';
import { z } from 'zod';

const { createPlugin } = createPluginContext({
  options: z.object({
    bucketPrefix: z.string().optional(),
  }),
});

const s3Plugin = createPlugin('s3').methods(({ path, array }) => ({
  sendToS3: path((state) => state.users.$.profile.image)(
    async (ctx, bucket: string) => {
      return upload(ctx.$get(), bucket);
    }
  ),

  sendManyToS3: array(async (ctx, bucket: string) => {
    return uploadMany(ctx.$get(), bucket);
  }),

  sendGalleryToS3: path((state) => state.galleries.$.images).array(
    async (ctx, bucket: string) => {
      return uploadMany(ctx.$get(), bucket, ctx.options?.bucketPrefix);
    }
  ),
}));

const { useCogsState } = createCogsState(initialState, {
  plugins: [s3Plugin],
});
```

Use the plugin by passing its options to `useCogsState`:

```typescript
const assets = useCogsState('assets', {
  s3: { bucketPrefix: 'uploads' },
});

await assets.users.$index(0).profile.image.$sendToS3('avatars');
await assets.galleries.$index(0).images.$sendGalleryToS3('gallery');
await assets.looseImages.$sendManyToS3('images');
```

### Method Targets

Method helpers decide where a method can run:

- `field(fn)` - any state node
- `array(fn)` - arrays only
- `object(fn)` - plain objects only
- `primitive(fn)` - strings, numbers, booleans, `null`, etc.
- `boolean(fn)` - booleans only
- `path(selector)(fn)` - only a matching path
- `path(selector).array(fn)` - matching path and array value

The `path` helper receives a path-recorder proxy. The `$` segment means "one
path segment", which naturally matches array item ids internally:

```typescript
path((state) => state.users.$.profile.image);
```

matches calls like:

```typescript
assets.users.$index(0).profile.image.$sendToS3('avatars');
```

The first handler argument is a scoped plugin context. The remaining handler
arguments become the chain method arguments, and the return type is preserved:

```typescript
const imagePlugin = createPlugin('images').methods(({ field }) => ({
  resize: field((ctx, width: number, height: number) => {
    return resizeImage(ctx.$get(), width, height);
  }),
}));

// typed as resize(width: number, height: number): ReturnType<typeof resizeImage>
state.avatar.resize(200, 200);
```

If a real state field has the same name as a plugin method, the state field wins.

<!-- ### Virtualization for Large Lists

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
          {virtualState.list((messageState, index) => (
            <MessageItem key={messageState.id.$get()} message={messageState} />
          ))}
        </div>
      </div>
    </div>
  );
}
``` -->

## Reactivity Control

Cogsbox tracks reactive reads by path. The component using the state only
re-renders when a path read through `.$get()` changes.

### Automatic Reactivity (Default)

```typescript
// Re-renders when any accessed state changes
const user = useCogsState('user');
// or explicitly:
const user = useCogsState('user', { reactiveType: 'component' });
```

Calculated values use the same automatic tracking:

```tsx
const summary = user.$derive(
  (current) => `${current.name.$get()}: ${current.stats.counter.$get()}`
);
```

### Isolated Rendering

Use `$isolate` when only a small part of the UI should update. Without an
explicit list, reads inside the isolated render are tracked automatically:

```tsx
return (
  <section>
    {user.$isolate((current) => <span>{current.name.$get()}</span>)}
  </section>
);
```

An explicit dependency list is exclusive. Only those paths trigger the
isolated render, even if it reads other paths:

```tsx
return (
  <section>
    {user.$isolate([user.name, user.online], (current) => (
      <span>
        {current.name.$get()} is{' '}
        {current.online.$get() ? 'online' : 'offline'}
      </span>
    ))}
  </section>
);
```

### Disabling Hook-Component Reactivity

```tsx
const todos = useCogsState('todos', { reactiveType: 'none' });

return <span>{todos.$$derive((items) => items.length)}</span>;
```

`none` disables reactive path registration for the component calling
`useCogsState`. Library-owned child boundaries such as lists, isolated renders,
and form elements retain their own subscriptions so they can continue updating.

### Migration from Earlier Reactivity Options

The former `deps` and `all` modes, reactivity-mode arrays, `reactiveDeps`, and
the hook-level `dependencies` option have been removed. Use automatic `.$get()`
tracking or `.$derive()` for React values, `$isolate([...])` for an explicit UI
boundary, and `.$$derive([...], selector)` for a multi-path signal. State
reinitialization should be explicit through the state initialization methods,
not coupled to a React dependency array.

## Form Management

Cogsbox excels at form handling with automatic debouncing and validation:

### Basic Form Elements

```typescript
import { createCogsState } from 'cogsbox-state';
import { z } from 'zod';

// 1. Define the validation schema. This is your single source of truth.
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18+")
});

// 2. Best Practice: Infer the TypeScript type directly from the schema.
type UserFormData = z.infer<typeof userSchema>;

// 3. Define the initial state for the form using the inferred type.
const initialUserFormState: UserFormData = {
  name: "",
  email: "",
  age: 18
};

// 4. Create the state manager.
const { useCogsState } = createCogsState({
  userForm: {
    initialState: initialUserFormState,
    validation: {
      key: "userValidation",
      zodSchemaV4: userSchema, // Pass the schema for runtime validation
      onBlur: 'error'
    },
    formElements: {
      validation: ({ children, hasErrors, message }) => (
        <div className="form-field">
          {children}
          {hasErrors && <span className="error">{message}</span>}
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
      {userForm.name.$formElement(({ $inputProps }) => (
        <>
          <label>Name</label>
          <input {...$inputProps} />
        </>
      ))}

      {/* Custom debounce time */}
      {userForm.email.$formElement(({ $inputProps }) => (
        <>
          <label>Email</label>
          <input {...$inputProps} />
        </>
      ), { debounceTime: 500 })}

      {/* Custom form control */}
      {userForm.age.$formElement(({ $get, $update }) => (
        <>
          <label>Age</label>
          <input
            type="number"
            value={$get()}
            onChange={e => $update(parseInt(e.target.value))}
          />
        </>
      ))}
    </form>
  );
}
```

### Reading Validation State

Use `$validationErrors()` on an object state node to get validation summaries
for its immediate child fields.

```typescript
const userForm = useCogsState('userForm');

const validation = userForm.$validationErrors();
```

This returns an array of objects. Each item includes the field `path` plus the
current validation state for that path:

```typescript
[
  {
    path: ['name'],
    status: 'INVALID',
    severity: 'error',
    hasErrors: true,
    hasWarnings: false,
    message: 'Name is required',
    errors: ['Name is required'],
    warnings: [],
    allErrors: [
      {
        path: ['name'],
        source: 'client',
        severity: 'error',
        message: 'Name is required',
        code: 'too_small',
      },
    ],
    getData: () => '',
  },
];
```

Pass a type-safe string array to read only specific fields. This is useful for
multi-stage forms where a stage should not advance while selected fields have
errors.

```typescript
const stageValidation = userForm.$validationErrors(['name', 'email']);

if (stageValidation.some((field) => field.hasErrors)) {
  return;
}

goToNextStage();
```

The keys must exist on the object state node, so this is checked by TypeScript:

```typescript
userForm.$validationErrors(['name']); // ok
userForm.$validationErrors(['missingField']); // type error
```
