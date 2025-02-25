import { useState } from "react";
import {
    SandpackProvider,
    SandpackLayout,
    SandpackCodeEditor,
    SandpackPreview,
} from "@codesandbox/sandpack-react";

const CodePreview = () => {
    const files = {
        "/App.tsx": `import { CartOverview } from "./CartOverview";
import { ProductList } from "./ProductList";

export default function App() {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="h-6" />
      <div className="flex items-start justify-center">
        <div className="bg-sky-100 rounded-lg p-6 grid grid-cols-2 gap-2">
          <div className="bg-white rounded-lg p-6">
            <ProductList />
          </div>
          <div>
            <CartOverview />
          </div>
        </div>
      </div>
    </div>
  );
}`,
        "/CartOverview.tsx": `import { FlashWrapper } from "./FlashWrapper";
import { useCogsState } from "./state";

export const CartOverview = () => {
  const cart = useCogsState("cart");
  const products = useCogsState("products");

  return (
    <FlashWrapper componentId={cart._componentId}>
      <div>Cart ({cart.items.length} items)</div>
      <div>£ {cart.total}</div>
      {cart.items.map((item) => {
        const product = products.items.find(p => p.id === item.productId);
        return (
          <div key={item.id}>
            {product?.name} - Qty: {item.quantity}
            <button
              onClick={() => cart.updateItem(item.id, { quantity: item.quantity + 1 })}
            >
              +
            </button>
            <button
              onClick={() => cart.removeItem(item.id)}
            >
              Remove
            </button>
          </div>
        );
      })}
    </FlashWrapper>
  );
};`,
        "/FlashWrapper.tsx": `import React from 'react';

export const FlashWrapper = ({ children, componentId }) => {
  return (
    <div className="p-4 border rounded" data-component-id={componentId}>
      {children}
    </div>
  );
};`,
        "/state.ts": `import { createCogsState } from "cogsbox-state";

const initialState = {
  products: {
    items: [
      {
        id: 1,
        name: "T-Shirt",
        price: 5,
        stock: 100,
        category: "clothing",
      },
      {
        id: 2,
        name: "Jeans",
        price: 10,
        stock: 50,
        category: "clothing",
      }
    ],
    category: "Clothing",
  },
  cart: {
    items: [],
    isOpen: false,
    total: 0,
  },
};

export const { useCogsState } = createCogsState(initialState);`,
        "/ProductList.tsx": `import { useCogsState } from "./state";
import { v4 as uuidv4 } from "uuid";

export const ProductList = () => {
  const products = useCogsState("products");
  const cart = useCogsState("cart");

  return (
    <div className="w-full flex flex-col gap-2">
      {products.items.map((product) => (
        <div key={product.id} className="flex gap-2 items-center">
          <div className="w-48">{product.name}</div>
          <div className="w-24">£{product.price}</div>
          <button
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            onClick={() => {
              cart.addItem({
                id: uuidv4(),
                productId: product.id,
                quantity: 1,
          
              });
            }}
          >
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}`,
        "/index.tsx": `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);`,
    };

    return (
        <SandpackProvider
            template="react-ts"
            files={files}
            theme="light"
            customSetup={{
                dependencies: {
                    react: "^18.2.0",
                    "react-dom": "^18.2.0",
                    "cogsbox-state": "latest",
                    zustand: "^5.0.3",
                    uuid: "^9.0.0",
                },
                entry: "/index.tsx", // Add this
            }}
        >
            <SandpackLayout>
                <SandpackCodeEditor showLineNumbers showTabs />
                <SandpackPreview />
            </SandpackLayout>
        </SandpackProvider>
    );
};

export default CodePreview;
