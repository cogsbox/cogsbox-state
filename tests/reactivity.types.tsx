import type { JSX } from 'react';
import { createCogsState } from '../src/CogsState';

const { useCogsState } = createCogsState({
  totals: {
    price: 10,
    quantity: 2,
  },
});

export function ReactivityTypeChecks() {
  const state = useCogsState('totals');

  const total: number = state.$derive(
    (current) => current.price.$get() * current.quantity.$get()
  );
  const totalSignal: JSX.Element = state.$$derive(
    [state.price, state.quantity],
    ([price, quantity]) => price * quantity
  );
  const priceSignal: JSX.Element = state.price.$$get();

  useCogsState('totals', { reactiveType: 'component' });
  useCogsState('totals', { reactiveType: 'none' });

  // @ts-expect-error The obsolete deps mode is no longer supported.
  useCogsState('totals', { reactiveType: 'deps' });
  // @ts-expect-error Hook-wide reactive dependencies were removed.
  useCogsState('totals', { reactiveDeps: () => [1] });
  // @ts-expect-error Hook dependencies no longer trigger state reinitialization.
  useCogsState('totals', { dependencies: [1] });

  return (
    <div>
      {total}
      {totalSignal}
      {priceSignal}
    </div>
  );
}
