import { describe, it } from "vitest";
import { expectTypeOf } from "expect-type";
import { renderHook } from "@testing-library/react";
import { createCogsState, type StateObject } from "../src/CogsState";
import { createPluginContext } from "../src/plugins";

describe("plugin return types", () => {
  it("infers StateObject for plugin initialState keys", () => {
    const { createPlugin } = createPluginContext();
    const taskManagerPlugin = createPlugin("taskManager").initialState(() => ({
      tasks: [] as Array<{ id: number; title: string; done: boolean }>,
      filter: "all" as string,
    }));

    const { useCogsState } = createCogsState({}, { plugins: [taskManagerPlugin] });
    const { result } = renderHook(() => useCogsState("tasks"));

    expectTypeOf(result.current).toEqualTypeOf<
      StateObject<Array<{ id: number; title: string; done: boolean }>>
    >();
    expectTypeOf(result.current).not.toBeAny();
  });
});
