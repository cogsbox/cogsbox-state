"use client";

import type { ReactivityType } from "@lib/CogsState";
import { FlashWrapper } from "./FlashOnUpdate";
import { useCogsState } from "./state";

export default function Reactivity() {
  return (
    <div className="flex flex-col gap-2 items-center justify-center p-12">
      <h1 className="text-2xl font-bold">Reactivity Example</h1>
      <div className="flex gap-4">
        <ToggleState reactiveType="deps" />
        <ToggleState reactiveType="all" />
        <ToggleState reactiveType="none" />
      </div>
      <ShowState />
    </div>
  );
}

function ToggleState({
  reactiveType = ["deps", "component"],
}: {
  reactiveType: ReactivityType;
}) {
  const fooState = useCogsState("fooBarObject", { reactiveType });
  console.log("fooState---", fooState.foo.get());
  return (
    <FlashWrapper>
      <div className="flex gap-2 items-center w-64">
        <button
          className="border rounded border-white hover:bg-amber-400 cursor-pointer bg-amber-400 text-white px-2  py-1"
          onClick={() =>
            fooState.foo.update((s) => {
              console.log("Updating bbbbbbbbbbbbbbbbbbbbb foo from", s);
              return s === "baz" ? "bar" : "baz";
            })
          }
        >
          Toggle
        </button>
        <div className="flex-1">{fooState.foo.get()}</div>
      </div>
    </FlashWrapper>
  );
}

function ShowState() {
  const fooState = useCogsState("fooBarObject", { reactiveType: ["all"] });
  console.log("fooState---", fooState.get());
  return (
    <div className="mt-4 p-4 bg-gray-100 rounded shadow">
      <pre>{JSON.stringify(fooState.get(), null, 2)}</pre>
    </div>
  );
}
