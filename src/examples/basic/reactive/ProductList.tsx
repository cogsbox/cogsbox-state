"use client";
import { useEffect } from "react";
import { useCogsState } from "./state";
import { v4 as uuidv4 } from "uuid";
// ProductList.tsx
export const ProductList = () => {
  const products = useCogsState("products");
  const cart = useCogsState("cart");

  useEffect(() => {
    const items = cart.items.get();
    console.log(items);
    if (items.length > 0) {
      cart.total.update(
        items.reduce(
          (acc, item) =>
            acc +
            item.quantity *
              products.items.findWith("id", item.productId).get().price,
          0
        )
      );
    } else {
      cart.total.update(0); // Or don't update at all if you want
    }
  }, [cart.items.get(), products.items.get()]);

  return (
    <div className="w-full flex flex-col gap-2 p-8 min-w-0 shadow rounded-lg bg-white">
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          {products.items.stateMap((product, productSetter) => (
            <div key={product.id} className="flex gap-2 items-center">
              <div className="w-[200px]">{product.name}</div>
              $
              <input
                className="w-[100px] border-2 border-amber-400 px-2 py-1"
                value={product.price}
                step={0.01}
                onChange={(e) => {
                  productSetter.price.update(Number(e.target.value));
                }}
              />
              <button
                className="bg-amber-400 text-white p-1 rounded cursor-pointer hover:bg-amber-600 px-2"
                onClick={() => {
                  cart.items.uniqueInsert(
                    {
                      id: uuidv4(),
                      productId: product.id,
                      quantity: 1,
                    },
                    ["productId"],
                    (existing) => ({
                      ...existing,
                      quantity: existing.quantity + 1,
                    })
                  );
                }}
              >
                Add
              </button>
            </div>
          ))}{" "}
        </div>
        <div className="p-4">
          <div className="h-4" />
          <div className="text-gray-500 text-sm">
            {" "}
            This Toggle button is not used in the components but it is set as a
            dependency on the dependency based one{" "}
          </div>
          <div className="flex gap-2 w-full ">
            <div className="flex-1">Toggle Status - ({cart.status.get()})</div>
            <button
              className="border rounded-lg border-white hover:bg-amber-400 cursor-pointer bg-amber-400 text-white px-2  py-1"
              onClick={() =>
                cart.status.update((s) => {
                  return s === "open" ? "closed" : "open";
                })
              }
            >
              Toggle
            </button>
          </div>
        </div>
      </div>
      <div className="p-1 min-h-[130px] flex flex-col gap-1">
        {cart.items.stateMap((item, setter) => {
          const product = products.items.findWith("id", item.productId);
          return (
            <div
              key={item.id}
              className="border border-gray-300  p-1 rounded cursor-pointer grid grid-cols-[100px_auto_90px] gap-2 px-2"
            >
              <div> {product?.name.get()} </div> <div>Qty: {item.quantity}</div>
              <button
                className="border rounded border-white hover:bg-amber-400 cursor-pointer bg-amber-400 text-white"
                onClick={() => setter.cut()}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>{" "}
      <div className="text-xs text-gray-500"> {cart._componentId}</div>
    </div>
  );
};
