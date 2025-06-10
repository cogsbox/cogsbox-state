# Cogsbox State: A Practical Guide

> **🚨 DANGER: DO NOT USE - UNSTABLE & EXPERIMENTAL 🚨**
>
> This library is in extremely early development and constantly changing.
> Everything will break. Nothing works properly.
> **DO NOT USE IN ANY PROJECT.**

## Getting Started

Cogsbox State is a React state management library that provides a fluent, chainable interface for managing complex state. It's designed to make deep updates and form management intuitive and simple.

### Basic Setup

1.  **Define your initial state configuration.**
    It's best practice to structure each state slice with its own `initialState` and `options`.

```typescript
// 1. Define your initial state
const InitialState = {
  // A simple slice for app settings
  settings: {
    initialState: {
      darkMode: false,
      notifications: true,
      username: "Guest",
    },
  },
  // A more complex slice for a shopping cart
  cart: {
    initialState: {
      items: [], // Array of { id, name, price, quantity }
      total: 0,
      status: "active",
    },
  },
};

// 2. Create the state hook
export const { useCogsState } = createCogsState(InitialState);
```

2.  **Use the hook in your components.**

```typescript
// 3. Use in your component
function SettingsPanel() {
// Access the "settings" state slice
const settings = useCogsState("settings");

// Read a value
const isDarkMode = settings.darkMode.get();

// Update a value
const toggleDarkMode = () => {
settings.darkMode.update(prev => !prev);
};

// Update another value
const handleUsernameChange = (e) => {
settings.username.update(e.target.value);
}

return (
<div>
<p>User: {settings.username.get()}</p>
<button onClick={toggleDarkMode}>
Toggle Dark Mode ({isDarkMode ? "On" : "Off"})
</button>
</div>
);
}
```

## Core Concepts

### Accessing State

Reading state is always done by calling `.get()` at the end of a chain.

```typescript
const settings = useCogsState("settings");

// Get the entire 'settings' object
const allSettings = settings.get();

// Access a specific property
const isDarkMode = settings.darkMode.get();

// For arrays, access elements by index
const firstItem = cart.items.index(0).get();

// Chain deeper for nested properties
const firstItemPrice = cart.items.index(0).price.get();
```

### Updating State

Updating state is done with methods like `.update()`, `.insert()`, and `.cut()`.

```typescript
// Direct update
settings.darkMode.update(true);

// Functional update (based on previous value)
cart.total.update((prevTotal) => prevTotal + 10);

// Deep update on an object within an array
cart.items.findWith("id", "123").name.update("New Product Name");
```

## Working with Arrays

Cogsbox provides powerful, chainable methods for array manipulation.

### Basic Array Operations

```typescript
const cart = useCogsState("cart");

// Add an item to the end of the array
cart.items.insert({
  id: "prod1",
  name: "Product 1",
  price: 29.99,
  quantity: 1,
});

// Remove the item at index 2
cart.items.cut(2);

// Update an item at a specific index
cart.items.index(0).price.update(19.99);
```

### Finding and Updating Items

```typescript
// Find an item by a property's value and update it
cart.items.findWith("id", "prod1").quantity.update((q) => q + 1);

// Find an item using a callback function (like array.find)
const firstInStock = cart.items.stateFind((item) => item.stock > 0);
if (firstInStock) {
  // `firstInStock` is a state object, so you can chain updates
  firstInStock.name.update((name) => `${name} (First Available!)`);
}
```

### Handling Selection

Cogsbox has built-in support for managing a "selected" item within an array, perfect for lists.

```typescript
function ProductList() {
const cart = useCogsState("cart");

// Get the fully selected item's state object to use elsewhere
const selectedProduct = cart.items.getSelected();

return (
<div>
<h3>Products</h3>
{cart.items.stateMap((item, itemUpdater) => (
<div
key={item.id}
// Use `_selected` to apply styling
className={itemUpdater.\_selected ? "product selected" : "product"}
// Use `toggleSelected` to handle clicks
onClick={() => itemUpdater.toggleSelected()} >
{item.name}
</div>
))}

      {selectedProduct && (
        <div className="details">
          <h4>Selected Details:</h4>
          <p>Name: {selectedProduct.name.get()}</p>
          <button onClick={() => selectedProduct.quantity.update(q => q + 1)}>
            Add one more
          </button>
        </div>
      )}
    </div>

);
}
```

### Advanced Array Methods

```typescript
// Map over items with full access to each item's updater
cart.items.stateMap((item, itemUpdater, index) => (
<CartItem
key={item.id}
item={item}
// Pass the updater down to the child component
onQuantityChange={newQty => itemUpdater.quantity.update(newQty)}
onRemove={() => cart.items.cut(index)}
/>
));

// Filter items while keeping them as state objects
const inStockItems = cart.products.stateFilter(product => product.stock > 0);

// Insert an item only if it's not already in the array
cart.items.uniqueInsert(
{ id: "prod1", name: "Product 1", quantity: 1 },
["id"] // Fields to check for uniqueness
);

// Flatten an array of nested arrays by a property name
const allProductVariants = cart.products.stateFlattenOn("variants");
```

## Reactivity Control

Cogsbox offers different ways to control when components re-render for performance optimization.

### Component Reactivity (Default)

The component re-renders whenever any state value accessed within it (using `.get()`) changes.

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

The component re-renders _only_ when the values returned by `reactiveDeps` change.

```typescript
// Only re-renders when the items array or status string changes
const cart = useCogsState("cart", {
  reactiveType: ["deps"],
  reactiveDeps: (state) => [state.items, state.status],
});
```

### Full Reactivity

The component re-renders on _any_ change to the state slice, even for properties not accessed in the component. Use with caution.

```typescript
// Re-renders on any change to the 'cart' state
const cart = useCogsState("cart", {
  reactiveType: ["all"],
});
```

### Signal-Based Reactivity (`$get` and `$derive`)

This is the most efficient method. It bypasses React's rendering entirely and updates only the specific DOM text nodes that depend on a value.

```typescript
// Most efficient - updates just the specific text in the DOM
return (

  <div>
    {/* $derive transforms the value before rendering */}
    <div>Items: {cart.items.$derive(items => items.length)}</div>

    {/* $get renders the value directly */}
    <div>Total: {cart.total.$get()}</div>

  </div>
);
```

## Simple Forms with `formElement`

Cogsbox shines at form handling. The `formElement` method combined with `inputProps` removes nearly all boilerplate.

```typescript
import { z } from 'zod';
import { createCogsState } from 'cogsbox-state';

// Define a Zod schema for validation
const userSchema = z.object({
name: z.string().min(1, "Name is required"),
email: z.string().email("A valid email is required"),
age: z.number().min(18, "You must be at least 18")
});

// Create state with validation and a custom error wrapper
export const { useCogsState } = createCogsState({
userForm: {
initialState: {
name: "",
email: "",
age: 18
},
validation: {
key: "userValidation", // A unique key for this form's errors
zodSchema: userSchema
},
// Optional: A custom component to wrap fields and display errors
formElements: {
validation: ({ children, active, message }) => (
<div className="form-field">
{children}
{active && <p className="error-message">{message}</p>}
</div>
)
}
}
});

function UserForm() {
const user = useCogsState("userForm");

const handleSubmit = (e) => {
e.preventDefault();
// Run all validations
if (user.validateZodSchema()) {
console.log("Form is valid!", user.get());
} else {
console.log("Form has errors.");
}
};

return (
<form onSubmit={handleSubmit}>
{user.name.formElement((params) => (
<>
<label>Name</label>
{/_ That's it! Spread inputProps to connect the input. _/}
<input type="text" {...params.inputProps} />
</>
))}

      {user.email.formElement((params) => (
        <>
          <label>Email</label>
          <input type="email" {...params.inputProps} />
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
