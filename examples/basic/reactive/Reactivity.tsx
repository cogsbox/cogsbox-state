"use client";

import type { OptionsType, StateObject } from "../../../src/CogsState";
import { FlashWrapper } from "../FlashOnUpdate";
import { type StateExampleObject, useCogsState } from "./state";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import stringify from "stringify-object";

export default function Reactivity() {
  const fooState = useCogsState("fooBarObject", { reactiveType: "none" });
  return (
    // Main container creating the two-column layout and setting the retro theme
    <div className="flex gap-4  text-green-400 min-h-screen p-4">
      {/* --- LEFT COLUMN --- */}
      <div className="w-3/5 flex flex-col gap-3">
        <h1 className="text-xl font-bold text-gray-300">Reactivity Types</h1>
        <p className="text-sm text-gray-500 mb-2">
          Explore different reactivity strategies and see when each component
          re-renders.
        </p>

        {/* Grid for the interactive examples */}
        <div className="grid grid-cols-2 gap-4">
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
      </div>

      {/* --- RIGHT COLUMN --- */}
      <div className="w-2/5 flex flex-col gap-4">
        <div className="h-20" />{" "}
        <button
          className="px-3 py-1 bg-green-900 text-green-200 rounded hover:bg-green-800 text-sm cursor-pointer"
          onClick={() =>
            fooState.foo.update((s) => (s === "baz" ? "bar" : "baz"))
          }
        >
          Toggle Foo
        </button>{" "}
        <button
          className="px-3 py-1 bg-green-900 text-green-200 rounded hover:bg-green-800 text-sm cursor-pointer"
          onClick={() =>
            fooState.nested.foo.update((s) => (s === "baz" ? "bar" : "baz"))
          }
        >
          Toggle Nested Foo
        </button>
        <ReactivityExplanation />
        <ShowState />
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
    });
  };

  const displayString = `const fooState = useCogsState(
  "fooBarObject",
  ${formatOptions(options)}
);
// Getter:
${!isSignal ? "fooState.foo.get()" : "fooState.foo.$get()"}`;
  console.log(fooState.nested.foo.get());
  return (
    <FlashWrapper>
      <div className="bg-[#1a1a1a] border border-gray-700 rounded p-3 flex flex-col gap-3 h-full">
        <h3 className="font-bold text-gray-200 text uppercase tracking-wider">
          {title}
        </h3>
        <span className="text-xs text-gray-500 -mt-2">
          ID: {fooState._componentId}
        </span>
        <div className="flex-grow overflow-auto bg-gray-900/50 rounded p-1">
          <SyntaxHighlighter
            language="javascript"
            style={atomOneDark}
            customStyle={{
              backgroundColor: "transparent",
              fontSize: "12px",
              height: "100%",
              padding: "0.5rem",
            }}
            codeTagProps={{ style: { fontFamily: "inherit" } }}
          >
            {displayString}
          </SyntaxHighlighter>
        </div>

        <div className="flex gap-2 items-center w-full mt-1">
          <div className="flex-1 text-base bg-gray-800 p-1 rounded border border-gray-700 text-center">
            {!isSignal ? fooState.foo.get() : fooState.foo.$get()}
          </div>
        </div>
        <NestedFoo
          nestedFoo={fooState.nested.foo}
          isSignal={isSignal}
          foo={fooState.nested.foo.get()}
        />
      </div>
    </FlashWrapper>
  );
}

function NestedFoo({
  nestedFoo,
  foo,
  isSignal,
}: {
  nestedFoo: StateObject<StateExampleObject["fooBarObject"]["nested"]["foo"]>;
  foo: String;

  isSignal?: boolean;
}) {
  return (
    <FlashWrapper>
      <div className="flex gap-2 w-full">
        <div className="flex w-full">
          <div className="w-1/3 p-1 px-4  bg-gray-800 text-green-500 rounded">
            Nested: {!isSignal ? nestedFoo.get() : nestedFoo.$get()}
            {foo}
          </div>
        </div>
      </div>
    </FlashWrapper>
  );
}
function ReactivityExplanation() {
  const Type = ({ children }: { children: React.ReactNode }) => (
    <code className="bg-gray-700 text-green-300 font-semibold px-1 py-0.5 rounded text-xs">
      {children}
    </code>
  );

  return (
    <div className="bg-[#1a1a1a] border border-gray-700 rounded p-3 text-gray-400">
      <h2 className="text-gray-300 font-bold text-base mb-3">
        Understanding Reactivity Types
      </h2>
      <p className=" mb-4">
        Cogs offers several strategies to control when components re-render,
        helping optimize performance.
      </p>
      <dl className="space-y-3 text-sm">
        <div>
          <dt>
            <Type>component</Type> (Default)
          </dt>
          <dd className="ml-4 mt-1 text-gray-500">
            Re-renders only if state used via <Type>.get()</Type> in the
            component is updated. Smartest and most common option.
          </dd>
        </div>
        <div>
          <dt>
            <Type>deps</Type>
          </dt>
          <dd className="ml-4 mt-1 text-gray-500">
            Re-renders only if values from the <Type>reactiveDeps</Type>{" "}
            function change. Useful for complex conditions.
          </dd>
        </div>
        <div>
          <dt>
            <Type>all</Type>
          </dt>
          <dd className="ml-4 mt-1 text-gray-500">
            Re-renders if *any* part of the state slice changes, even unused
            parts. Use sparingly.
          </dd>
        </div>
        <div>
          <dt>
            <Type>none</Type>
          </dt>
          <dd className="ml-4 mt-1 text-gray-500">
            **Never** re-renders from state changes. Ideal for action-only
            components or when using signals (<Type>$get()</Type>) for DOM-only
            updates.
          </dd>
        </div>
      </dl>
    </div>
  );
}

function ShowState() {
  // Use 'all' to ensure this component always shows the latest state
  const fooState = useCogsState("fooBarObject", { reactiveType: "all" });

  return (
    <FlashWrapper>
      <div className="flex-1 flex flex-col bg-[#1a1a1a] border border-gray-700 rounded p-3 overflow-hidden">
        <h3 className="text-gray-400 uppercase tracking-wider text-xs pb-2 mb-2 border-b border-gray-700">
          Live Global State
        </h3>
        <pre className="text-xs overflow-auto flex-grow">
          {JSON.stringify(fooState.get(), null, 2)}
        </pre>
      </div>
    </FlashWrapper>
  );
}
