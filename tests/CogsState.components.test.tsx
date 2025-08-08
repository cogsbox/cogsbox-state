import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createCogsState } from '../src/CogsState';

// Mock only what's needed
vi.mock('../src/CogsStateClient.js', () => ({
  useCogsConfig: () => ({ sessionId: 'test-session-id' }),
}));

vi.mock('react-intersection-observer', () => ({
  useInView: () => ({
    ref: vi.fn(),
    inView: true,
  }),
}));

// Test state with nested arrays - both levels have 'active' property with opposite meanings
const { useCogsState } = createCogsState({
  testState: {
    initialState: {
      categories: [
        {
          name: 'Fruits',
          active: true, // Category is active
          items: [
            { name: 'apple', active: false }, // Item is NOT active
            { name: 'banana', active: true }, // Item IS active
            { name: 'orange', active: false }, // Item is NOT active
          ],
        },
        {
          name: 'Vegetables',
          active: false, // Category is NOT active
          items: [
            { name: 'carrot', active: true }, // Item IS active
            { name: 'lettuce', active: false }, // Item is NOT active
          ],
        },
        {
          name: 'Dairy',
          active: true, // Category is active
          items: [
            { name: 'milk', active: true }, // Item IS active
            { name: 'cheese', active: false }, // Item IS active
            { name: 'yogurt', active: true }, // Item IS active
          ],
        },
      ],
    },
  },
});

describe('nested stateList with conflicting filter properties', () => {
  it('should apply filters correctly to each level despite same property name', () => {
    const TestComponent = () => {
      const state = useCogsState('testState');

      // Filter categories where active === true
      const activeCategories = state.categories.stateFilter(
        (cat) => cat.active === true
      );

      return (
        <div>
          {activeCategories.stateList((category, catIndex) => (
            <div key={catIndex} data-testid={`category-${catIndex}`}>
              <h3>{category.name.get()}</h3>
              {/* Filter items where active === false (opposite of category filter!) */}
              {category.items
                .stateFilter((item) => item.active === false)
                .stateList((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    data-testid={`cat-${catIndex}-item-${itemIndex}`}
                  >
                    {item.name.get()}
                  </div>
                ))}
            </div>
          ))}
        </div>
      );
    };

    render(<TestComponent />);

    // Should only show 2 active categories (Fruits and Dairy, NOT Vegetables)
    expect(screen.getByTestId('category-0')).toHaveTextContent('Fruits');
    expect(screen.getByTestId('category-1')).toHaveTextContent('Dairy');
    expect(screen.queryByText('Vegetables')).not.toBeInTheDocument();

    // CRITICAL TEST:
    // Fruits category should show ONLY items where active === false (apple and orange)
    // If the category filter was wrongly applied here, it would show banana instead!
    expect(screen.getByTestId('cat-0-item-0')).toHaveTextContent('apple');
    expect(screen.getByTestId('cat-0-item-1')).toHaveTextContent('orange');
    expect(screen.queryByText('banana')).not.toBeInTheDocument(); // banana.active === true, should be filtered out

    // Dairy category should show ONLY items where active === false (cheese only)
    // If the category filter was wrongly applied, it would show milk and yogurt instead!
    expect(screen.getByTestId('cat-1-item-0')).toHaveTextContent('cheese');
    expect(screen.queryByText('milk')).not.toBeInTheDocument(); // milk.active === true, should be filtered out
    expect(screen.queryByText('yogurt')).not.toBeInTheDocument(); // yogurt.active === true, should be filtered out
  });

  it('should update stateList rendering when pushing new items', async () => {
    const TestComponent = () => {
      const state = useCogsState('testState', { reactiveType: 'none' });
      const activeCategories = state.categories.stateFilter(
        (cat) => cat.active === true
      );

      React.useEffect(() => {
        // NOTE: A race condition can occur if the insert happens before the initial render is asserted.
        // For robust tests, triggering this via a user event (button click) is better,
        // but for this specific fix, we'll keep the useEffect.
        setTimeout(() => {
          state.categories.insert({
            name: 'Snacks',
            active: true,
            items: [
              { name: 'chips', active: false },
              { name: 'nuts', active: true },
            ],
          });
        }, 100); // Small delay to ensure initial render happens first
      }, []);

      return (
        <div>
          {activeCategories.stateList((category, catIndex) => (
            <div key={catIndex} data-testid={`category-${catIndex}`}>
              <h3>{category.name.get()}</h3>
              <div data-testid={`inactive-items-${catIndex}`}>
                {
                  // ✅ THE ONLY CHANGE IS HERE:
                  category.items
                    .stateFilter((item) => item.active === false)
                    .get().length
                }
              </div>
            </div>
          ))}
        </div>
      );
    };

    render(<TestComponent />);

    await waitFor(
      () => {
        expect(screen.getByTestId('category-2')).toHaveTextContent('Snacks');
      },
      { timeout: 2000 }
    );

    expect(screen.getByTestId('inactive-items-0')).toHaveTextContent('2');
    expect(screen.getByTestId('inactive-items-1')).toHaveTextContent('1');
    expect(screen.getByTestId('inactive-items-2')).toHaveTextContent('1');
  });
});
