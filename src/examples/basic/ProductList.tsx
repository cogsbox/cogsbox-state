"use client";
import { useCogsState } from "./state";
import { v4 as uuidv4 } from "uuid";
// ProductList.tsx
export const ProductList = () => {
    const products = useCogsState("products");
    const cart = useCogsState("cart");

    return (
        <div>
            {products.items.get().map((product) => (
                <div key={product.id}>
                    {product.name} - ${product.price}
                    <button
                        onClick={() =>
                            cart.items.uniqueInsert(
                                {
                                    id: uuidv4(),
                                    productId: product.id,
                                    quantity: 1,
                                    unitPrice: product.price,
                                },
                                ["productId"],
                            )
                        }
                    >
                        Add
                    </button>
                </div>
            ))}
        </div>
    );
};
