import { expectTypeOf } from "expect-type";
import { createCogsState, createPluginContext, type StateObject } from "./src/CogsState";

const { createPlugin } = createPluginContext();
const taskManagerPlugin = createPlugin("taskManager").initialState(() => ({
  tasks: [] as Array<{ id: number; title: string; done: boolean }>,
  filter: "all" as string,
}));
const { useCogsState } = createCogsState({}, { plugins: [taskManagerPlugin] });
const test = useCogsState("tasks");

expectTypeOf(test).toEqualTypeOf<
  StateObject<Array<{ id: number; title: string; done: boolean }>>
>();
expectTypeOf(test).not.toBeAny();
