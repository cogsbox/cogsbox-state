import { describe, it } from 'vitest';
import { expectTypeOf } from 'expect-type';
import { renderHook } from '@testing-library/react';
import { z } from 'zod';
import { createCogsState } from '../src/CogsState';
import {
  createPluginContext,
  type ChainMethodDefinition,
  type CogsPluginBuilder,
} from '../src/plugins';

describe('plugin return types', () => {
  it('infers StateObject for plugin initialState keys', () => {
    const { createPlugin } = createPluginContext();
    const taskManagerPlugin = createPlugin('taskManager').initialState(() => ({
      tasks: [] as Array<{ id: number; title: string; done: boolean }>,
      filter: 'all' as string,
    }));

    const { useCogsState } = createCogsState(
      {},
      { plugins: [taskManagerPlugin] }
    );
    const { result } = renderHook(() => useCogsState('tasks'));

    expectTypeOf(result.current.$get()).toEqualTypeOf<
      Array<{ id: number; title: string; done: boolean }>
    >();
    expectTypeOf(result.current).not.toBeAny();
  });

  it('preserves plugin method argument and return types', () => {
    const { createPlugin } = createPluginContext();
    const uploadPlugin = createPlugin('upload').methods(({ object }) => ({
      sendToS3: object((ctx, bucket: string, prefix?: string) => ({
        bucket,
        prefix,
        path: ctx.path,
      })),
    }));

    const { useCogsState } = createCogsState(
      {
        assets: {
          image: 'avatar.png',
        },
      },
      { plugins: [uploadPlugin] }
    );

    const { result } = renderHook(() => useCogsState('assets'));

    expectTypeOf(result.current.$sendToS3).parameters.toEqualTypeOf<
      [bucket: string, prefix?: string]
    >();
    expectTypeOf(result.current.$sendToS3('bucket')).toMatchTypeOf<{
      bucket: string;
      prefix: string | undefined;
      path: string[];
    }>();

    // @ts-expect-error bucket must be a string
    result.current.$sendToS3(123);

    // @ts-expect-error plugin chain methods are exposed with a $ prefix
    result.current.sendToS3('bucket');
  });

  it('combines custom methods from multiple plugins', () => {
    const { createPlugin: createShapePlugin } = createPluginContext({
      options: z.object({ logs: z.boolean().optional() }),
      pluginMetaData: z.object({ cacheKey: z.string().optional() }),
    });
    const { createPlugin: createTablePlugin } = createPluginContext({
      fieldMetaData: z.object({ page: z.number() }),
    });

    type ShapeMethods = {
      status: ChainMethodDefinition<
        (_ctx: unknown, scope: string) => { scope: string; valid: boolean }
      >;
    };
    type EmittedShapePlugin = CogsPluginBuilder<
      'shape',
      { logs: boolean | undefined },
      { cacheKey: string | undefined },
      unknown,
      never,
      ShapeMethods,
      true,
      true,
      true,
      true,
      false,
      true,
      { editor: { name: string } }
    >;

    const shapePlugin: EmittedShapePlugin = createShapePlugin('shape')
      .initialState(() => ({ editor: { name: 'Draft' } }))
      .transformState(() => {})
      .onFormUpdate(() => {})
      .onUpdate(() => {})
      .methods(({ object }) => ({
        status: object((_ctx, scope: string) => ({ scope, valid: true })),
      }));

    function table<Row>(_ctx: unknown, rows: Row[]) {
      return { rows };
    }

    const tablePlugin = createTablePlugin('table').methods(({ array }) => ({
      table: array(table),
    }));
    const plugins = [shapePlugin, tablePlugin];

    const { useCogsState } = createCogsState(
      { rows: [{ id: 1 }] },
      { plugins }
    );
    const { result } = renderHook(() => useCogsState('editor'));
    const { result: rowsResult } = renderHook(() => useCogsState('rows'));

    expectTypeOf(result.current.$status).parameters.toEqualTypeOf<
      [scope: string]
    >();
    expectTypeOf(result.current.$status('save')).toEqualTypeOf<{
      scope: string;
      valid: boolean;
    }>();
    expectTypeOf(rowsResult.current.$table([{ id: 2 }])).toEqualTypeOf<{
      rows: unknown[];
    }>();

    // @ts-expect-error shape method retains its own argument type
    result.current.$status(42);
  });
});
