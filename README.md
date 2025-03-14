# Cogsbox State: A Practical Guide

> **⚠️ WARNING**: This README is AI-generated based on the current implementation of Cogsbox State. The library is under active development and APIs are subject to change.

## Getting Started

Cogsbox State is a React state management library that provides a fluent interface for managing complex state.

### Basic Setup

```typescript
// 1. Define your initial state
const InitialState = {
  users: [],
  settings: {
    darkMode: false,
    notifications: true
  },
  cart: {
    items: [],
    total: 0
  }
};

// 2. Create the state hook
export const { useCogsState } = createCogsState(InitialState);

// 3. Use in your component
function MyComponent() {
  const cart = useCogsState("cart");

  // Access values
  const cartItems = cart.items.get();
  const total = cart.total.get();

  // Update values
  const addItem = (item) => {
    cart.items.insert(item);
    cart.total.update(total + item.price);
  };

  return (
    // Your component JSX
  );
}
```

## Core Concepts

### Accessing State

```typescript
// Get the entire state object
const entireCart = cart.get();

// Access a specific property
const cartItems = cart.items.get();

// Access nested properties
const firstItemPrice = cart.items.index(0).price.get();
```

### Updating State

```typescript
// Direct update
cart.settings.darkMode.update(true);

// Functional update (based on previous value)
cart.cart.total.update((prev) => prev + 10);

// Deep update
cart.users.findWith("id", "123").name.update("New Name");
```

## Working with Arrays

### Basic Array Operations

```typescript
// Add an item
cart.cart.items.insert({ id: "prod1", name: "Product 1", price: 29.99 });

// Remove an item at index
cart.cart.items.cut(2);

// Find and update an item
cart.cart.items.findWith("id", "prod1").quantity.update((prev) => prev + 1);

// Update item at specific index
cart.cart.items.index(0).price.update(19.99);
```

### Advanced Array Methods

```typescript
// Map with access to updaters
cart.cart.items.stateMap((item, itemUpdater) => (
  <CartItem
    key={item.id}
    item={item}
    onQuantityChange={qty => itemUpdater.quantity.update(qty)}
  />
));

// Filter items while maintaining updater capabilities
const inStockItems = cart.products.stateFilter(product => product.stock > 0);

// Insert only if the item doesn't exist
cart.cart.items.uniqueInsert(
  { id: "prod1", quantity: 1 },
  ["id"] // fields to check for uniqueness
);

// Flatten nested arrays by property
const allVariants = cart.products.stateFlattenOn("variants");
```

## Reactivity Control

Cogsbox offers different ways to control when components re-render:

### Component Reactivity (Default)

Re-renders when any accessed value changes.

```typescript
// Default behavior - re-renders when cart.items or cart.total changes
const cart = useCogsState("cart");

return (
  <div>
    <div>Items: {cart.items.get().length}</div>
    <div>Total: {cart.total.get()}</div>
  </div>
);
```

### Dependency-Based Reactivity

Re-renders only when specified dependencies change.

```typescript
// Only re-renders when items array or status changes
const cart = useCogsState("cart", {
  reactiveType: ["deps"],
  reactiveDeps: (state) => [state.items, state.status],
});
```

### Full Reactivity

Re-renders on any state change, even for unused properties.

```typescript
// Re-renders on any change to cart state
const cart = useCogsState("cart", {
  reactiveType: ["all"],
});
```

### Signal-Based Reactivity

Updates only the DOM elements that depend on changed values.

```typescript
// Most efficient - updates just the specific DOM elements
return (
  <div>
    <div>Items: {cart.items.$derive(items => items.length)}</div>
    <div>Total: {cart.total.$get()}</div>
  </div>
);
```

## Form Integration

Cogsbox State provides a form system with Zod schema validation.

```typescript
import { z } from 'zod';
import { createCogsState } from 'cogsbox-state';

// 1. Define your schema and initial state
const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  address: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    zipCode: z.string().min(5, "Zip code must be at least 5 characters")
  })
});

// 2. Create the state hook with validation and global form elements
export const { useCogsState } = createCogsState({
  user: {
    initialState: {
      firstName: "",
      lastName: "",
      email: "",
      address: {
        street: "",
        city: "",
        zipCode: ""
      }
    },
    validation: {
      key: "userForm",
      zodSchema: userSchema,
      onBlur: true
    },
    formElements: {
      validation: ({ children, active, message, path }) => (
        <div className={`form-field ${active ? 'has-error' : ''}`}>
          {children}
          {active && message && (
            <p className="text-red-500 text-sm mt-1">{message}</p>
          )}
        </div>
      )  // Inline validation wrapper
    }
  }
});

```

# Cogsbox State: Simple Form Example

The main benefit of Cogsbox State's form handling is its simplicity. Using `formElement` with the included `inputProps` makes creating forms incredibly easy:

```typescript
import { z } from 'zod';
import { createCogsState } from 'cogsbox-state';

// Define schema and initial state
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  age: z.number().min(18, "Must be 18+")
});

// Create state with validation
export const { useCogsState } = createCogsState({
  user: {
    initialState: {
      name: "",
      email: "",
      age: 0
    },
    validation: {
      key: "userForm",
      zodSchema: userSchema
    },
    formElements: {
      validation: ({ children, active, message }) => (
        <div className="form-field">
          {children}
          {active && <p className="error">{message}</p>}
        </div>
      )
    }
  }
});

function UserForm() {
  const user = useCogsState("user");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user.validateZodSchema()) {
      console.log("Valid:", user.get());
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Just spread inputProps - that's it! */}
      {user.name.formElement((params) => (
        <>
          <label>Name</label>
          <input {...params.inputProps} />
        </>
      ))}

      {user.email.formElement((params) => (
        <>
          <label>Email</label>
          <input {...params.inputProps} />
        </>
      ))}

      {user.age.formElement((params) => (
        <>
          <label>Age</label>
          <input type="number" {...params.inputProps} />
        </>
      ))}

      <button type="submit">Submit</button>
    </form>
  );
}
```

That's it! Cogsbox State handles:

- State management
- Validation
- Error messages
- Input binding

All you need to do is spread `params.inputProps` and Cogsbox takes care of the rest.
