"use client";
import { useCogsState } from "./state";
import { v4 as uuidv4 } from "uuid";
// ProductList.tsx
export const ProductList = () => {
    const products = useCogsState("products");
    const cart = useCogsState("cart");

    return (
        <div className="w-[400px] flex flex-col gap-2 p-8">
            {products.items.stateMap((product, productSetter) => (
                <div key={product.id} className="flex gap-2 items-center">
                    <div className="w-[200px]">{product.name}</div>
                    <input
                        className="w-[100px] border-2 border-orange-500 px-2 py-1"
                        value={product.price}
                        onChange={(e) => {
                            productSetter.price.update(Number(e.target.value));
                            cart.total.update(
                                products.items
                                    .get()
                                    .reduce((acc, item) => acc + item.price, 0)
                            );
                        }}
                    />
                    <button
                        className="bg-orange-500 text-white p-1 rounded cursor-pointer hover:bg-orange-600 px-2"
                        onClick={() => {
                            cart.items.uniqueInsert(
                                {
                                    id: uuidv4(),
                                    productId: product.id,
                                    quantity: 1,
                                    unitPrice: product.price,
                                },
                                ["productId"]
                            );
                            cart.total.update((prev) =>
                                cart.items
                                    .get()
                                    .reduce(
                                        (acc, item) => acc + item.unitPrice,
                                        0
                                    )
                            );
                        }}
                    >
                        Add
                    </button>
                </div>
            ))}
        </div>
    );
};
