import { createCogsState, type StateObject } from '../src/CogsState';
import { createPluginContext } from '../src/plugins';

function testPluginOnlyInitialState() {
  const { createPlugin } = createPluginContext();
  const taskManagerPlugin = createPlugin('taskManager').initialState(() => ({
    tasks: [] as Array<{ id: number; title: string; done: boolean }>,
    filter: 'all' as string,
  }));
  const { useCogsState } = createCogsState(
    {},
    { plugins: [taskManagerPlugin] }
  );

  const tasks: StateObject<
    Array<{ id: number; title: string; done: boolean }>
  > = useCogsState('tasks');

  return tasks;
}

function testUserOverridesPlugin() {
  const { createPlugin } = createPluginContext();
  const formPlugin = createPlugin('formPrefs').initialState(() => ({
    theme: 'dark',
    fontSize: 14,
  }));
  const { useCogsState } = createCogsState(
    { theme: 'light' as const },
    { plugins: [formPlugin] }
  );

  const theme: StateObject<'light'> = useCogsState('theme');
  const fontSize: StateObject<number> = useCogsState('fontSize');

  return { theme, fontSize };
}

export { testPluginOnlyInitialState, testUserOverridesPlugin };
