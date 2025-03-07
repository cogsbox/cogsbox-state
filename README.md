# Cogsbox State: A Practical Guide

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
  const [state, updater] = useCogsState("cart");

  // Access values
  const cartItems = updater.items.get();
  const total = updater.total.get();

  // Update values
  const addItem = (item) => {
    updater.items.insert(item);
    updater.total.update(total + item.price);
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
const entireCart = updater.get();

// Access a specific property
const cartItems = updater.items.get();

// Access nested properties
const firstItemPrice = updater.items[0].price.get();
```

### Updating State

```typescript
// Direct update
updater.settings.darkMode.update(true);

// Functional update (based on previous value)
updater.cart.total.update((prev) => prev + 10);

// Deep update
updater.users.findWith("id", "123").name.update("New Name");
```

## Working with Arrays

### Basic Array Operations

```typescript
// Add an item
updater.cart.items.insert({ id: "prod1", name: "Product 1", price: 29.99 });

// Remove an item at index
updater.cart.items.cut(2);

// Find and update an item
updater.cart.items.findWith("id", "prod1").quantity.update((prev) => prev + 1);

// Update item at specific index
updater.cart.items.index(0).price.update(19.99);
```

### Advanced Array Methods

```typescript
// Map with access to updaters
updater.cart.items.stateMap((item, itemUpdater) => (
  <CartItem
    key={item.id}
    item={item}
    onQuantityChange={qty => itemUpdater.quantity.update(qty)}
  />
));

// Filter items while maintaining updater capabilities
const inStockItems = updater.products.stateFilter(product => product.stock > 0);

// Insert only if the item doesn't exist
updater.cart.items.uniqueInsert(
  { id: "prod1", quantity: 1 },
  ["id"] // fields to check for uniqueness
);

// Flatten nested arrays by property
const allVariants = updater.products.stateFlattenOn("variants");
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

Cogsbox State provides an intuitive form system to connect your state to form controls with built-in validation, error handling, and array support.

### Basic Form Element Usage

The `formElement` method serves as the bridge between state and UI:

```typescript
// Direct value/onChange pattern for complete control
user.firstName.formElement((params) => (
  <div>
    <label className="block text-sm font-medium">First Name</label>
    <input
      type="text"
      className="mt-1 block w-full rounded-md border-2 p-2"
      value={params.get()}
      onChange={(e) => params.set(e.target.value)}
      onBlur={params.inputProps.onBlur}
      ref={params.inputProps.ref}
    />
  </div>
));

// Using inputProps shorthand for simpler binding
user.lastName.formElement((params) => (
  <div>
    <label className="block text-sm font-medium">Last Name</label>
    <input
      type="text"
      className="mt-1 block w-full rounded-md border-2 p-2"
      {...params.inputProps}
    />
  </div>
));
```

### Form Validation Options

Cogsbox provides several approaches to validation:

```typescript
// Custom validation message
user.email.formElement(
  (params) => (
    <div>
      <label>Email Address</label>
      <input {...params.inputProps} type="email" />
    </div>
  ),
  {
    validation: {
      message: "Please enter a valid email address"
    }
  }
);

// Hidden validation (show border but no message)
user.lastName.formElement(
  (params) => (
    <div>
      <label>Last Name</label>
      <input
        {...params.inputProps}
        className={`input ${params.validationErrors().length > 0 ? 'border-red-500' : ''}`}
      />
    </div>
  ),
  {
    validation: {
      hideMessage: true
    }
  }
);

// Custom validation with onBlur
user.phone.formElement((params) => (
  <div>
    <label>Phone Number</label>
    <input
      {...params.inputProps}
      onBlur={(e) => {
        if (e.target.value.length == 0 || isNaN(Number(e.target.value))) {
          params.addValidationError("Please enter a valid phone number");
        }
      }}
      placeholder="(555) 123-4567"
    />
  </div>
));
```

### Working with Form Arrays

For managing collections like addresses:

```typescript
function AddressesManager() {
  const [currentAddressIndex, setCurrentAddressIndex] = useState(0);
  const user = useCogsState("user");

  // Add new address
  const addNewAddress = () => {
    user.addresses.insert({
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
      isDefault: false,
    });
    setCurrentAddressIndex(user.addresses.get().length - 1);
  };

  return (
    <div>
      {/* Address tabs with validation indicators */}
      <div className="flex space-x-2 mt-2">
        {user.addresses.stateMap((_, setter, index) => {
          const errorCount = setter.showValidationErrors().length;
          return (
            <button
              key={index}
              onClick={() => setCurrentAddressIndex(index)}
              className={`rounded-lg flex items-center justify-center ${
                errorCount > 0
                  ? "border-red-500 bg-red-400"
                  : currentAddressIndex === index
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {index + 1}
              {errorCount > 0 && (
                <div className="bg-red-500 text-white rounded-full">
                  {errorCount}
                </div>
              )}
            </button>
          );
        })}
        <button onClick={addNewAddress}>Add</button>
      </div>

      {/* Current address form */}
      {user.addresses.get().length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {/* Access fields with index() method */}
          {user.addresses.index(currentAddressIndex).street.formElement(
            (params) => (
              <div>
                <label>Street</label>
                <input value={params.get()} onChange={(e) => params.set(e.target.value)} />
              </div>
            ),
            {
              validation: {
                message: "Street address is required"
              }
            }
          )}

          {/* City and State in a row */}
          <div className="grid grid-cols-2 gap-4">
            {user.addresses.index(currentAddressIndex).city.formElement((params) => (
              <div>
                <label>City</label>
                <input {...params.inputProps} />
              </div>
            ))}

            {user.addresses.index(currentAddressIndex).state.formElement((params) => (
              <div>
                <label>State</label>
                <input {...params.inputProps} />
              </div>
            ))}
          </div>

          {/* Boolean field handling */}
          {user.addresses.index(currentAddressIndex).isDefault.formElement((params) => (
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={params.get()}
                onChange={(e) => params.set(e.target.checked)}
                id={`default-address-${currentAddressIndex}`}
              />
              <label htmlFor={`default-address-${currentAddressIndex}`}>
                Set as default address
              </label>
            </div>
          ))}

          {/* Remove address button */}
          {user.addresses.get().length > 1 && (
            <button
              onClick={() => {
                user.addresses.cut(currentAddressIndex);
                setCurrentAddressIndex(Math.max(0, currentAddressIndex - 1));
              }}
            >
              Remove Selected Address
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

### Form Actions

Cogsbox provides methods to manage form state:

```typescript
// Reset form to initial state
const handleReset = () => {
  user.revertToInitialState();
};

// Validate all fields using Zod schema
const handleSubmit = () => {
  if (user.validateZodSchema()) {
    // All valid, proceed with submission
    submitData(user.get());
  }
};
```

### Setting Up Zod Validation

```typescript
// Setting up validation at initialization
export const { useCogsState } = createCogsState({
  user: {
    initialState: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      addresses: [
        {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "USA",
          isDefault: false,
        },
      ],
    },
    validation: {
      key: "userForm", // Used for error tracking
      zodSchema: z.object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        email: z.string().email("Please enter a valid email"),
        phone: z.string().min(10, "Phone number must be at least 10 digits"),
        addresses: z.array(
          z.object({
            street: z.string().min(1, "Street is required"),
            city: z.string().min(1, "City is required"),
            state: z.string().min(1, "State is required"),
            zipCode: z
              .string()
              .min(5, "Zip code must be at least 5 characters"),
            country: z.string(),
            isDefault: z.boolean(),
          })
        ),
      }),
    },
  },
});
```

## Server Synchronization

```typescript
// Setting up server sync
const products = useCogsState("products", {
  serverSync: {
    syncKey: "products",
    syncFunction: ({ state }) => api.updateProducts(state),
    debounce: 1000, // ms
    mutation: useMutation(api.updateProducts),
  },
});

// State is automatically synced with server after changes
products.items[0].stock.update((prev) => prev - 1);
```

## Local Storage Persistence

```typescript
// Automatically save state to localStorage
const cart = useCogsState("cart", {
  localStorage: {
    key: "shopping-cart",
  },
});
```

## Example: Shopping Cart

```typescript
function ShoppingCart() {
  const cart = useCogsState("cart");
  const products = useCogsState("products");

  const addToCart = (productId) => {
    const product = products.items.findWith("id", productId).get();

    cart.items.uniqueInsert(
      {
        productId,
        name: product.name,
        price: product.price,
        quantity: 1
      },
      ["productId"],
      // If product exists, update quantity instead
      (existingItem) => ({
        ...existingItem,
        quantity: existingItem.quantity + 1
      })
    );

    // Update total
    cart.total.update(prev => prev + product.price);
  };

  return (
    <div>
      <h2>Your Cart</h2>

      {cart.items.stateMap((item, itemUpdater) => (
        <div key={item.productId} className="cart-item">
          <div>{item.name}</div>
          <div>${item.price}</div>

          <div className="quantity">
            <button onClick={() =>
              itemUpdater.quantity.update(prev => Math.max(prev - 1, 0))
            }>-</button>

            <span>{item.quantity}</span>

            <button onClick={() =>
              itemUpdater.quantity.update(prev => prev + 1)
            }>+</button>
          </div>

          <button onClick={() => itemUpdater.cut()}>Remove</button>
        </div>
      ))}

      <div className="cart-total">
        <strong>Total:</strong> ${cart.total.get()}
      </div>
    </div>
  );
}
```

## Common Patterns and Tips

1. **Path-based Updates**: Always use the fluent API to update nested properties.

   ```typescript
   // Good
   updater.users[0].address.city.update("New York");

   // Avoid
   updater.update({ ...state, users: [...] });
   ```

2. **Working with Arrays**: Use the built-in array methods instead of manually updating array state.

   ```typescript
   // Good
   updater.users.insert(newUser);
   updater.users.findWith("id", 123).active.update(true);

   // Avoid
   updater.users.update([...users, newUser]);
   ```

3. **Optimization**: Use the appropriate reactivity type for your needs.

   ```typescript
   // For lists where only specific items change frequently
   updater.items.stateMap((item) => (
     <div>{item.$get()}</div>  // Only this item re-renders when changed
   ));
   ```

4. **Form Management**: Use formElement for all form inputs to get automatic validation and debouncing.
   ```typescript
   profile.name.formElement(
     ({ inputProps }) => <input {...inputProps} />,
     { debounceTime: 300 }
   );
   ```
