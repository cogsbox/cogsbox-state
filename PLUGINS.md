# Plugin Interface

Plugins let you hook into cogsbox-state's lifecycle without modifying the library. The state layer stays schema-agnostic — a plugin bridges the gap between cogsbox-state and a schema library like `cogsbox-shape`.

## Plugin Type

```ts
type CogsPlugin<
  TName extends string,
  TOptions,
  THookReturn,
  TPluginMetaData,
  TFieldMetaData,
  TChainMethods extends ChainMethodDefinitions = {},
> = {
  name: TName;

  useHook?: (
    params: UseHookParams<TOptions, TPluginMetaData, TFieldMetaData>
  ) => THookReturn;

  transformState?: (
    params: TransformStateParams<TOptions, THookReturn, TPluginMetaData, TFieldMetaData>
  ) => void;

  onUpdate?: (
    params: OnUpdateParams<TOptions, THookReturn, TPluginMetaData, TFieldMetaData>
  ) => void;

  onFormUpdate?: (
    params: OnFormUpdateParams<TOptions, THookReturn, TPluginMetaData, TFieldMetaData>
  ) => void;

  formWrapper?: (
    params: FormWrapperParams<TOptions, THookReturn, TPluginMetaData, TFieldMetaData>
  ) => React.ReactNode;

  chainMethods?: TChainMethods;
};
```

## Registration

Plugins are registered at `createCogsState()` time via the `plugins` option:

```ts
const { useCogsState, setCogsOptionsByKey } = createCogsState(initialState, {
  plugins: [myPlugin],
});
```

Plugin options are passed per-state-key through `useCogsState()` or `setCogsOptionsByKey()`. The key is the plugin's `name`:

```ts
setCogsOptionsByKey("tradingRulesForm", {
  myPlugin: {
    schema: mySchema,
    refineInfo: myRefineInfo,
  },
});
```

Or per-hook:

```ts
const state = useCogsState("tradingRulesForm", {
  myPlugin: { schema: mySchema },
});
```

The `PluginRunner` component (rendered inside `CogsStateProvider`) creates a dedicated `PluginInstance` for each `(stateKey, plugin)` pair. Each instance receives its own scoped options.

## Hooks

### `useHook`

A React hook, runs once per `(stateKey, pluginName)` pair. Returns `THookReturn` which is stored in the plugin store and available to other hooks.

```ts
useHook: (params) => {
  const [data, setData] = useState(null);
  useEffect(() => {
    // setup
    return () => cleanup;
  }, []);
  return data; // THookReturn
},
```

Available in the params object:

- `stateKey` — current state key
- `options` — plugin options for this state key
- `pluginName`
- `isInitialMount` — true on first render
- `initialiseState(data)` — replace state value
- `initialiseShadowState(data)` — merge into shadow state
- `applyOperation(patch, meta?)` — apply a raw operation
- `addZodErrors(errors)` — push validation errors to specific paths
- `getState()` — read current shadow state
- `setOptions(opts)` — set options for this state key
- `getPluginMetaData()`, `setPluginMetaData(data)`, `removePluginMetaData()` — plugin-level metadata
- `getFieldMetaData(path)`, `setFieldMetaData(path, data)`, `removeFieldMetaData(path)` — per-field metadata
- `getFieldRefs(path)`, `getFieldElements(path)` — DOM refs/elements at a path
- `setFieldDisabled(path, disabled)` — disable/enable fields
- `getAllFieldElements()`, `setAllFieldsDisabled(disabled)`

### `transformState`

Runs when plugin options change. Good for initializing or transforming state based on schema config.

```ts
transformState: (params) => {
  const state = params.getState();
  // transform state
  params.initialiseShadowState(transformed);
},
```

### `onUpdate`

Fires on every state update (setter calls, inserts, cuts). Receives the `UpdateTypeDetail` describing what changed.

```ts
onUpdate: (params) => {
  // params.update — { path, newValue, oldValue, updateType, timeStamp }
  // params.path — the update path
  // params.getState() — full current state
  // params.addZodErrors(errors) — push validation errors
},
```

The `onUpdate` hook receives a scoped metadata context (field-level) for the specific path being updated — `getFieldMetaData()`, `setFieldMetaData()`, etc. operate on the update's path without needing to pass it.

### `onFormUpdate`

Fires on form activity events: focus, blur, input, select, hover, scroll, cursor move. This is the primary hook for real-time validation.

```ts
onFormUpdate: (params) => {
  // params.event.activityType — "focus" | "blur" | "input" | "select" | "hover_enter" | "hover_exit" | "scroll" | "cursor_move"
  // params.event.path — the field path
  // params.event.timestamp
  // params.event.details — varies by activityType
  // params.getState() — full current state
  // params.addZodErrors(errors) — push validation errors
},
```

Activity-type-specific details:

```ts
{ activityType: "focus", details: { cursorPosition?: number } }
{ activityType: "blur", details: { duration: number } }
{ activityType: "input", details: { value, inputLength?, isComposing?, isPasting?, keystrokeCount? } }
{ activityType: "select", details: { selectionStart, selectionEnd, selectedText? } }
{ activityType: "hover_enter", details: { cursorPosition? } }
{ activityType: "hover_exit", details: { duration: number } }
{ activityType: "scroll", details: { scrollTop, scrollLeft } }
{ activityType: "cursor_move", details: { cursorPosition } }
```

Like `onUpdate`, this receives the scoped metadata context for the event's path.

### `formWrapper`

Wraps form element rendering. This is an alternative to the `formElements.validation` option for plugin-specific field wrappers.

```ts
formWrapper: (params) => {
  return (
    <div className="plugin-wrapped">
      {params.element}
    </div>
  );
},
```

The `formWrapper` can also be set dynamically via `setCogsOptionsByKey`:

```ts
setCogsOptionsByKey("tradingRulesForm", {
  formElements: {
    myPlugin: (params) => <CustomWrapper>{params.element}</CustomWrapper>,
  },
});
```

### `chainMethods`

Adds custom methods to state objects via proxy. Each method definition targets a value type (`"any"`, `"array"`, `"object"`, `"primitive"`, `"boolean"`) and optionally a path pattern.

```ts
chainMethods: {
  $myMethod: {
    target: "array",
    handler: (ctx, ...args) => {
      // ctx.$get() — current value at path
      // ctx.$update(payload) — update value
      // ctx.getFieldRefs() — DOM refs at path
      return someResult;
    },
  },
},
```

## Validation Flow (Shape Plugin Pattern)

A schema-aware plugin like `cogsbox-shape` would use `onFormUpdate` for per-field validation with cross-field awareness:

```ts
onFormUpdate: (params) => {
  if (params.event.activityType !== "blur") return;

  const path = params.event.path;
  const fullState = params.getState();
  const schema = params.options.schema;           // full Zod schema with superRefine
  const fieldToGroup = params.options.fieldToGroup; // refineInfo.fieldToGroup
  const groups = params.options.groups;           // refineInfo.groups

  // 1. Find which refinement groups touch this field
  const fieldName = path[path.length - 1];
  const affectedGroups = fieldToGroup[fieldName] || [];

  // 2. Collect all related fields across those groups
  const relatedFields = new Set<string>();
  for (const g of affectedGroups) {
    for (const dep of groups[g].deps) {
      relatedFields.add(dep);
    }
  }

  // 3. Validate full state against full schema (hits superRefine)
  const result = schema.safeParse(fullState);
  if (!result.success) {
    const errors = result.error.issues
      .filter(i => {
        const issueField = i.path[0];
        return issueField === fieldName || relatedFields.has(issueField);
      })
      .map(i => ({
        path: i.path.map(String),
        message: i.message,
        code: i.code,
      }));

    if (errors.length > 0) {
      params.addZodErrors(errors);
    }
  }
},
```

The state library never needs to know about schemas, `refineInfo`, or dependency tracking. It just routes the blur event to the plugin and lets the plugin return path-mapped errors.

## `createPluginContext()` Builder

`createPluginContext` provides a typed builder for creating plugins with Zod-validated options and metadata:

```ts
const { createPlugin } = createPluginContext({
  options: z.object({
    schema: z.custom<ZodType>(),
    refineInfo: z.custom<RefineInfo>(),
  }),
  pluginMetaData: z.object({ /* ... */ }),
  fieldMetaData: z.object({ /* ... */ }),
});

const myPlugin = createPlugin("shapeValidator")
  .useHook((params) => { /* ... */ })
  .onFormUpdate((params) => { /* ... */ });
```

The builder chains `.useHook()`, `.transformState()`, `.onUpdate()`, `.onFormUpdate()`, and `.methods()` to construct the plugin object with full type inference.
