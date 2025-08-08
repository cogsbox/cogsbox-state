// src/tests/CogsState.advanced.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { createCogsState, type StateObject } from '../src/CogsState';
import { getGlobalStore } from '../src/store';

// --- REACT MOCK (Required for the hook logic to run) ---
vi.mock('react', async (importOriginal) => {
  const actualReact = await importOriginal<typeof React>();
  return {
    ...actualReact,
    useContext: () => ({ sessionId: 'test-session-id' }),
    useState: (initialValue: any) => [initialValue, vi.fn()],
    useEffect: vi.fn(),
    useLayoutEffect: vi.fn(),
    useRef: (initialValue: any) => ({ current: initialValue }),
    useCallback: (fn: any) => fn,
    useMemo: (fn: any) => fn(),
  };
});
// --- END OF MOCK ---

// Define the new state shape for basic tests
interface BasicTestState {
  counter: number;
  message: string;
  isToggled: boolean;
  user: {
    name: string;
    details: {
      age: number;
      isAdmin: boolean;
    };
  };
  items: string[];
  tasks: { id: number; text: string }[];
}

// Function to get a fresh initial state for basic tests
const getBasicInitialState = (): BasicTestState => ({
  counter: 0,
  message: 'hello',
  isToggled: false,
  user: {
    name: 'Alice',
    details: {
      age: 30,
      isAdmin: false,
    },
  },
  items: ['a', 'b', 'c'],
  tasks: [
    { id: 1, text: 'Task 1' },
    { id: 2, text: 'Task 2' },
  ],
});

// A more complex data structure for better testing
interface Product {
  id: string;
  name: string;
  category: 'electronics' | 'books' | 'apparel';
  price: number;
  inStock: boolean;
}
interface AdvancedTestState {
  products: Product[];
}
const getInitialState = (): AdvancedTestState => ({
  products: [
    {
      id: 'p1',
      name: 'Laptop',
      category: 'electronics',
      price: 1200,
      inStock: true,
    },
    {
      id: 'p2',
      name: 'T-Shirt',
      category: 'apparel',
      price: 25,
      inStock: true,
    },
    {
      id: 'p3',
      name: 'The Great Gatsby',
      category: 'books',
      price: 15,
      inStock: false,
    },
    {
      id: 'p4',
      name: 'Headphones',
      category: 'electronics',
      price: 150,
      inStock: true,
    },
    { id: 'p5', name: 'Jeans', category: 'apparel', price: 80, inStock: false },
    { id: 'p6', name: 'Dune', category: 'books', price: 20, inStock: true },
    {
      id: 'p7',
      name: 'Keyboard',
      category: 'electronics',
      price: 75,
      inStock: true,
    },
  ],
});
interface ItemProperty {
  itemcatprop_id: string; // The key we will find with
  name: string;
  value: string | number;
}

interface ItemInstance {
  id: string;
  instance_name: string;
  properties: ItemProperty[];
}

interface ComplexAppState {
  itemInstances: ItemInstance[];
}

// And a function to get the initial state for this new shape
const getComplexInitialState = (): ComplexAppState => ({
  itemInstances: [
    {
      id: 'inst-1',
      instance_name: 'First Instance',
      properties: [
        { itemcatprop_id: 'prop-a', name: 'Color', value: 'Red' },
        { itemcatprop_id: 'prop-b', name: 'Size', value: 10 },
        { itemcatprop_id: 'prop-c', name: 'Material', value: 'Wood' },
      ],
    },
    {
      id: 'inst-2',
      instance_name: 'Second Instance',
      properties: [
        { itemcatprop_id: 'prop-a', name: 'Color', value: 'Blue' },
        { itemcatprop_id: 'prop-d', name: 'Weight', value: 25 },
      ],
    },
  ],
});
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  items: OrderItem[];
  total: number;
}

interface OrdersTestState {
  orders: Order[];
}

// Add this function near other initial state functions
const getOrdersInitialState = (): OrdersTestState => ({
  orders: [
    {
      id: 'order-1',
      customerName: 'Alice',
      status: 'completed',
      total: 125,
      items: [
        { id: 'item-1', name: 'Laptop', quantity: 1, price: 100 },
        { id: 'item-2', name: 'Mouse', quantity: 2, price: 12.5 },
      ],
    },
    {
      id: 'order-2',
      customerName: 'Bob',
      status: 'pending',
      total: 75,
      items: [
        { id: 'item-3', name: 'Book', quantity: 3, price: 15 },
        { id: 'item-4', name: 'Pen', quantity: 5, price: 6 },
      ],
    },
    {
      id: 'order-3',
      customerName: 'Charlie',
      status: 'processing',
      total: 200,
      items: [
        { id: 'item-5', name: 'Monitor', quantity: 1, price: 150 },
        { id: 'item-6', name: 'Keyboard', quantity: 1, price: 50 },
      ],
    },
    {
      id: 'order-4',
      customerName: 'Diana',
      status: 'completed',
      total: 90,
      items: [
        { id: 'item-7', name: 'Headphones', quantity: 1, price: 60 },
        { id: 'item-8', name: 'Cable', quantity: 3, price: 10 },
      ],
    },
  ],
});

// Update the createCogsState call to include this new state
// You'll need to find the existing `createCogsState` call and add the `complexApp` key.
const { useCogsState } = createCogsState({
  basicTestState: { initialState: getBasicInitialState() }, // <-- ADDED FOR BASIC TESTS
  advancedTestState: { initialState: getInitialState() },
  complexApp: { initialState: getComplexInitialState() },
  ordersTestState: { initialState: getOrdersInitialState() },
});

describe('CogsState - Basic Functionality', () => {
  let setter: StateObject<BasicTestState>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Use the new 'basicTestState' key
    setter = useCogsState('basicTestState');
    // Ensure state is fresh before each test
    setter.revertToInitialState();
  });

  it('should get primitive values correctly', () => {
    expect(setter.counter.get()).toBe(0);
    expect(setter.message.get()).toBe('hello');
    expect(setter.isToggled.get()).toBe(false);
  });

  it('should update a primitive value with a new value and with a function', () => {
    setter.counter.update(10);
    expect(setter.counter.get()).toBe(10);

    setter.counter.update((c) => c + 5);
    expect(setter.counter.get()).toBe(15);
  });

  it('should toggle a boolean value', () => {
    expect(setter.isToggled.get()).toBe(false);
    setter.isToggled.toggle();
    expect(setter.isToggled.get()).toBe(true);
    setter.isToggled.toggle();
    expect(setter.isToggled.get()).toBe(false);
  });

  it('should access and update deeply nested object properties', () => {
    // Access
    expect(setter.user.name.get()).toBe('Alice');
    expect(setter.user.details.age.get()).toBe(30);

    // Update
    setter.user.details.age.update(31);
    expect(setter.user.details.age.get()).toBe(31);
    // Ensure other properties are not affected
    expect(setter.user.name.get()).toBe('Alice');
  });

  it('should update an entire nested object', () => {
    setter.user.details.update({ age: 40, isAdmin: true });
    expect(setter.user.details.get()).toEqual({ age: 40, isAdmin: true });
    expect(setter.user.details.age.get()).toBe(40);
  });

  it('should access an array item using .index()', () => {
    console.log(setter.items.get());
    expect(setter.items.index(1).get()).toBe('b');
    expect(setter.tasks.index(0).text.get()).toBe('Task 1');
  });

  it('should update an array item value using .index()', () => {
    setter.items.index(1).update('z');
    expect(setter.items.get()).toEqual(['a', 'z', 'c']);

    setter.tasks.index(0).text.update('Do this first');
    expect(setter.tasks.get()[0].text).toBe('Do this first');
  });

  it('should insert an item into an array', () => {
    setter.items.insert('d');
    expect(setter.items.get()).toEqual(['a', 'b', 'c', 'd']);
    expect(setter.items.get().length).toBe(4);
  });

  it('should cut an item from an array using .cut(index)', () => {
    setter.items.cut(1); // remove 'b'
    expect(setter.items.get()).toEqual(['a', 'c']);
    expect(setter.items.get().length).toBe(2);
  });

  it('should cut the last item from an array using .cut() with no index', () => {
    setter.items.cut(); // remove 'c'
    expect(setter.items.get()).toEqual(['a', 'b']);
    expect(setter.items.get().length).toBe(2);
  });

  it('should find an item in an array of objects with .findWith()', () => {
    const taskProxy = setter.tasks.findWith('id', 2);
    expect(taskProxy.text.get()).toBe('Task 2');

    // Update it to be sure we have the right proxy
    taskProxy.text.update('Finish this');
    expect(setter.tasks.get()[1].text).toBe('Finish this');
  });

  it('should revert the entire state to its initial value', () => {
    // Make some changes
    setter.counter.update(99);
    setter.user.name.update('Charlie');
    setter.items.insert('x');

    // Verify changes
    expect(setter.counter.get()).toBe(99);
    expect(setter.user.name.get()).toBe('Charlie');
    expect(setter.items.get().length).toBe(4);

    // Revert
    setter.revertToInitialState();

    // Verify state is back to initial
    expect(setter.counter.get()).toBe(0);
    expect(setter.user.name.get()).toBe('Alice');
    expect(setter.items.get()).toEqual(['a', 'b', 'c']);
    expect(setter.items.get().length).toBe(3);
  });
});

describe('CogsState - Advanced Chained Array Operations', () => {
  let setter: StateObject<AdvancedTestState>;

  beforeEach(() => {
    vi.clearAllMocks();
    setter = useCogsState('advancedTestState');
    setter.revertToInitialState();
  });
  // Add this test case inside the "CogsState - Deeply Nested Array Operations" describe block

  it('should get the last item of a derived (filtered and sorted) array using .last()', () => {
    // --- STEP 1: Create a derived proxy ---
    // Filter for electronics, then sort by price ascending.
    // The list will be: Keyboard (p7, $75), Headphones (p4, $150), Laptop (p1, $1200)
    const sortedElectronicsProxy = setter.products
      .stateFilter((p) => p.category === 'electronics')
      .stateSort((a, b) => a.price - b.price);

    // Sanity check the order
    expect(sortedElectronicsProxy.get().map((p) => p.id)).toEqual([
      'p7',
      'p4',
      'p1',
    ]);

    // --- STEP 2: Get the last item from this DERIVED proxy ---
    const lastItemProxy = sortedElectronicsProxy.last();
    expect(lastItemProxy).toBeDefined();

    // The last item should be the Laptop (p1)
    expect(lastItemProxy?.get().id).toBe('p1');
    expect(lastItemProxy?.price.get()).toBe(1200);

    // --- STEP 3: Verify it's a live proxy by performing an update ---
    // The laptop is initially in stock.
    expect(lastItemProxy?.inStock.get()).toBe(true);
    // Update it through the .last() proxy
    lastItemProxy?.inStock.update(false);
    expect(lastItemProxy?.inStock.get()).toBe(false);

    // --- STEP 4: Verify the change is reflected in the original, global state ---
    const finalState = setter.get();
    const updatedLaptop = finalState.products.find((p) => p.id === 'p1');
    expect(updatedLaptop?.inStock).toBe(false);

    // --- STEP 5: Test edge case where the filter results in an empty array ---
    const emptyProxy = setter.products.stateFilter((p) => !p.category);
    console.log('emptyProxy', emptyProxy.get());
    expect(emptyProxy.get().length).toBe(0);
    // Calling .last() on an empty derived array should result in an undefined value
    expect(emptyProxy?.last()?.get()).toBeUndefined();
  });
  it('should filter by one key, then sort the result by another', () => {
    // 1. Filter for all 'electronics' products
    const electronicsProxy = setter.products.stateFilter(
      (p) => p.category === 'electronics'
    );

    let filteredData = electronicsProxy.get();

    expect(filteredData.map((p) => p.id)).toEqual(['p1', 'p4', 'p7']);

    // 2. Sort the *filtered* proxy by price, descending
    const sortedElectronicsProxy = electronicsProxy.stateSort(
      (a, b) => b.price - a.price
    );
    let sortedData = sortedElectronicsProxy.get();
    expect(sortedData.map((p) => p.id)).toEqual(['p1', 'p4', 'p7']); // Correct order: Laptop, Headphones, Keyboard
  });

  it('should correctly map over a filtered and sorted array', () => {
    // 1. Filter for 'apparel'
    // 2. Sort by price ascending
    const sortedApparelProxy = setter.products
      .stateFilter((p) => p.category === 'apparel')
      .stateSort((a, b) => a.price - b.price);

    const apparelData = sortedApparelProxy.get();
    expect(apparelData.map((p) => p.id)).toEqual(['p2', 'p5']); // T-Shirt, Jeans

    // 3. Map the result to a new structure, checking if the setter paths are correct
  });

  it('should handle selections correctly within a derived (filtered) array', () => {
    // 1. Get a derived proxy for all items that are in stock
    const inStockProxy = setter.products.stateFilter((p) => p.inStock);

    const inStockData = inStockProxy.get();
    expect(inStockData.map((p) => p.id)).toEqual([
      'p1',
      'p2',
      'p4',
      'p6',
      'p7',
    ]);

    // 2. Select an item within the context of the *filtered* array.
    // Let's select the 2nd item in the filtered list, which is 'Headphones' (p4).
    // The original index of 'p4' is 3. The filtered index is 2.
    const itemToSelect = inStockProxy.index(2); // 'Headphones'

    expect(itemToSelect.get().id).toBe('p4');

    // 3. Act on the selection
    itemToSelect.setSelected(true);

    // 4. Assertions

    // A) The selection index on the derived proxy should be its local index (2)
    expect(inStockProxy.getSelectedIndex()).toBe(2);
    expect(inStockProxy.getSelected()?.get().id).toBe('p4');

    // B) The selection index on the ORIGINAL, full array proxy must be the item's ORIGINAL index (3)
    expect(setter.products.getSelectedIndex()).toBe(3);
    expect(setter.products.getSelected()?.get().id).toBe('p4');
  });

  it('should update an item through a derived proxy and reflect it in the original state', () => {
    // 1. Filter for books, sort by price
    const booksProxy = setter.products
      .stateFilter((p) => p.category === 'books')
      .stateSort((a, b) => a.price - b.price);

    // Original state: 'The Great Gatsby' (p3) is not in stock.
    expect(booksProxy.get()[0].name).toBe('The Great Gatsby');
    expect(booksProxy.get()[0].inStock).toBe(false);

    // 2. Get the proxy for the first book in the sorted list and update it
    const gatsbyProxy = booksProxy.index(0);

    gatsbyProxy.inStock.update(true);

    // 3. Assert that the change is reflected in the original, unfiltered state
    const originalState = setter.get();

    const originalGatsbyObject = originalState.products.find(
      (p) => p.id === 'p3'
    );

    expect(originalGatsbyObject).toBeDefined();
    expect(originalGatsbyObject?.inStock).toBe(true);
  });

  it('should update an original item using the item setter from stateMap on a filtered array', () => {
    // 1. Filter for books. 'The Great Gatsby' (p3) is initially out of stock.
    const booksProxy = setter.products.stateFilter(
      (p) => p.category === 'books'
    );
    // Sanity check initial state
    const originalGatsby = setter.products.get().find((p) => p.id === 'p3');
    expect(originalGatsby?.inStock).toBe(false);

    // 2. Use stateMap on the filtered proxy. Inside the map, we get a setter for each item.
    // This setter should point back to the item in the *original* array.
    booksProxy.stateMap((itemSetter) => {
      // Find the specific book we want to modify and use its dedicated setter
      if (itemSetter.id.get() === 'p3') {
        itemSetter.inStock.update(true);
      }
    });

    // 4 Also assert that the change is reflected through the original proxy
    const gatsbyViaProxy = setter.products.findWith('id', 'p3');

    expect(gatsbyViaProxy.inStock.get()).toBe(true);
  });

  it('should insert into the original array using the array setter from stateMap', () => {
    // 1. Filter for apparel

    const apparelProxy = setter.products.stateFilter(
      (p) => p.category === 'apparel'
    );
    const initialFullLength = setter.products.get().length;

    // 2. Use stateMap. The last argument is a setter for the array being mapped over.
    // In this case of a derived (filtered) proxy, it should point to the ORIGINAL array.
    apparelProxy.stateMap((_itemSetter, index, arraySetter) => {
      // To avoid inserting multiple times, we only do it on the first iteration.
      if (index === 0) {
        arraySetter.insert({
          id: 'p8',
          name: 'Scarf',
          category: 'apparel',
          price: 35,
          inStock: true,
        });
      }
    });

    // 3. Assert that the new item was added to the main, unfiltered products array.
    const updatedProducts = setter.products.get();

    expect(updatedProducts.length).toBe(initialFullLength + 1);
    const newScarf = updatedProducts.find((p) => p.id === 'p8');
    expect(newScarf).toBeDefined();
    expect(newScarf?.name).toBe('Scarf');
  });

  describe('Update function behavior', () => {
    it('should update a primitive value directly', () => {
      const laptopProxy = setter.products.findWith('id', 'p1');
      expect(laptopProxy.price.get()).toBe(1200);

      // Act
      laptopProxy.price.update(1337);

      // Assert
      expect(laptopProxy.price.get()).toBe(1337);
      const updatedState = setter.get();

      expect(updatedState.products.find((p) => p.id === 'p1')?.price).toBe(
        1337
      );
    });

    it('should update a primitive value using a function', () => {
      const headphonesProxy = setter.products.findWith('id', 'p4');
      const initialPrice = headphonesProxy.price.get(); // 150

      // Act
      headphonesProxy.price.update((p) => p + 50);

      // Assert
      expect(headphonesProxy.price.get()).toBe(initialPrice + 50);
      expect(headphonesProxy.price.get()).toBe(200);
    });

    it('should update a whole object using a function', () => {
      const tShirtProxy = setter.products.findWith('id', 'p2');

      expect(tShirtProxy.get()).toEqual({
        id: 'p2',
        name: 'T-Shirt',
        category: 'apparel',
        price: 25,
        inStock: true,
      });

      // Act: Update multiple fields at once
      tShirtProxy.update((shirt) => ({
        ...shirt,
        inStock: false,
        name: 'Faded T-Shirt',
      }));

      // Assert
      const updatedShirt = tShirtProxy.get();
      expect(updatedShirt.name).toBe('Faded T-Shirt');
      expect(updatedShirt.inStock).toBe(false);
      // Ensure other fields are untouched
      expect(updatedShirt.price).toBe(25);
      expect(updatedShirt.id).toBe('p2');
    });
  });

  it('THE OMEGA KRAKEN: should handle a complex chain of filter, sort, map, update, insert, and select', () => {
    const initialProductCount = setter.products.get().length;

    // --- The Operation Chain ---

    // 1. Get all 'electronics' products.
    // 2. Sort them by price, ASCENDING.
    // 3. Map over this filtered, sorted list to perform multiple side-effects.
    const sortedElectronicsProxy = setter.products
      .stateFilter((p) => p.category === 'electronics')
      .stateSort((a, b) => a.price - b.price);

    // Initial check on the derived proxy's data before the map
    // Expected order: Keyboard (75), Headphones (150), Laptop (1200)
    expect(sortedElectronicsProxy.get().map((p) => p.id)).toEqual([
      'p7',
      'p4',
      'p1',
    ]);

    // 4. Perform multiple, mixed operations within a stateMap on the derived proxy
    sortedElectronicsProxy.stateMap((itemSetter, index, derivedArraySetter) => {
      // ACTION A
      if (itemSetter.get().id === 'p4') {
        itemSetter.inStock.update(false);
      }

      // ACTION B - This needs to use the ORIGINAL array proxy to insert
      // We can't use the derivedArraySetter for this.
      if (index === 0) {
        // To insert, we must use a proxy to the original array.
        // The `arraySetter` from the map callback is derived and cannot be used for insertion.
        // We use the top-level `setter.products` for this.
        setter.products.insert({
          id: 'p-mouse',
          name: 'Gaming Mouse',
          category: 'electronics',
          price: 65,
          inStock: true,
        });
      }

      // ACTION C: Select the LAST item in the DERIVED view.
      if (index === derivedArraySetter.get().length - 1) {
        itemSetter.setSelected(true);
      }
    });
    // --- Assertions: Verify every side-effect ---

    const finalGlobalState = setter.get();

    // ASSERTION 1: The item update is reflected in the original state.
    const updatedHeadphones = finalGlobalState.products.find(
      (p) => p.id === 'p4'
    );
    expect(updatedHeadphones?.inStock).toBe(false);

    // ASSERTION 2: The new item was inserted into the original state.
    expect(finalGlobalState.products.length).toBe(initialProductCount + 1);
    const newMouse = finalGlobalState.products.find((p) => p.id === 'p-mouse');
    expect(newMouse).toBeDefined();
    expect(newMouse?.name).toBe('Gaming Mouse');

    // ASSERTION 3: The selection is correct in the DERIVED proxy's context.
    // The Laptop (p1) is at index 2 of the sorted electronics list.
    console.log('sortedElectronicsProxy', sortedElectronicsProxy);
    expect(sortedElectronicsProxy.getSelectedIndex()).toBe(2);
    expect(sortedElectronicsProxy.getSelected()?.get().id).toBe('p1');

    // ASSERTION 4: The selection is also correct in the ORIGINAL proxy's context.
    // The Laptop (p1) is at index 0 of the original, full products list.
    expect(setter.products.getSelectedIndex()).toBe(0);
    expect(setter.products.getSelected()?.get().id).toBe('p1');

    // ASSERTION 5: The derived proxy itself still correctly reflects its source data *after* the operations.
    // Note: The new 'Gaming Mouse' is NOT in this list because the filter/sort happened *before* the insert.
    const finalDerivedData = sortedElectronicsProxy.get();
    expect(finalDerivedData.map((p) => p.id)).toEqual(['p7', 'p4', 'p1']);
    // And the update to 'inStock' is visible here too.
    expect(finalDerivedData.find((p) => p.id === 'p4')?.inStock).toBe(false);
  });
});
// Add this new describe block at the end of the file

describe('CogsState - Deeply Nested Array Operations', () => {
  let setter: StateObject<ComplexAppState>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Use the new 'complexApp' state key
    setter = useCogsState('complexApp');
    setter.revertToInitialState();
  });

  it('should find and update a nested property via a chained .index().findWith() call', () => {
    const instanceIndex = 0;
    const propertyToFindId = 'prop-b';
    // --- STEP 1: Test `.index(instanceIndex)` ---
    const instanceProxy = setter.itemInstances.index(instanceIndex);

    // Assert that we have a proxy and it points to the correct instance object.
    expect(instanceProxy).toBeDefined();
    expect(instanceProxy.id.get()).toBe('inst-1');
    expect(instanceProxy.instance_name.get()).toBe('First Instance');

    // --- STEP 2: Test accessing the `.properties` array from the instance proxy ---
    const propertiesProxy = instanceProxy.properties;
    const propertiesArray = propertiesProxy.get();
    console.log('propertiesArray', propertiesArray);
    // Assert that we have a proxy to the properties array and it has the correct length.
    expect(propertiesProxy).toBeDefined();
    expect(Array.isArray(propertiesArray)).toBe(true);
    expect(propertiesArray.length).toBe(3);
    expect(propertiesArray[0].itemcatprop_id).toBe('prop-a');
    // --- STEP 3: Test `.findWith()` on the properties proxy ---
    const propertyProxy = propertiesProxy.findWith(
      'itemcatprop_id',
      propertyToFindId
    );

    // Assert that we found the correct specific property.
    // This is where the original test was failing.
    expect(propertyProxy).toBeDefined();
    const initialProperty = propertyProxy.get();

    expect(initialProperty).toEqual({
      itemcatprop_id: 'prop-b',
      name: 'Size',
      value: 10,
    });

    // --- STEP 4: Test the update operation ---
    propertyProxy.value.update(99);

    // Assert that the update is reflected when GETTING the value again through the same proxy.
    expect(propertyProxy.value.get()).toBe(99); // --- STEP 5: Verify the update in the global state ---
    const finalState = setter.get();
    const updatedProperty = finalState.itemInstances[0].properties.find(
      (p) => p.itemcatprop_id === propertyToFindId
    );
    expect(updatedProperty?.value).toBe(99);
  });
});

describe('CogsState - Shadow Store Edge Cases and Stress Tests', () => {
  let setter: StateObject<AdvancedTestState>;

  beforeEach(() => {
    vi.clearAllMocks();
    setter = useCogsState('advancedTestState');
    setter.revertToInitialState();
  });

  it('should handle multiple rapid inserts and maintain correct shadow store state', () => {
    const initialCount = setter.products.get().length;

    for (let i = 0; i < 10; i++) {
      setter.products.insert({
        id: `rapid-${i}`,
        name: `Rapid Product ${i}`,
        category: 'electronics',
        price: 100 + i,
        inStock: true,
      });
    }

    expect(setter.products.get().length).toBe(initialCount + 10);

    // Verify all items are accessible
    for (let i = 0; i < 10; i++) {
      const item = setter.products.findWith('id', `rapid-${i}`);
      expect(item.get().name).toBe(`Rapid Product ${i}`);
    }
  });

  it('should handle alternating insert/cut operations', () => {
    const initialCount = setter.products.get().length;

    // Insert 5 items
    for (let i = 0; i < 5; i++) {
      setter.products.insert({
        id: `alt-${i}`,
        name: `Alt Product ${i}`,
        category: 'books',
        price: 50 + i,
        inStock: false,
      });
    }
    // Remove every other item
    setter.products.findWith('id', 'alt-1').cutThis();
    setter.products.findWith('id', 'alt-3').cutThis();

    expect(setter.products.get().length).toBe(initialCount + 3);
    expect(setter.products.findWith('id', 'alt-0')).toBeDefined();
    expect(setter.products.findWith('id', 'alt-2')).toBeDefined();
    expect(setter.products.findWith('id', 'alt-4')).toBeDefined();
  });

  it('should handle moving items between filtered sets', () => {
    // --- SETUP ---
    // Get initial state of the filters
    const initialElectronics = setter.products.stateFilter(
      (p) => p.category === 'electronics'
    );
    const initialBooks = setter.products.stateFilter(
      (p) => p.category === 'books'
    );

    const initialElectronicsCount = initialElectronics.get().length;
    const initialBooksCount = initialBooks.get().length;

    // --- ACTION ---
    // Change a book to an electronic
    setter.products.findWith('id', 'p3').category.update('electronics');

    // --- ASSERTION ---
    // **CRUCIAL STEP**: Re-run the filters to get the new, updated views
    const currentElectronics = setter.products.stateFilter(
      (p) => p.category === 'electronics'
    );
    const currentBooks = setter.products.stateFilter(
      (p) => p.category === 'books'
    );

    // Now, test the results of the NEW filters
    expect(currentElectronics.get().length).toBe(initialElectronicsCount + 1);
    expect(currentBooks.get().length).toBe(initialBooksCount - 1);

    // You can also verify the specific item is in the new set
    expect(currentElectronics.get().some((p) => p.id === 'p3')).toBe(true);
    expect(currentBooks.get().some((p) => p.id === 'p3')).toBe(false);
  });

  it('should maintain selection state across filter changes', () => {
    // Select an item
    setter.products.findWith('id', 'p4').setSelected(true);

    // Create filtered view that includes selected item
    let electronics = setter.products.stateFilter(
      (p) => p.category === 'electronics'
    );

    expect(electronics.getSelected()?.get().id).toBe('p4');

    // Change the selected item's category so it's filtered out
    setter.products.findWith('id', 'p4').category.update('books');
    electronics = setter.products.stateFilter((p) => {
      return p.category === 'electronics';
    });

    // Electronics filter should no longer have a selection
    expect(electronics.getSelected()?.get()).toBeUndefined();

    // But the main array still knows what's selected
    expect(setter.products.getSelected()?.get().id).toBe('p4');
  });

  it('should handle sorting with duplicate values', () => {
    // Add items with duplicate prices
    setter.products.insert({
      id: 'dup1',
      name: 'Dup 1',
      category: 'books',
      price: 50,
      inStock: true,
    });
    setter.products.insert({
      id: 'dup2',
      name: 'Dup 2',
      category: 'books',
      price: 50,
      inStock: true,
    });
    setter.products.insert({
      id: 'dup3',
      name: 'Dup 3',
      category: 'books',
      price: 50,
      inStock: true,
    });

    const sorted = setter.products.stateSort((a, b) => a.price - b.price);
    const sortedPrices = sorted.get().map((p) => p.price);

    // Should be sorted with all 50s together
    expect(sortedPrices.filter((p) => p === 50).length).toBe(3);

    // Updating one of the duplicates
    sorted.findWith('id', 'dup2').price.update(51);

    // Re-sort and verify order changed
    const reSorted = setter.products.stateSort((a, b) => a.price - b.price);
    const dup2Index = reSorted.get().findIndex((p) => p.id === 'dup2');
    const dup1Index = reSorted.get().findIndex((p) => p.id === 'dup1');
    expect(dup2Index).toBeGreaterThan(dup1Index);
  });

  it('should handle complex array transformations', () => {
    // Get all products, group by category, then flatten back
    const byCategory = {
      electronics: setter.products.stateFilter(
        (p) => p.category === 'electronics'
      ),
      books: setter.products.stateFilter((p) => p.category === 'books'),
      apparel: setter.products.stateFilter((p) => p.category === 'apparel'),
    };

    // Modify each category differently
    byCategory.electronics.stateMap((setter) => {
      setter.price.update((p) => p * 0.9); // 10% discount
    });

    byCategory.books.stateMap((setter) => {
      setter.inStock.update(true); // All books in stock
    });

    byCategory.apparel.stateMap((setter) => {
      setter.name.update((n) => `Sale: ${n}`); // Add sale prefix
    });
    // Verify transformations
    const final = setter.products.get();
    expect(final.find((p) => p.id === 'p1')?.price).toBe(1080); // 1200 * 0.9
    expect(final.find((p) => p.id === 'p3')?.inStock).toBe(true);
    expect(final.find((p) => p.id === 'p2')?.name).toBe('Sale: T-Shirt');
  });
});

// Update the createCogsState call to include the new state (add this to the existing call)
// ordersTestState: { initialState: getOrdersInitialState() },

// Add this new describe block at the very bottom
describe('CogsState - Nested Arrays Filter and Sort', () => {
  let setter: StateObject<OrdersTestState>;

  beforeEach(() => {
    vi.clearAllMocks();
    setter = useCogsState('ordersTestState');
    setter.revertToInitialState();
  });

  it('should filter and sort both outer and inner arrays independently', () => {
    // OUTER ARRAY: Filter orders to only get high-value orders (total >= 100)
    const highValueOrdersProxy = setter.orders.stateFilter(
      (order) => order.total >= 100
    );
    const highValueOrders = highValueOrdersProxy.get();

    // Should have 2 high-value orders: order-1 (Alice $125) and order-3 (Charlie $200)
    expect(highValueOrders.length).toBe(2);
    expect(highValueOrders.map((o) => o.customerName).sort()).toEqual([
      'Alice',
      'Charlie',
    ]);

    // OUTER ARRAY: Sort high-value orders by total (descending)
    const sortedHighValueOrdersProxy = highValueOrdersProxy.stateSort(
      (a, b) => b.total - a.total
    );
    const sortedHighValueOrders = sortedHighValueOrdersProxy.get();

    // Should be ordered: Charlie ($200), Alice ($125)
    expect(sortedHighValueOrders.map((o) => o.customerName)).toEqual([
      'Charlie',
      'Alice',
    ]);
    expect(sortedHighValueOrders.map((o) => o.total)).toEqual([200, 125]);

    // INNER ARRAYS: Now filter each order's items independently
    // For Charlie's order (first in sorted list), get expensive items (price >= 50)
    const charlieExpensiveItemsProxy = sortedHighValueOrdersProxy
      .index(0)
      .items.stateFilter((item) => item.price >= 50);
    const charlieExpensiveItems = charlieExpensiveItemsProxy.get();

    // Should have 2 items: Monitor ($150) and Keyboard ($50)
    expect(charlieExpensiveItems.length).toBe(2);
    expect(charlieExpensiveItems.map((item) => item.name).sort()).toEqual([
      'Keyboard',
      'Monitor',
    ]);

    // Sort Charlie's expensive items by price (ascending)
    const charlieSortedItemsProxy = charlieExpensiveItemsProxy.stateSort(
      (a, b) => a.price - b.price
    );
    const charlieSortedItems = charlieSortedItemsProxy.get();

    expect(charlieSortedItems.map((item) => item.name)).toEqual([
      'Keyboard',
      'Monitor',
    ]);
    expect(charlieSortedItems.map((item) => item.price)).toEqual([50, 150]);

    // For Alice's order (second in sorted list), get bulk items (quantity >= 2)
    const aliceBulkItemsProxy = sortedHighValueOrdersProxy
      .index(1)
      .items.stateFilter((item) => item.quantity >= 2);
    const aliceBulkItems = aliceBulkItemsProxy.get();

    // Should have 1 item: Mouse (quantity 2)
    expect(aliceBulkItems.length).toBe(1);
    expect(aliceBulkItems[0].name).toBe('Mouse');
    expect(aliceBulkItems[0].quantity).toBe(2);

    // Sort Alice's bulk items by quantity (descending) - only one item but test the chaining
    const aliceSortedBulkItemsProxy = aliceBulkItemsProxy.stateSort(
      (a, b) => b.quantity - a.quantity
    );
    const aliceSortedBulkItems = aliceSortedBulkItemsProxy.get();

    expect(aliceSortedBulkItems[0].name).toBe('Mouse');

    // Verify updates work through the deeply filtered/sorted chains
    const keyboardProxy = charlieSortedItemsProxy.index(0); // Keyboard is first after sort
    expect(keyboardProxy.name.get()).toBe('Keyboard');

    keyboardProxy.price.update(65);

    // Verify the change is reflected in the original state
    const originalState = setter.get();
    const updatedKeyboard = originalState.orders
      .find((o) => o.customerName === 'Charlie')
      ?.items.find((i) => i.name === 'Keyboard');
    expect(updatedKeyboard?.price).toBe(65);

    // Verify the change is also reflected through other proxy paths
    expect(
      charlieExpensiveItemsProxy.get().find((item) => item.name === 'Keyboard')
        ?.price
    ).toBe(65);
  });
});
// Replace the previous helper methods tests with this corrected block
describe('CogsState - Core Helper Methods & Edge Cases', () => {
  let basicSetter: StateObject<BasicTestState>;
  let advancedSetter: StateObject<AdvancedTestState>;

  beforeEach(() => {
    vi.clearAllMocks();
    basicSetter = useCogsState('basicTestState');
    advancedSetter = useCogsState('advancedTestState');
    basicSetter.revertToInitialState();
    advancedSetter.revertToInitialState();
  });

  it('should get the status of a value (fresh vs. dirty)', () => {
    expect(basicSetter.counter.getStatus()).toBe('fresh');
    basicSetter.counter.update(5);
    expect(basicSetter.counter.getStatus()).toBe('dirty');
  });

  it('should update the entire initial state structure with updateInitialState', () => {
    const newInitialState = { ...getBasicInitialState(), counter: 1000 };
    basicSetter.updateInitialState(newInitialState);
    expect(basicSetter.counter.get()).toBe(1000);
  });

  it('should find an object in an array using key-value with findWith', () => {
    // Use the correct API method: findWith
    const bookProxy = advancedSetter.products.findWith('price', 20);
    expect(bookProxy?.id.get()).toBe('p6'); // 'Dune'
  });

  it('should prevent adding a duplicate with uniqueInsert', () => {
    const initialLength = basicSetter.tasks.get().length;
    // Insert a duplicate based on the 'id' field
    basicSetter.tasks.uniqueInsert({ id: 1, text: 'This is a duplicate' }, [
      'id',
    ]);
    expect(basicSetter.tasks.get().length).toBe(initialLength); // Should not change
  });

  it('should cut an item by its value from a primitive array with cutByValue', () => {
    basicSetter.items.cutByValue('b');
    expect(basicSetter.items.get()).toEqual(['a', 'c']);
  });

  it('should toggle an item in a primitive array with toggleByValue', () => {
    basicSetter.items.toggleByValue('d'); // Add 'd'
    expect(basicSetter.items.get()).toContain('d');
    basicSetter.items.toggleByValue('d'); // Remove 'd'
    expect(basicSetter.items.get()).not.toContain('d');
  });

  it('should clear a selection with clearSelected', () => {
    advancedSetter.products.index(2).setSelected(true);
    expect(advancedSetter.products.getSelected()?.get()).toBeDefined();
    advancedSetter.products.clearSelected();
    expect(advancedSetter.products.getSelected()).toBeUndefined();
  });

  it('should throw an error when using .toggle() on a non-boolean', () => {
    // Expecting the function call inside to throw an error
    //@ts-ignore
    expect(() => basicSetter.counter.toggle()).toThrow(
      'toggle() can only be used on boolean values'
    );
  });
});
