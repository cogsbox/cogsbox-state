# Cobgsbox State

> ⚠️ **Warning**: This package is currently a work in progress and not ready for production use. The API is unstable and subject to breaking changes. Please do not use in production environments.

---

Cobgsbox State is a state management library that provides a fluent interface for managing complex state in React applications.

## Installation

```bash
npm install cogsbox-state
```

## Features

- 🎯 **Simplified Deep Updates**

    ```typescript
    // Instead of setState(prev => ({ ...prev, deep: { ...prev.deep, value: newValue }}))
    updater.deep.value.update(newValue);
    ```

- 🔄 **Fluent Array Operations**

    ```typescript
    // Find, filter, and update in one chain
    updater.items.findWith("id", "123").status.update("complete");
    ```

- 📝 **Smart Form Handling**

    - Automatic debouncing
    - Validation integration
    - Form state synchronization

- 🔍 **Powerful Array Methods**

    - Filter with state access
    - Flatten nested arrays
    - Unique insertions
    - Map with updaters

- 🔄 **State Sync Features**

    - Server synchronization
    - Local storage persistence
    - Optimistic updates

- 🛠 **Developer Experience**

    - Full TypeScript support
    - Path autocompletion
    - Runtime type checking

- ⚡ **Performance**
    - Granular updates
    - Automatic optimization
    - Path-based subscriptions

## Initialization

```typescript
// Define your state shape
interface Product {
    id: string;
    name: string;
    price: number;
    categories: string[];
    variants: {
        id: string;
        color: string;
        size: string;
        stock: number;
    }[];
}

interface CartItem {
    productId: string;
    variantId: string;
    quantity: number;
}

const InitialState = {
    catalog: {
        products: [] as Product[],
        categories: [] as string[],
        filters: {
            priceRange: { min: 0, max: 100 },
            selectedCategories: [] as string[],
            search: "",
        },
        sortBy: "price_asc" as "price_asc" | "price_desc" | "name",
    },
    cart: {
        items: [] as CartItem[],
        couponCode: "",
        shipping: {
            address: "",
            method: "standard" as "standard" | "express",
            cost: 0,
        },
    },
    ui: {
        sidebarOpen: false,
        activeProductId: null as string | null,
        notifications: [] as {
            id: string;
            message: string;
            type: "success" | "error";
        }[],
    },
};

// Create state hook
export const { useCogsState } = createCogsState(InitialState);

// Use in component
const [state, updater] = useCogsState("catalog");
```

## Updater API

### Basic Updates

#### `.update()`

Updates state value directly.

```typescript
// Direct update
updater.catalog.filters.search.update("blue shoes");

// Functional update
updater.cart.items[0].quantity.update((prev) => prev + 1);

// Deep update
updater.catalog.products
    .findWith("id", "123")
    .variants[0].stock.update((prev) => prev - 1);
```

#### `.get()`

Gets current state value.

```typescript
const searchTerm = updater.catalog.filters.search.get();
const cartTotal = updater.cart.items
    .get()
    .reduce((sum, item) => sum + item.quantity, 0);
```

### Array Operations

#### `.insert()`

Inserts an item into an array.

```typescript
// Add product
updater.catalog.products.insert({
    id: "123",
    name: "Running Shoes",
    price: 99.99,
    categories: ["shoes", "sports"],
    variants: [],
});

// Add to cart
updater.cart.items.insert((prev) => ({
    productId: "123",
    variantId: "v1",
    quantity: 1,
}));
```

#### `.uniqueInsert()`

Inserts only if item doesn't exist (checks deep equality).

```typescript
// Add category if not exists
updater.catalog.categories.uniqueInsert("sports");

// Add notification with unique ID
updater.ui.notifications.uniqueInsert(
    {
        id: generateId(),
        message: "Item added to cart",
        type: "success",
    },
    ["id"],
);
```

#### `.cut()`

Removes an item from an array.

```typescript
// Remove from cart
updater.cart.items.cut(index);

// Remove notification
updater.ui.notifications.findWith("id", "notif-123").cut();
```

#### `.findWith()`

Finds an item in array by property comparison.

```typescript
// Find and update product
updater.catalog.products.findWith("id", 123).price.update(99.99);

// Find and update cart item
updater.cart.items
    .findWith("productId", 123)
    .quantity.update((prev) => prev + 1);
```

#### `.index()`

Gets item at specific index with updater methods.

```typescript
// Update first cart item
updater.cart.items.index(0).quantity.update(2);
```

#### `.stateEach()`

Maps over array with access to item updater.

```typescript
// Apply discount to all products
updater.catalog.products.stateEach((product, productUpdater) => {
    productUpdater.price.update((price) => price * 0.9);
});
```

#### `.stateFilter()`

Creates filtered view of array with updater methods.

```typescript
// Get low stock variants
const lowStock = updater.catalog.products.stateFilter((product) =>
    product.variants.some((v) => v.stock < 5),
);

// Update prices for filtered products
lowStock.stateEach((product, productUpdater) => {
    productUpdater.price.update((price) => price * 0.8);
});
```

#### `.stateFlattenOn()`

Flattens nested arrays by property.

```typescript
// Get all variants across products
const allVariants = updater.catalog.products.stateFlattenOn("variants");
```

### Form Integration

#### `.formElement()`

Creates form control with validation.

```typescript
updater.cart.shipping.address.formElement("shipping", ({ inputProps }) => (
  <input {...inputProps} placeholder="Shipping address" />
), {
  validation: {
    message: "Address is required",
    onChange: { clear: ["shipping.address"] }
  },
  debounceTime: 300
})
```

### Menu & Selection API

#### `.setSelected()`

Marks an item as selected in a list.

```typescript
// Select product
updater.catalog.products[0].setSelected(true);

// Select category
updater.catalog.categories.findWith("name", "sports").setSelected(true);
```

#### `.getSelected()`

Gets currently selected item from a list.

```typescript
const selectedProduct = updater.catalog.products.getSelected();
```

[Rest of documentation remains the same...]

## Examples

### Product Catalog Management

```typescript
function ProductList() {
  const [state, updater] = useCogsState("catalog", {
    serverSync: {
      syncKey: "products",
      syncFunction: async ({ state }) => {
        await api.updateProducts(state.products)
      }
    }
  });

  const filteredProducts = updater.products
    .stateFilter(product =>
      product.price >= state.filters.priceRange.min &&
      product.price <= state.filters.priceRange.max &&
      (state.filters.selectedCategories.length === 0 ||
        product.categories.some(c => state.filters.selectedCategories.includes(c)))
    );

  return (
    <div>
      {filteredProducts.stateEach((product, productUpdater) => (
        <ProductCard
          key={product.id}
          product={product}
          onUpdateStock={(variantId, newStock) =>
            productUpdater
              .variants
              .findWith("id", variantId)
              .stock
              .update(newStock)
          }
        />
      ))}
    </div>
  );
}
```

### Shopping Cart Management

```typescript
function CartManager() {
  const [state, updater] = useCogsState("cart", {
    localStorage: {
      key: "shopping-cart"
    }
  });

  const addToCart = (product: Product, variantId: string) => {
    updater.items.uniqueInsert({
      productId: product.id,
      variantId,
      quantity: 1
    }, ['productId', 'variantId']);
  };

  return (
    <div>
      {updater.items.stateEach((item, itemUpdater) => (
        <CartItem
          key={item.productId}
          item={item}
          onUpdateQuantity={qty => itemUpdater.quantity.update(qty)}
          onRemove={() => itemUpdater.cut()}
        />
      ))}
    </div>
  );
}
```

[Rest of TypeScript section remains the same...]
