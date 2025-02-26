import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ProductList } from "./ProductList";
import {
  CartOverview,
  CartOverviewDep,
  CartOverviewDepMissing,
  CartOverviewFully,
  CartOverviewGet,
} from "./CartOvervlew";

import { TriangleAlert } from "lucide-react";
import { useCogsState } from "./state";
import CodeLine from "../CodeLine";
import { FlashWrapper } from "../FlashOnUpdate";
// Code for individual components - minimal examples
const fullyReactiveCode = `export const CartOverviewFully = () => {
    // Fully reactive - re-renders on any state changes
    const cart = useCogsState("cart", {
      reactiveType: ["all"],
    });
    const products = useCogsState("products", {
      reactiveType: ["all"],
    });
  
    return (
      <div className="p-4 rounded bg-gray-500">
        <h3>Fully Reactive</h3>
        <div className="flex justify-between">
          <div>Items: {cart.items.get().length}</div>
          <div>Total: {cart.total.get()}</div>
        </div>
      </div>
    );
  };`;

const componentReactiveCode = `export const CartOverviewGet = () => {
    // Component reactive - default behavior
    // Re-renders only when used values change
    const cart = useCogsState("cart");
    
    return (
      <div className="p-4 rounded bg-amber-400">
        <h3>Component Reactive</h3>
        <div className="flex justify-between">
          <div>Items: {cart.items.get().length}</div>
          <div>Total: {cart.total.get()}</div>
        </div>
      </div>
    );
  };`;

const reactiveDepsCode = `export const CartOverviewDep = () => {
    // Reactive dependencies - only specific dependencies trigger re-renders
    const cart = useCogsState("cart", {
      reactiveType: ["deps"],
      reactiveDeps: (state) => [state.items, state.status],
    });
    
    return (
      <div className="p-4 rounded bg-sky-500">
        <h3>Reactive Dependencies</h3>
        <div className="flex justify-between">
          <div>Items: {cart.items.get().length}</div>
          <div>Total: {cart.total.get()}</div>
        </div>
      </div>
    );
  };`;

const signalBasedCode = `export const CartOverview = () => {
    // Signal-based reactivity - most efficient
    // Only updates DOM elements that depend on changed values
    const cart = useCogsState("cart");
    
    return (
      <div className="p-4 rounded bg-emerald-500">
        <h3>Signal Based - $get()</h3>
        <div className="flex justify-between">
          <div>Items: {cart.items.$derive((state) => state.length)} items</div>
          <div>Total: {cart.total.$get()}</div>
        </div>
      </div>
    );
  };`;

const CartComponentsAPI = () => {
  return (
    <div className="bg-white rounded-lg p-6 w-full space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Reactivity Types
        </h2>

        <div className="bg-white rounded-lg w-full space-y-6 text-gray-600">
          <p className="mb-4">
            This showcase demonstrates different reactivity types and how they
            function.
          </p>

          <div className="space-y-4">
            {/* Default setting */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <CodeLine code={`reactiveType: ["component", "deps"]`} />
              </div>
              <div className="w-1/2">
                <p>
                  Default setting. Any values used in the component and any
                  dependencies will trigger a rerender.
                </p>
              </div>
            </div>
            {/* Component only */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <CodeLine code={`reactiveType: ["component"]`} />
              </div>
              <div className="w-1/2">
                <p>Limit rerenders to only when a component value changes.</p>
              </div>
            </div>
            {/* Dependencies only */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <CodeLine code={`reactiveType: ["deps"]`} />
              </div>
              <div className="w-1/2">
                <p>Rerender only when a specified dependency changes.</p>
              </div>
            </div>
            {/* Other settings */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <CodeLine code={`reactiveType: ["all"]`} />
              </div>
              <div className="w-1/2">
                <p>
                  The component will re-render whenever any value in the state
                  object changes.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <CodeLine code={`reactiveType: ["none"]`} />
              </div>
              <div className="w-1/2">
                <p>No automatic reactivity. Requires manual updates.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Working with Reactive Dependencies
        </h2>

        <div className="space-y-6 text-gray-600">
          <p>
            The reactive dependencies approach provides fine-grained control
            over component updates, allowing for performance optimizations and
            predictable rendering behavior.
          </p>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Working with Reactive Dependencies
            </h2>

            <p>
              The reactive dependencies approach provides fine-grained control
              over component updates, allowing for performance optimizations and
              predictable rendering behavior.
            </p>
            <div className="h-8" />
            <h3 className="font-semibold text-gray-800 mb-2">
              Basic Implementation
            </h3>
            <CodeLine
              code={`const cart = useCogsState("cart", {
  reactiveType: ["deps"],
  reactiveDeps: (state) => [state.items, state.total, state.status],
});`}
            />
            <p className=" text-sm">
              This component will only re-render when the items array, total
              value, or status changes. Changes to other properties won't
              trigger updates.
            </p>
          </div>

          <h3 className="font-semibold text-gray-800 mb-2">
            External Dependencies
          </h3>
          <CodeLine
            code={`const cart = useCogsState("cart", {
  reactiveType: ["deps"],
  reactiveDeps: (state) => [
    state.items.length,  // Derived value - number of items
    someExternalValue,  // External dependency
    state.total > 100  // Derived condition
  ],
});`}
          />
          <p className="mt-2 text-sm">
            You can include both derived values and external dependencies in
            your dependency array. This allows the component to react to changes
            outside its direct state, such as context values, props, or other
            external state.
          </p>
        </div>
      </div>
    </div>
  );
};

const CartComponentsDescription = () => {
  return (
    <div className="bg-white rounded-lg p-6 w-full space-y-6 text-gray-600">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2 flex gap-2">
          <div className="rounded-full h-6 w-6 bg-gray-500" /> Fully Reactive
        </h2>
        <p>Fully reactive for any state changes. Default React behavior.</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2 flex gap-2">
          <div className="rounded-full h-6 w-6 bg-amber-400" /> Component
          Reactive
        </h2>
        <p>
          This component demonstrates how values accessed within the component
          using non "$" functions automatically trigger re-renders when they
          change. This is the default behavior, essentially limiting rerenders
          to state it actually uses.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2 flex gap-2">
          <div className="rounded-full h-6 w-6 bg-sky-500" /> Reactive
          Dependencies
        </h2>
        <p>
          This approach lets you specify exactly which parts of the state should
          trigger re-renders using reactiveDeps. This gives you precise control
          over component updates and can optimize performance by limiting
          unnecessary re-renders.{" "}
          <span className="font-bold text-red-500">
            However there are risks involved with this, see the warning below.
          </span>
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2 flex gap-2">
          <div className="rounded-full h-6 w-6 bg-emerald-500" /> Reactive
          Dependencies Signal Based - $get()
        </h2>
        <p>
          The most efficient implementation using signals ($get(), $derive()).
          Instead of re-rendering the entire component, it only updates the
          specific DOM elements that depend on changed values. This makes it
          ideal for complex UIs or components that require frequent updates.
        </p>
      </div>

      <div className="h-4" />

      <div className="mt-2 p-4 bg-red-50 border-l-4 border-red-500 rounded mb-4">
        <h3 className="text-base font-semibold text-red-700 mb-2 flex items-center">
          <TriangleAlert size={20} className="inline-block mr-2" />
          Warning: Missing Dependencies Example
        </h3>
        <p className="text-red-700">
          The component below demonstrates what happens when dependencies are
          missing. It's missing the total value in its dependency array, so
          price updates won't cause the component to update since the total
          calculation happens elsewhere. This also causes the total to lag
          behind by 1 total update
        </p>
      </div>

      <CartOverviewDepMissing />
    </div>
  );
};

function JSONView() {
  const cart = useCogsState("cart");

  return (
    <div>
      <pre>Cart: {JSON.stringify(cart.get(), null, 2)}</pre>
      <span className="text-gray-300">{cart._componentId}</span>
    </div>
  );
}

const CustomIdComponent = () => {
  const cart = useCogsState("cart", { componentId: "MyCustomComponentId" });

  return (
    <FlashWrapper
      color="bg-purple-500"
      componentId={cart._componentId!}
      title="MyCustomComponentId"
    >
      <CodeLine
        code={`    const cart = useCogsState("cart", { componentId: "MyCustomComponentId" });`}
      />
    </FlashWrapper>
  );
};

function ComponentList() {
  const cart = useCogsState("cart");
  const componentsData = cart.getComponents();

  // Check if componentsData exists and has a components property that is a Map
  const componentsMap = componentsData?.components;

  return (
    <>
      {" "}
      {componentsMap && componentsMap instanceof Map ? (
        <div className="space-y-2">
          {[...componentsMap.entries()].map(([componentId, componentData]) => (
            <button
              key={componentId}
              onClick={() => {
                if (
                  componentData &&
                  typeof componentData.forceUpdate === "function"
                ) {
                  componentData.forceUpdate();
                }
              }}
              className="block w-full text-left p-2 bg-amber-50 hover:bg-gray-100 rounded border border-amber-500 hover:border-amber-500 cursor-pointer"
            >
              {componentId.split("/").pop()}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 p-2">
          Components map not found or not iterable
        </div>
      )}
    </>
  );
}

const ComponentTriggers = () => {
  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-3">Components</h2>
      All the components that use some version fo the following hook will bne
      displayed here
      <CodeLine code={`  const cart = useCogsState("cart");`} />{" "}
      <div className="h-6" />
      This is list of all components registerd to the Cart state for this
      example. Not all of them have the rerender styling applied.{" "}
      <div className="h-2" />
      Click them to force a component re-render.
      <div className="h-1" />
      <div className="h-4" />
      <ComponentList />
      <div className="h-4" />{" "}
      <div>
        You can even add custom component Ids to components for easy reference
      </div>{" "}
      <div className="h-2" />
      <CustomIdComponent />
    </div>
  );
};

// Component Code View with colored blocks
const ComponentCodeView = () => {
  return (
    <div className="bg-white rounded-lg p-6 w-full space-y-8">
      These are minimal examples of the actual code.
      <div className="h-2" />
      {/* Fully Reactive */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <div className="rounded-full h-6 w-6 bg-gray-500" />
          Fully Reactive
        </h3>
        <div className="bg-gray-900 rounded-lg overflow-auto">
          <SyntaxHighlighter
            language="typescript"
            style={vscDarkPlus}
            customStyle={{
              width: "100%",
              margin: 0,
              fontSize: "0.9rem",
              borderLeft: "4px solid #6b7280", // Gray border
            }}
          >
            {fullyReactiveCode}
          </SyntaxHighlighter>
        </div>
      </div>
      {/* Component Reactive */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <div className="rounded-full h-6 w-6 bg-amber-400" />
          Component Reactive
        </h3>
        <div className="bg-gray-900 rounded-lg overflow-auto">
          <SyntaxHighlighter
            language="typescript"
            style={vscDarkPlus}
            customStyle={{
              width: "100%",
              margin: 0,
              fontSize: "0.9rem",
              borderLeft: "4px solid #f97316", // amber border
            }}
          >
            {componentReactiveCode}
          </SyntaxHighlighter>
        </div>
      </div>
      {/* Reactive Dependencies */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <div className="rounded-full h-6 w-6 bg-sky-500" />
          Reactive Dependencies
        </h3>
        <div className="bg-gray-900 rounded-lg overflow-auto">
          <SyntaxHighlighter
            language="typescript"
            style={vscDarkPlus}
            customStyle={{
              width: "100%",
              margin: 0,
              fontSize: "0.9rem",
              borderLeft: "4px solid #0ea5e9", // Sky blue border
            }}
          >
            {reactiveDepsCode}
          </SyntaxHighlighter>
        </div>
      </div>
      {/* Signal Based */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <div className="rounded-full h-6 w-6 bg-emerald-500" />
          Signal Based - $get()
        </h3>
        <div className="bg-gray-900 rounded-lg overflow-auto">
          <SyntaxHighlighter
            language="typescript"
            style={vscDarkPlus}
            customStyle={{
              width: "100%",
              margin: 0,
              fontSize: "0.9rem",
              borderLeft: "4px solid #10b981", // Emerald border
            }}
          >
            {signalBasedCode}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

function TabbedSection() {
  const [tab, setTab] = useState<
    "api" | "description" | "json" | "component" | "code"
  >("description");
  return (
    <div className=" flex flex-col gap-1">
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium cursor-pointer ${
            tab === "description"
              ? "text-blue-600 border-b-2 border-blue-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setTab("description")}
        >
          Description
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium cursor-pointer ${
            tab === "api"
              ? "text-blue-600 border-b-2 border-blue-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setTab("api")}
        >
          API
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium  cursor-pointer ${
            tab === "json"
              ? "text-blue-600 border-b-2 border-blue-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setTab("json")}
        >
          JSON
        </button>{" "}
        <button
          className={`px-4 py-2 text-sm font-medium  cursor-pointer ${
            tab === "component"
              ? "text-blue-600 border-b-2 border-blue-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setTab("component")}
        >
          Trigger Component Render
        </button>{" "}
        <button
          className={`px-4 py-2 text-sm font-medium  cursor-pointer ${
            tab === "code"
              ? "text-blue-600 border-b-2 border-blue-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setTab("code")}
        >
          Component Code
        </button>
      </div>{" "}
      {tab === "api" && <CartComponentsAPI />}
      {tab === "description" && <CartComponentsDescription />}
      {tab === "component" && <ComponentTriggers />}
      {tab === "json" && <JSONView />}
      {tab === "code" && <ComponentCodeView />}
    </div>
  );
}

// Modified App component with code toggles
export default function ReactiveMain() {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="h-6" />
      <div className="w-[90%]">
        <div className="w-full bg-sky-50 rounded-lg p-6 flex flex gap-4">
          <div className="bg-white rounded-lg p-6 flex-1 flex gap-4">
            {" "}
            <TabbedSection />
          </div>{" "}
          <div className="w-[50%] ">
            <div className="grid grid-cols-2 gap-4  ">
              <div className="col-span-2">
                <ProductList />
              </div>
              <CartOverviewFully />

              <CartOverviewGet />
              <CartOverviewDep />
              <CartOverview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
