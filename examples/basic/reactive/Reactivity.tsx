"use client";

import type { OptionsType, ReactivityType } from "@lib/CogsState";
import { FlashWrapper } from "../FlashOnUpdate";
import { type StateExampleObject, useCogsState } from "./state";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import stringify from "stringify-object";

export default function Reactivity() {
  return (
    <div className="p-12">
      <h1 className="text-2xl font-bold mb-6">Reactivity Example</h1>
      <div className="flex gap-8 items-start">
        <div className="flex-1 grid grid-cols-2 gap-4">
          <ToggleState
            options={{ reactiveType: "component" }}
            title="Component Reactivity"
          />
          <ToggleState
            options={{
              reactiveType: "deps",
              reactiveDeps: (state: StateExampleObject["fooBarObject"]) => [
                state.foo,
              ],
            }}
            title="Dependency-Based Reactivity"
          />
          <ToggleState
            options={{ reactiveType: "all" }}
            title="Entire State Reactive"
          />
          <ToggleState
            options={{ reactiveType: "none" }}
            isSignal={true}
            title="Signal-Based Reactivity"
          />
        </div>
        <div className="flex-1">
          <ReactivityExplanation />
          <ShowState />
        </div>
      </div>
    </div>
  );
}

function ToggleState({
  title,
  options,
  isSignal = false,
}: {
  title?: string;
  options: OptionsType<StateExampleObject["fooBarObject"]>;
  isSignal?: boolean;
}) {
  const fooState = useCogsState("fooBarObject", options);

  // Create a cleaner display version
  const formatOptions = (opts: any) => {
    if (opts.reactiveType === "deps" && opts.reactiveDeps) {
      return `{
  reactiveType: "deps",
  reactiveDeps: (state) => [state.foo]
}`;
    }
    return stringify(opts, {
      indent: "  ",
      singleQuotes: false,
      transform: (obj: any, prop, originalResult) => {
        if (typeof obj[prop] === "function") {
          return originalResult.replace(/\n\s+/g, "\n    ");
        }
        return originalResult;
      },
    });
  };

  const displayString = `const fooState = useCogsState(
  "fooBarObject",
  ${formatOptions(options)}
);
// Getter:
${!isSignal ? "fooState.foo.get()" : "fooState.foo.$get()"}`;

  return (
    <FlashWrapper>
      <div className="bg-white border rounded-lg p-4 flex flex-col gap-3 shadow-sm">
        <span className="font-semibold text-lg">{title}</span>
        <span className="text-xs text-gray-500 -mt-2">
          ID: {fooState._componentId}
        </span>
        <SyntaxHighlighter
          language="javascript"
          style={atomOneDark}
          customStyle={{
            margin: 0,
            height: "200px",
            fontSize: "13px",
            borderRadius: "4px",
          }}
          showLineNumbers={false}
          wrapLines={true}
          wrapLongLines={true}
        >
          {displayString}
        </SyntaxHighlighter>
        <div className="flex gap-2 items-center w-full mt-2">
          <button
            className="border rounded border-blue-500 hover:bg-blue-600 bg-blue-500 text-white px-4 py-1 text-sm font-medium cursor-pointer"
            onClick={() =>
              fooState.foo.update((s) => (s === "baz" ? "bar" : "baz"))
            }
          >
            Toggle Foo
          </button>
          <div className="flex-1 text-lg font-mono bg-gray-100 p-1 rounded">
            {!isSignal ? fooState.foo.get() : fooState.foo.$get()}
          </div>
        </div>
      </div>
    </FlashWrapper>
  );
}

// --- NEW COMPONENT ---
function ReactivityExplanation() {
  const Type = ({ children }: { children: React.ReactNode }) => (
    <code className="bg-gray-200 text-gray-800 font-semibold px-1.5 py-0.5 rounded text-sm">
      {children}
    </code>
  );

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm mb-4 prose prose-sm max-w-none">
      <h2 className="text-xl font-bold">Understanding Reactivity Types</h2>
      <p>
        Cogs offers several reactivity strategies to give you fine-grained
        control over when your components re-render. This helps optimize
        performance by avoiding unnecessary updates.
      </p>
      <dl className="mt-4 space-y-3">
        <div>
          <dt>
            <Type>component</Type> (Default)
          </dt>
          <dd className="ml-4">
            The component will only re-render if a piece of state that is
            explicitly used (via <Type>.get()</Type>) within its render function
            is updated. This is the smartest and most common option.
          </dd>
        </div>
        <div>
          <dt>
            <Type>deps</Type>
          </dt>
          <dd className="ml-4">
            The component will only re-render if the values returned by the{" "}
            <Type>reactiveDeps</Type> function change. This is similar to
            React's `useEffect` dependency array and is useful for complex
            conditions.
          </dd>
        </div>
        <div>
          <dt>
            <Type>all</Type>
          </dt>
          <dd className="ml-4">
            The component will re-render whenever *any* part of the state slice
            changes, even if the changed data is not used in the component. Use
            this sparingly.
          </dd>
        </div>
        <div>
          <dt>
            <Type>none</Type>
          </dt>
          <dd className="ml-4">
            The component will **never** re-render in response to state changes.
            This is ideal for components that only perform actions (like
            buttons) or when using signals (<Type>$get()</Type>) for
            hyper-granular, DOM-only updates.
          </dd>
        </div>
      </dl>
    </div>
  );
}

function ShowState() {
  const fooState = useCogsState("fooBarObject", { reactiveType: ["all"] });

  return (
    <div className="p-4 bg-gray-800 text-gray-100 rounded-lg shadow-inner font-mono text-xs">
      <h3 className="text-gray-400 font-semibold mb-2 text-sm">
        Live Global State:
      </h3>
      <pre>{JSON.stringify(fooState.get(), null, 2)}</pre>
    </div>
  );
}
