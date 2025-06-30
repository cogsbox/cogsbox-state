// src/tests/CogsState.advanced.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { createCogsState, type StateObject } from "../src/CogsState";
import { getGlobalStore } from "../src/store";

// --- REACT MOCK (Required for the hook logic to run) ---
vi.mock("react", async (importOriginal) => {
  const actualReact = await importOriginal<typeof React>();
  return {
    ...actualReact,
    useContext: () => ({ sessionId: "test-session-id" }),
    useState: (initialValue: any) => [initialValue, vi.fn()],
    useEffect: vi.fn(),
    useLayoutEffect: vi.fn(),
    useRef: (initialValue: any) => ({ current: initialValue }),
    useCallback: (fn: any) => fn,
    useMemo: (fn: any) => fn(),
    useSyncExternalStore: (subscribe: any, getSnapshot: any) => getSnapshot(),
  };
});
// --- END OF MOCK ---

// A more complex data structure for better testing
interface Product {
  id: string;
  name: string;
  category: "electronics" | "books" | "apparel";
  price: number;
  inStock: boolean;
}
interface AdvancedTestState {
  products: Product[];
}
const getInitialState = (): AdvancedTestState => ({
  products: [
    {
      id: "p1",
      name: "Laptop",
      category: "electronics",
      price: 1200,
      inStock: true,
    },
    {
      id: "p2",
      name: "T-Shirt",
      category: "apparel",
      price: 25,
      inStock: true,
    },
    {
      id: "p3",
      name: "The Great Gatsby",
      category: "books",
      price: 15,
      inStock: false,
    },
    {
      id: "p4",
      name: "Headphones",
      category: "electronics",
      price: 150,
      inStock: true,
    },
    { id: "p5", name: "Jeans", category: "apparel", price: 80, inStock: false },
    { id: "p6", name: "Dune", category: "books", price: 20, inStock: true },
    {
      id: "p7",
      name: "Keyboard",
      category: "electronics",
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
      id: "inst-1",
      instance_name: "First Instance",
      properties: [
        { itemcatprop_id: "prop-a", name: "Color", value: "Red" },
        { itemcatprop_id: "prop-b", name: "Size", value: 10 },
        { itemcatprop_id: "prop-c", name: "Material", value: "Wood" },
      ],
    },
    {
      id: "inst-2",
      instance_name: "Second Instance",
      properties: [
        { itemcatprop_id: "prop-a", name: "Color", value: "Blue" },
        { itemcatprop_id: "prop-d", name: "Weight", value: 25 },
      ],
    },
  ],
});

// Update the createCogsState call to include this new state
// You'll need to find the existing `createCogsState` call and add the `complexApp` key.
const { useCogsState } = createCogsState({
  advancedTestState: { initialState: getInitialState() },
  complexApp: { initialState: getComplexInitialState() }, // <-- ADD THIS
});

describe("CogsState - Advanced Chained Array Operations", () => {
  let setter: StateObject<AdvancedTestState>;

  beforeEach(() => {
    vi.clearAllMocks();
    useCogsState("advancedTestState");
    setter = useCogsState("advancedTestState");
    setter.revertToInitialState();
  });

  it("should filter by one key, then sort the result by another", () => {
    // 1. Filter for all 'electronics' products
    console.log("sfilteredData------------------", setter.get()); //get is undfeinded
    const electronicsProxy = setter.products.stateFilter(
      (p) => p.category === "electronics"
    );

    let filteredData = electronicsProxy.get();

    expect(filteredData.map((p) => p.id)).toEqual(["p1", "p4", "p7"]);

    // 2. Sort the *filtered* proxy by price, descending
    const sortedElectronicsProxy = electronicsProxy.stateSort(
      (a, b) => b.price - a.price
    );
    console.log("electronicsProxy", sortedElectronicsProxy.get());
    let sortedData = sortedElectronicsProxy.get();
    expect(sortedData.map((p) => p.id)).toEqual(["p1", "p4", "p7"]); // Correct order: Laptop, Headphones, Keyboard
  });

  it("should correctly map over a filtered and sorted array", () => {
    // 1. Filter for 'apparel'
    // 2. Sort by price ascending
    const sortedApparelProxy = setter.products
      .stateFilter((p) => p.category === "apparel")
      .stateSort((a, b) => a.price - b.price);

    const apparelData = sortedApparelProxy.get();
    expect(apparelData.map((p) => p.id)).toEqual(["p2", "p5"]); // T-Shirt, Jeans

    // 3. Map the result to a new structure, checking if the setter paths are correct
  });

  it("should handle selections correctly within a derived (filtered) array", () => {
    // 1. Get a derived proxy for all items that are in stock
    const inStockProxy = setter.products.stateFilter((p) => p.inStock);

    const inStockData = inStockProxy.get();
    expect(inStockData.map((p) => p.id)).toEqual([
      "p1",
      "p2",
      "p4",
      "p6",
      "p7",
    ]);

    // 2. Select an item within the context of the *filtered* array.
    // Let's select the 2nd item in the filtered list, which is 'Headphones' (p4).
    // The original index of 'p4' is 3. The filtered index is 2.
    const itemToSelect = inStockProxy.index(2); // 'Headphones'

    expect(itemToSelect.get().id).toBe("p4");

    // 3. Act on the selection
    itemToSelect.setSelected(true);

    // 4. Assertions

    // A) The selection index on the derived proxy should be its local index (2)
    expect(inStockProxy.getSelectedIndex()).toBe(2);
    expect(inStockProxy.getSelected()?.get().id).toBe("p4");

    // B) The selection index on the ORIGINAL, full array proxy must be the item's ORIGINAL index (3)
    expect(setter.products.getSelectedIndex()).toBe(3);
    expect(setter.products.getSelected()?.get().id).toBe("p4");
  });

  it("should update an item through a derived proxy and reflect it in the original state", () => {
    // 1. Filter for books, sort by price
    const booksProxy = setter.products
      .stateFilter((p) => p.category === "books")
      .stateSort((a, b) => a.price - b.price);

    // Original state: 'The Great Gatsby' (p3) is not in stock.
    expect(booksProxy.get()[0].name).toBe("The Great Gatsby");
    expect(booksProxy.get()[0].inStock).toBe(false);

    // 2. Get the proxy for the first book in the sorted list and update it
    const gatsbyProxy = booksProxy.index(0);

    gatsbyProxy.inStock.update(true);

    // 3. Assert that the change is reflected in the original, unfiltered state
    const originalState = setter.get();
    console.log("itemToSelect 1111111111111111", originalState);
    const originalGatsbyObject = originalState.products.find(
      (p) => p.id === "p3"
    );

    expect(originalGatsbyObject).toBeDefined();
    expect(originalGatsbyObject?.inStock).toBe(true);
  });
  return;
  it("should update an original item using the item setter from stateMap on a filtered array", () => {
    // 1. Filter for books. 'The Great Gatsby' (p3) is initially out of stock.
    const booksProxy = setter.products.stateFilter(
      (p) => p.category === "books"
    );

    // Sanity check initial state
    const originalGatsby = setter.products.get().find((p) => p.id === "p3");
    expect(originalGatsby?.inStock).toBe(false);

    // 2. Use stateMap on the filtered proxy. Inside the map, we get a setter for each item.
    // This setter should point back to the item in the *original* array.
    booksProxy.stateMap((item, itemSetter) => {
      // Find the specific book we want to modify and use its dedicated setter
      if (item.id === "p3") {
        itemSetter.inStock.update(true);
      }
    });

    // 3. Assert that the change is reflected in the original, unfiltered state store.
    const updatedState =
      getGlobalStore.getState().cogsStateStore.advancedTestState;
    const updatedGatsby = updatedState.products.find((p) => p.id === "p3");
    expect(updatedGatsby).toBeDefined();
    expect(updatedGatsby?.inStock).toBe(true);

    // 4. Also assert that the change is reflected through the original proxy
    const gatsbyViaProxy = setter.products.findWith("id", "p3");
    expect(gatsbyViaProxy.inStock.get()).toBe(true);
  });
  return;
  it("should insert into the original array using the array setter from stateMap", () => {
    // 1. Filter for apparel
    const apparelProxy = setter.products.stateFilter(
      (p) => p.category === "apparel"
    );
    const initialFullLength = setter.products.get().length;

    // 2. Use stateMap. The last argument is a setter for the array being mapped over.
    // In this case of a derived (filtered) proxy, it should point to the ORIGINAL array.
    apparelProxy.stateMap((_item, _itemSetter, index, _array, arraySetter) => {
      // To avoid inserting multiple times, we only do it on the first iteration.
      if (index === 0) {
        arraySetter.insert({
          id: "p8",
          name: "Scarf",
          category: "apparel",
          price: 35,
          inStock: true,
        });
      }
    });

    // 3. Assert that the new item was added to the main, unfiltered products array.
    const updatedProducts = setter.products.get();
    expect(updatedProducts.length).toBe(initialFullLength + 1);
    const newScarf = updatedProducts.find((p) => p.id === "p8");
    expect(newScarf).toBeDefined();
    expect(newScarf?.name).toBe("Scarf");
  });

  describe("Update function behavior", () => {
    it("should update a primitive value directly", () => {
      const laptopProxy = setter.products.findWith("id", "p1");
      expect(laptopProxy.price.get()).toBe(1200);

      // Act
      laptopProxy.price.update(1337);

      // Assert
      expect(laptopProxy.price.get()).toBe(1337);
      const updatedState =
        getGlobalStore.getState().cogsStateStore.advancedTestState;
      expect(updatedState.products.find((p) => p.id === "p1")?.price).toBe(
        1337
      );
    });

    it("should update a primitive value using a function", () => {
      const headphonesProxy = setter.products.findWith("id", "p4");
      const initialPrice = headphonesProxy.price.get(); // 150

      // Act
      headphonesProxy.price.update((p) => p + 50);

      // Assert
      expect(headphonesProxy.price.get()).toBe(initialPrice + 50);
      expect(headphonesProxy.price.get()).toBe(200);
    });

    it("should update a whole object using a function", () => {
      const tShirtProxy = setter.products.findWith("id", "p2");
      expect(tShirtProxy.get()).toEqual({
        id: "p2",
        name: "T-Shirt",
        category: "apparel",
        price: 25,
        inStock: true,
      });

      // Act: Update multiple fields at once
      tShirtProxy.update((shirt) => ({
        ...shirt,
        inStock: false,
        name: "Faded T-Shirt",
      }));

      // Assert
      const updatedShirt = tShirtProxy.get();
      expect(updatedShirt.name).toBe("Faded T-Shirt");
      expect(updatedShirt.inStock).toBe(false);
      // Ensure other fields are untouched
      expect(updatedShirt.price).toBe(25);
      expect(updatedShirt.id).toBe("p2");
    });
  });
  it("THE OMEGA KRAKEN: should handle a complex chain of filter, sort, map, update, insert, and select", () => {
    const initialProductCount = setter.products.get().length;

    // --- The Operation Chain ---

    // 1. Get all 'electronics' products.
    // 2. Sort them by price, ASCENDING.
    // 3. Map over this filtered, sorted list to perform multiple side-effects.
    const sortedElectronicsProxy = setter.products
      .stateFilter((p) => p.category === "electronics")
      .stateSort((a, b) => a.price - b.price);

    // Initial check on the derived proxy's data before the map
    // Expected order: Keyboard (75), Headphones (150), Laptop (1200)
    expect(sortedElectronicsProxy.get().map((p) => p.id)).toEqual([
      "p7",
      "p4",
      "p1",
    ]);

    // 4. Perform multiple, mixed operations within a stateMap on the derived proxy
    sortedElectronicsProxy.stateMap(
      (item, itemSetter, index, localArray, originalArraySetter) => {
        // ACTION A: Update an existing item in the middle of the derived list.
        // The 'Headphones' (p4) are initially inStock: true. Let's change it.
        if (item.id === "p4") {
          itemSetter.inStock.update(false);
        }

        // ACTION B: Insert a completely new item into the ORIGINAL array.
        // We use the `originalArraySetter` and only do it once.
        if (index === 0) {
          originalArraySetter.insert({
            id: "p-mouse",
            name: "Gaming Mouse",
            category: "electronics",
            price: 65,
            inStock: true,
          });
        }

        // ACTION C: Select the LAST item in this derived view (the Laptop, p1).
        if (index === localArray.length - 1) {
          itemSetter.setSelected(true);
        }
      }
    );

    // --- Assertions: Verify every side-effect ---

    const finalGlobalState =
      getGlobalStore.getState().cogsStateStore.advancedTestState;

    // ASSERTION 1: The item update is reflected in the original state.
    const updatedHeadphones = finalGlobalState.products.find(
      (p) => p.id === "p4"
    );
    expect(updatedHeadphones?.inStock).toBe(false);

    // ASSERTION 2: The new item was inserted into the original state.
    expect(finalGlobalState.products.length).toBe(initialProductCount + 1);
    const newMouse = finalGlobalState.products.find((p) => p.id === "p-mouse");
    expect(newMouse).toBeDefined();
    expect(newMouse?.name).toBe("Gaming Mouse");

    // ASSERTION 3: The selection is correct in the DERIVED proxy's context.
    // The Laptop (p1) is at index 2 of the sorted electronics list.
    expect(sortedElectronicsProxy.getSelectedIndex()).toBe(2);
    expect(sortedElectronicsProxy.getSelected()?.get().id).toBe("p1");

    // ASSERTION 4: The selection is also correct in the ORIGINAL proxy's context.
    // The Laptop (p1) is at index 0 of the original, full products list.
    expect(setter.products.getSelectedIndex()).toBe(0);
    expect(setter.products.getSelected()?.get().id).toBe("p1");

    // ASSERTION 5: The derived proxy itself still correctly reflects its source data *after* the operations.
    // Note: The new 'Gaming Mouse' is NOT in this list because the filter/sort happened *before* the insert.
    const finalDerivedData = sortedElectronicsProxy.get();
    expect(finalDerivedData.map((p) => p.id)).toEqual(["p7", "p4", "p1"]);
    // And the update to 'inStock' is visible here too.
    expect(finalDerivedData.find((p) => p.id === "p4")?.inStock).toBe(false);
  });
});
// Add this new describe block at the end of the file

// describe("CogsState - Deeply Nested Array Operations", () => {
//   let setter: StateObject<ComplexAppState>;

//   beforeEach(() => {
//     vi.clearAllMocks();
//     // Use the new 'complexApp' state key
//     setter = useCogsState("complexApp");
//     setter.revertToInitialState();
//   });

//   it("should find and update a nested property via a chained .index().findWith() call", () => {
//     const instanceIndex = 0;
//     const propertyToFindId = "prop-b";

//     // --- STEP 1: Test `.index(instanceIndex)` ---
//     const instanceProxy = setter.itemInstances.index(instanceIndex);

//     // Assert that we have a proxy and it points to the correct instance object.
//     expect(instanceProxy).toBeDefined();
//     expect(instanceProxy.id.get()).toBe("inst-1");
//     expect(instanceProxy.instance_name.get()).toBe("First Instance");

//     // --- STEP 2: Test accessing the `.properties` array from the instance proxy ---
//     const propertiesProxy = instanceProxy.properties;
//     const propertiesArray = propertiesProxy.get();

//     // Assert that we have a proxy to the properties array and it has the correct length.
//     expect(propertiesProxy).toBeDefined();
//     expect(Array.isArray(propertiesArray)).toBe(true);
//     expect(propertiesArray.length).toBe(3);
//     expect(propertiesArray[0].itemcatprop_id).toBe("prop-a");
//     console.log("propertyToFindId", propertyToFindId);
//     // --- STEP 3: Test `.findWith()` on the properties proxy ---
//     const propertyProxy = propertiesProxy.findWith(
//       "itemcatprop_id",
//       propertyToFindId
//     );

//     // Assert that we found the correct specific property.
//     // This is where the original test was failing.
//     expect(propertyProxy).toBeDefined();
//     const initialProperty = propertyProxy.get();

//     console.log("propertiesProxypropertiesProxy", propertiesProxy.get());

//     expect(initialProperty).toEqual({
//       itemcatprop_id: "prop-b",
//       name: "Size",
//       value: 10,
//     });

//     // --- STEP 4: Test the update operation ---
//     propertyProxy.value.update(99);

//     // Assert that the update is reflected when GETTING the value again through the same proxy.
//     expect(propertyProxy.value.get()).toBe(99);

//     // --- STEP 5: Verify the update in the global state ---
//     const finalState = getGlobalStore.getState().cogsStateStore.complexApp;
//     const updatedInstanceData = finalState.itemInstances[instanceIndex];
//     const updatedPropertyData = updatedInstanceData.properties.find(
//       (p) => p.itemcatprop_id === propertyToFindId
//     );

//     expect(updatedPropertyData).toBeDefined();
//     expect(updatedPropertyData?.value).toBe(99);
//   });
//});
