import { describe, it } from 'vitest';
import { expectTypeOf } from 'expect-type';
import { renderHook } from '@testing-library/react';
import { createCogsState } from '../src/CogsState';
import { createPluginContext } from '../src/plugins';

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
    const { createPlugin: createUploadPlugin } = createPluginContext();
    const { createPlugin: createAuditPlugin } = createPluginContext();

    const uploadPlugin = createUploadPlugin('upload').methods(({ object }) => ({
      upload: object((_ctx, bucket: string) => ({ bucket })),
    }));
    const auditPlugin = createAuditPlugin('audit').methods(({ object }) => ({
      recordAudit: object((_ctx, eventId: number) => String(eventId)),
    }));
    const plugins = [uploadPlugin, auditPlugin];

    const { useCogsState } = createCogsState(
      { assets: { image: 'avatar.png' } },
      { plugins }
    );
    const { result } = renderHook(() => useCogsState('assets'));

    expectTypeOf(result.current.$upload).parameters.toEqualTypeOf<
      [bucket: string]
    >();
    expectTypeOf(result.current.$upload('images')).toEqualTypeOf<{
      bucket: string;
    }>();
    expectTypeOf(result.current.$recordAudit).parameters.toEqualTypeOf<
      [eventId: number]
    >();
    expectTypeOf(result.current.$recordAudit(42)).toEqualTypeOf<string>();

    // @ts-expect-error upload belongs to the combined plugin method surface
    // but still requires its own argument type
    result.current.$upload(42);
    // @ts-expect-error audit method arguments remain independent of upload
    result.current.$recordAudit('42');
  });
});
