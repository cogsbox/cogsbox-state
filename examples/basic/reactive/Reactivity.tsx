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
        <div className="grid grid-cols-2 gap-4">
          <ToggleState options={{ reactiveType: "component" }} />
          <ToggleState
            options={{
              reactiveType: "deps",
              reactiveDeps: (state: StateExampleObject["fooBarObject"]) => [
                state.foo,
              ],
            }}
          />
          <ToggleState options={{ reactiveType: "all" }} />
          <ToggleState options={{ reactiveType: "none" }} isSignal={true} />
        </div>
        <ShowState />
      </div>
    </div>
  );
}

function ToggleState({
  options,
  isSignal = false,
}: {
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

  const displayString = `// ${
    isSignal ? `Signal Version ($Get)` : `Standard Version`
  }
const fooState = useCogsState(
  "fooBarObject",
  ${formatOptions(options)}
);

// Getter:
${!isSignal ? "fooState.foo.get()" : "fooState.foo.$get()"}`;

  return (
    <FlashWrapper>
      <div className="bg-gray-300 p-4 rounded flex flex-col gap-2 shadow-sm">
        {fooState._componentId}{" "}
        <SyntaxHighlighter
          language="javascript"
          style={atomOneDark}
          customStyle={{
            margin: 0,
            height: "260px",
            fontSize: "14px",
            borderRadius: "4px",
          }}
          showLineNumbers={false}
          wrapLines={true}
          wrapLongLines={true}
        >
          {displayString}
        </SyntaxHighlighter>
        <div className="flex gap-2 items-center w-64">
          <button
            className="border rounded border-white hover:bg-amber-400 cursor-pointer bg-amber-400 text-white px-2 py-1"
            onClick={() =>
              fooState.foo.update((s) => (s === "baz" ? "bar" : "baz"))
            }
          >
            Toggle
          </button>
          <div className="flex-1">
            {!isSignal ? fooState.foo.get() : fooState.foo.$get()}
          </div>
        </div>
      </div>
    </FlashWrapper>
  );
}

function ShowState() {
  const fooState = useCogsState("fooBarObject", { reactiveType: ["all"] });

  return (
    <div className="mt-4 p-4 bg-gray-100 rounded shadow">
      <pre>{JSON.stringify(fooState.get(), null, 2)}</pre>
    </div>
  );
}
