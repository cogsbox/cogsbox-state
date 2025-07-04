"use client";

import type { OptionsType, StateObject } from "../../../src/CogsState";
import { type StateExampleObject, useCogsState } from "./state";

import React, { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import stringify from "stringify-object";
import DotPattern from "../DotWrapper";
import { FlashWrapper } from "../FlashOnUpdate";

// Define the structure for our tabs
const TABS = {
  component: { id: "component", title: "Component Reactivity (Default)" },
  deps: { id: "deps", title: "Dependency-Based" },
  all: { id: "all", title: "Entire State" },
  none: { id: "none", title: "Signal-Based (None)" },
};
type TabId = keyof typeof TABS;

// --- Main Page Component ---
export default function ReactivityPage() {
  const [activeTab, setActiveTab] = useState<TabId>("component");
  const fooState = useCogsState("fooBarObject", { reactiveType: "none" });

  return (
    <>
      <div className="flex gap-6 text-green-400  p-6 font-mono">
        {/* --- LEFT COLUMN (Interactive Examples) --- */}{" "}
        <div className="w-3/5 flex flex-col ">
          <DotPattern>
            <div className="px-8 py-4">
              <h1 className="text-2xl font-bold text-gray-200 ">
                Reactivity Types
              </h1>
              <p className="text-sm text-gray-200 max-w-2xl">
                Cogs offers several strategies to control when components
                re-render. Select a tab to see how each strategy works. Click
                the "Toggle" buttons and watch which components flash,
                indicating a re-render.
              </p>
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-700 bg-gray-900/90 rounded-px-2 py-1">
                {Object.values(TABS).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabId)}
                    className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 -mb-px cursor-pointer bg-green-200/30
                  ${
                    activeTab === tab.id
                      ? "border-b-2 border-green-400 text-green-300"
                      : "text-gray-300 hover:text-green-400 border-b-2 border-transparent"
                  }`}
                  >
                    {tab.title}
                  </button>
                ))}{" "}
              </div>
            </div>
          </DotPattern>
          {/* Tab Content Area */}
          <div className="pl-6">
            {activeTab === "component" ? (
              <ComponentReactivityExample />
            ) : activeTab === "deps" ? (
              <DepsReactivityExample />
            ) : activeTab === "all" ? (
              <AllReactivityExample />
            ) : activeTab === "none" ? (
              <SignalReactivityExample />
            ) : null}
          </div>{" "}
        </div>
        {/* --- RIGHT COLUMN (Controls & Global State) --- */}
        <div className="w-2/5 flex flex-col gap-4 sticky top-6 ">
          <div className="h-40" />{" "}
          <h2 className="text-lg font-bold text-gray-300">Controls</h2>
          <div className="flex flex-wrap gap-2">
            <button
              className="px-3 py-1 bg-green-900/80 border border-green-300/70 text-green-200 rounded hover:bg-green-800 text-sm cursor-pointer"
              onClick={() =>
                fooState.foo.update((s) => (s === "baz" ? "bar" : "baz"))
              }
            >
              Toggle root 'foo'
            </button>
            <button
              className="px-3 py-1 bg-green-900/80 border border-green-300/70 text-green-200 rounded hover:bg-green-800 text-sm cursor-pointer"
              onClick={() =>
                fooState.nested.foo.update((s) => (s === "baz" ? "bar" : "baz"))
              }
            >
              Toggle 'nested.foo'
            </button>
            <button
              className="px-3 py-1 bg-green-900/80 border border-green-300/70 text-green-200 rounded hover:bg-green-800 text-sm cursor-pointer"
              onClick={() =>
                fooState.seperateNested.foo.update((s) =>
                  s === "baz" ? "bar" : "baz"
                )
              }
            >
              Toggle 'seperateNested.foo'
            </button>
          </div>
          <ReactivityExplanation />
          <ShowState />
        </div>
      </div>
    </>
  );
}

// --- Example Components for Each Tab ---

function ComponentReactivityExample() {
  return (
    <ExampleDisplay
      title="Component Reactivity (Default)"
      description="This is the default. The component re-renders only if the specific state values it calls with .get() are updated."
      options={{ reactiveType: "component" }}
    />
  );
}

function DepsReactivityExample() {
  return (
    <ExampleDisplay
      title="Dependency-Based Reactivity"
      description="The component re-renders only when the specific values returned by the reactiveDeps function change."
      options={{
        reactiveType: "deps",
        reactiveDeps: (state: StateExampleObject["fooBarObject"]) => [
          state.foo,
          state.nested.foo,
        ],
      }}
      nestedOptions={{
        reactiveType: "deps",
        reactiveDeps: (state: StateExampleObject["fooBarObject"]) => [
          state.seperateNested.foo,
        ],
      }}
    />
  );
}

function AllReactivityExample() {
  return (
    <ExampleDisplay
      title="Entire State Reactive"
      description="This component re-renders if *any* part of the 'fooBarObject' state slice changes, even properties it doesn't use."
      options={{ reactiveType: "all" }}
    />
  );
}

function SignalReactivityExample() {
  return (
    <ExampleDisplay
      title="Signal-Based Reactivity"
      description="With reactiveType: 'none', the React component *never* re-renders from state changes. Use signals (.$get()) for fine-grained, direct-to-DOM updates."
      options={{ reactiveType: "none" }}
      isSignal={true}
    />
  );
}

// --- Generic Display Component (replaces ToggleState) ---

function ExampleDisplay({
  title,
  description,
  options,
  nestedOptions,
  isSignal = false,
}: {
  title: string;
  description: string;
  options: OptionsType<StateExampleObject["fooBarObject"]>;
  nestedOptions?: OptionsType<StateExampleObject["fooBarObject"]>;
  isSignal?: boolean;
}) {
  const fooState = useCogsState("fooBarObject", options);
  const finalNestedOptions = nestedOptions || options;

  const formatOptions = (opts: any) => {
    if (opts.reactiveType === "deps") {
      if (opts.reactiveDeps.toString().includes("seperateNested.foo")) {
        return `{ reactiveType: "deps", reactiveDeps: (s) => [s.seperateNested.foo] }`;
      }
      return `{ reactiveType: "deps", reactiveDeps: (s) => [s.foo, s.nested.foo] }`;
    }
    return stringify(opts, { indent: "  ", singleQuotes: false });
  };

  const displayString = `const state = useCogsState( "fooBarObject", ${formatOptions(
    options
  )} );`;
  const getterString = `// Renders: ${
    isSignal ? "state.foo.$get()" : "state.foo.get()"
  }`;

  return (
    <FlashWrapper>
      <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-4 flex flex-col gap-4 h-full min-h-[600px]">
        <div>
          <h3 className="font-bold text-gray-200 text-lg">{title}</h3>
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        </div>
        <div className="flex-grow overflow-auto bg-black/30 rounded p-1">
          <SyntaxHighlighter
            language="javascript"
            style={atomOneDark}
            customStyle={{
              backgroundColor: "transparent",
              fontSize: "12px",
              padding: "0.5rem",
            }}
            codeTagProps={{ style: { fontFamily: "inherit" } }}
          >
            {`${displayString}\n${getterString}`}
          </SyntaxHighlighter>
        </div>
        <div className="flex gap-2 items-center w-full mt-1 bg-gray-800 p-2 px-8 justify-between rounded border border-gray-700">
          <span className="text-gray-400 text-lg ">root</span>
          <span className=" text-lg  text-green-300 font-semibold">
            {!isSignal ? fooState.foo.get() : fooState.foo.$get()}
          </span>
        </div>
        <NestedFoo nestedFoo={fooState.nested.foo} isSignal={isSignal} />
        <NestedFooInstance options={finalNestedOptions} isSignal={isSignal} />
      </div>
    </FlashWrapper>
  );
}

// --- Helper & Display Components (Mostly Unchanged) ---

function NestedFoo({
  nestedFoo,
  isSignal,
}: {
  nestedFoo: StateObject<StateExampleObject["fooBarObject"]["nested"]["foo"]>;
  isSignal?: boolean;
}) {
  return (
    <FlashWrapper>
      {/* CHANGE: Replaced transparent bg-black/20 with solid bg-gray-900 for better contrast. */}
      <div className="flex gap-2 w-full justify-between items-center p-2 rounded bg-gray-900">
        {/* CHANGE: Used a darker, solid background for the label for improved readability. */}
        <div className="p-1 px-2 rounded bg-gray-700 text-gray-200 text-xs uppercase font-semibold">
          nested.foo
        </div>
        <div className="p-1 px-4 text-green-400 font-semibold">
          {!isSignal ? nestedFoo.get() : nestedFoo.$get()}
        </div>
      </div>
    </FlashWrapper>
  );
}

function NestedFooInstance({
  options,
  isSignal,
}: {
  options: OptionsType<StateExampleObject["fooBarObject"]>;
  isSignal?: boolean;
}) {
  const nestedFooState = useCogsState("fooBarObject", options);

  const formatOptions2 = (opts: any) => {
    if (
      opts.reactiveType === "deps" &&
      opts.reactiveDeps?.toString().includes("state.seperateNested.foo")
    ) {
      return `{ reactiveType: "deps", reactiveDeps: (s) => [s.seperateNested.foo] }`;
    }
    return stringify(opts, { indent: "  ", singleQuotes: false });
  };

  const displayString = `// In a separate component...\nconst nestedState = useCogsState(\n  "fooBarObject",\n  ${formatOptions2(
    options
  )}\n);`;

  return (
    <FlashWrapper>
      <div className="flex flex-col gap-3 w-full border-t border-gray-700/50 pt-3">
        {/* CHANGE: Replaced transparent bg-black/30 with a solid, very dark gray for the code block. */}
        <div className="overflow-auto bg-gray-950 rounded p-1 text-xs">
          <SyntaxHighlighter
            language="javascript"
            style={atomOneDark}
            customStyle={{
              backgroundColor: "transparent",
              fontSize: "11px",
              padding: "0.5rem",
            }}
            codeTagProps={{ style: { fontFamily: "inherit" } }}
          >
            {displayString}
          </SyntaxHighlighter>
        </div>
        {/* CHANGE: Replaced transparent bg-black/20 with solid bg-gray-900, matching NestedFoo. */}
        <div className="flex gap-2 w-full justify-between items-center p-2 rounded bg-gray-900">
          {/* CHANGE: Matched the label style from NestedFoo for consistency and readability. */}
          <div className="p-1 px-2 rounded bg-gray-700 text-gray-200 text-xs uppercase font-semibold">
            seperateNested.foo
          </div>
          <div className="p-1 px-4 text-green-400 font-semibold">
            {!isSignal
              ? nestedFooState.seperateNested.foo.get()
              : nestedFooState.seperateNested.foo.$get()}
          </div>
        </div>
      </div>
    </FlashWrapper>
  );
}

function ReactivityExplanation() {
  const Type = ({ children }: { children: React.ReactNode }) => (
    <code className="bg-gray-700 text-green-300 font-semibold px-1 rounded text-xs">
      {children}
    </code>
  );
  return (
    <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-4 text-gray-400">
      <h2 className="text-gray-200 font-bold text-base mb-3">
        Reactivity Guide
      </h2>
      <dl className="space-y-3 text-sm">
        <div>
          <dt>
            <Type>component</Type>
          </dt>
          <dd className="ml-4 mt-1 text-gray-500">
            Re-renders if state used via <Type>.get()</Type> is updated.
            Smartest option.
          </dd>
        </div>
        <div>
          <dt>
            <Type>deps</Type>
          </dt>
          <dd className="ml-4 mt-1 text-gray-500">
            Re-renders if values from <Type>reactiveDeps</Type> change.
          </dd>
        </div>
        <div>
          <dt>
            <Type>all</Type>
          </dt>
          <dd className="ml-4 mt-1 text-gray-500">
            Re-renders if *any* part of the state slice changes.
          </dd>
        </div>
        <div>
          <dt>
            <Type>none</Type>
          </dt>
          <dd className="ml-4 mt-1 text-gray-500">
            Never re-renders. Use with signals (<Type>$get()</Type>) for
            DOM-only updates.
          </dd>
        </div>
      </dl>
    </div>
  );
}

function ShowState() {
  const fooState = useCogsState("fooBarObject", { reactiveType: "all" });
  return (
    <FlashWrapper>
      <div className="flex-1 flex flex-col bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-3 overflow-hidden">
        <h3 className="text-gray-300 uppercase tracking-wider text-xs pb-2 mb-2 border-b border-gray-700">
          Live Global State
        </h3>
        <pre className="text-xs overflow-auto flex-grow text-gray-300">
          {JSON.stringify(fooState.get(), null, 2)}
        </pre>
      </div>
    </FlashWrapper>
  );
}
