# Plugins — How To Guide

Plugins let you extend cogsbox-state without changing the core library. Use them when you want reusable behaviour — validation, uploads, default state, field wrappers, analytics — that plugs into the state lifecycle.

This guide shows how to build and wire up plugins. For chain method helpers (`path`, `array`, etc.), see the **Plugin Chain Methods** section in [README.md](./README.md).

---

## 1. Create a plugin

Use `createPluginContext` and chain the hooks you need:

```ts
import { createPluginContext } from 'cogsbox-state';
import { z } from 'zod';

const { createPlugin } = createPluginContext({
  options: z.object({
    multiplier: z.number(),
  }),
});

export const scalePlugin = createPlugin('scale')
  .useHook((params) => {
    return { factor: params.options.multiplier * 10 };
  })
  .transformState((params) => {
    if (params.isInitialTransform && params.hookData) {
      params.initialiseState({ value: params.hookData.factor });
    }
  });
```

You can chain any of these (in any order, each once):

| Method | Use when… |
|--------|-----------|
| `.initialState()` | The plugin should contribute default state keys |
| `.useHook()` | You need a React hook (fetch data, subscriptions, etc.) |
| `.transformState()` | Options change and you need to reshape state |
| `.onUpdate()` | You want to react to every state write |
| `.onFormUpdate()` | You want to react to focus/blur/input on form fields |
| `.formWrapper()` | You want to wrap rendered form elements |
| `.methods()` | You want custom chain methods on state nodes |

Options and metadata schemas are optional — skip them for plugins that don't need config.

---

## 2. Register the plugin

Pass plugins when you create state:

```ts
const { useCogsState } = createCogsState(initialState, {
  plugins: [scalePlugin],
});
```

### Contributing default state

If your plugin defines `.initialState()`, its keys are merged in at setup time. **Your `initialState` argument always wins** on conflicts:

```ts
const counterPlugin = createPlugin('counter').initialState(() => ({
  count: 0,
}));

// Plugin provides `count`
createCogsState({}, { plugins: [counterPlugin] });

// User override wins — count starts at 100
createCogsState({ count: 100 }, { plugins: [counterPlugin] });
```

Plugin-only keys (like `filter` below) are still added even when you pass partial state:

```ts
const taskPlugin = createPlugin('tasks').initialState(() => ({
  tasks: [] as Todo[],
  filter: 'all',
}));

createCogsState({ theme: 'dark' }, { plugins: [taskPlugin] });
// → { theme: 'dark', tasks: [], filter: 'all' }
```

---

## 3. Pass plugin options

Options are keyed by the plugin's `name`. Pass them from `useCogsState` or `setCogsOptionsByKey`:

```ts
const counter = useCogsState('counter', {
  scale: { multiplier: 5 },
});
```

Or set them later:

```ts
setCogsOptionsByKey('counter', {
  scale: { multiplier: 5 },
});
```

---

## 4. Wrap your app with `PluginRunner`

Plugins that use `.useHook()` need `PluginRunner` so hooks actually run:

```tsx
import { PluginRunner } from 'cogsbox-state';

function App() {
  return (
    <PluginRunner>
      <MyForm />
    </PluginRunner>
  );
}
```

Each `(stateKey, plugin)` pair gets its own instance inside the runner.

---

## 5. Common recipes

### React side-effects with `useHook`

Run setup/teardown once per state key. Return anything you want available in later hooks:

```ts
createPlugin('analytics')
  .useHook(() => {
    const client = createAnalyticsClient();
    useEffect(() => () => client.flush(), []);
    return { client };
  })
  .onUpdate((params) => {
    params.hookData?.client.track('state-change', params.update);
  });
```

### Transform state when options change

`transformState` runs when plugin options change (and once on mount). Use `isInitialTransform` to distinguish first run:

```ts
createPlugin('seed')
  .transformState((params) => {
    if (params.isInitialTransform) {
      params.initialiseState({ items: params.options.defaultItems });
    }
  });
```

Inside any hook you also get state helpers: `getState()`, `initialiseState()`, `initialiseShadowState()`, `applyOperation()`, `addZodErrors()`, and DOM helpers like `setFieldDisabled()`.

### React to state updates

```ts
createPlugin('logger')
  .onUpdate((params) => {
    console.log(params.update.path, params.update.oldValue, '→', params.update.newValue);
  });
```

### Validate on blur

`onFormUpdate` receives form activity events. Blur is the usual trigger for field validation:

```ts
createPlugin('validator')
  .onFormUpdate((params) => {
    if (params.event.activityType !== 'blur') return;

    const result = mySchema.safeParse(params.getState());
    if (!result.success) {
      params.addZodErrors(
        result.error.issues.map((i) => ({
          path: i.path.map(String),
          message: i.message,
          code: i.code,
        }))
      );
    }
  });
```

### Cross-field validation (shape-style)

When one field's error depends on others, validate the full state but only surface errors for the blurred field and its related fields:

```ts
createPlugin('shapeValidator')
  .onFormUpdate((params) => {
    if (params.event.activityType !== 'blur') return;

    const path = params.event.path;
    const fieldName = path[path.length - 1];
    const { schema, fieldToGroup, groups } = params.options;

    const affectedGroups = fieldToGroup[fieldName] ?? [];
    const relatedFields = new Set<string>();
    for (const g of affectedGroups) {
      for (const dep of groups[g].deps) relatedFields.add(dep);
    }

    const result = schema.safeParse(params.getState());
    if (!result.success) {
      const errors = result.error.issues
        .filter((i) => {
          const issueField = String(i.path[0]);
          return issueField === fieldName || relatedFields.has(issueField);
        })
        .map((i) => ({
          path: i.path.map(String),
          message: i.message,
          code: i.code,
        }));

      if (errors.length) params.addZodErrors(errors);
    }
  });
```

The core library doesn't know about schemas — it just forwards the event and applies whatever errors you return.

### Wrap form fields

Use `.formWrapper()` on the plugin, or set it dynamically via options:

```ts
// On the plugin
createPlugin('highlight').formWrapper((params) => (
  <div className="highlighted-field">{params.element}</div>
));

// Or dynamically
setCogsOptionsByKey('myForm', {
  formElements: {
    highlight: (params) => <div className="highlighted-field">{params.element}</div>,
  },
});
```

### Add chain methods

Use `.methods()` to attach actions to state nodes. See [README.md](./README.md#plugin-chain-methods) for the full `path` / `array` / `object` API.

```ts
const s3Plugin = createPlugin('s3')
  .methods(({ array }) => ({
    uploadAll: array(async (ctx, bucket: string) => {
      await uploadMany(ctx.$get(), bucket);
    }),
  }));

// Real state fields win over plugin methods with the same name
```

---

## 6. Typed options (optional)

If your plugin takes config, define a Zod schema in `createPluginContext`:

```ts
const { createPlugin } = createPluginContext({
  options: z.object({
    schema: z.custom<ZodType>(),
    refineInfo: z.custom<RefineInfo>(),
  }),
  pluginMetaData: z.object({ lastValidatedAt: z.number().optional() }),
  fieldMetaData: z.object({ touched: z.boolean().optional() }),
});
```

`params.options`, metadata getters/setters, and the builder chain are all typed from these schemas.

---

## Quick reference — when to use what

| Goal | Hook |
|------|------|
| Default state keys | `.initialState()` |
| Fetch/subscribe in React | `.useHook()` |
| Reshape state when config changes | `.transformState()` |
| Log/sync on every write | `.onUpdate()` |
| Validate on blur/input | `.onFormUpdate()` |
| Custom field UI | `.formWrapper()` or `formElements` option |
| Custom actions on state (`state.items.upload()`) | `.methods()` |
