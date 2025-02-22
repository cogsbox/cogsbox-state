"use client";
import { useCogsState } from "./state";

// ProductList.tsx
export const ProductList = () => {
    const [products, productsUpdater] = useCogsState("products");
    const [cartState, cartUpdater] = useCogsState("cart");

    return (
        <div>
            {products.items.map((product) => (
                <div key={product.id}>
                    {product.name} - ${product.price}
                    <button
                        onClick={() =>
                            cartUpdater.items.uniqueInsert(
                                {
                                    id: cartState.items.length + 1,
                                    productId: product.id,
                                    quantity: 1,
                                    unitPrice: product.price,
                                },
                                ["productId"],
                            )
                        }
                    >
                        Add to Cart
                    </button>
                </div>
            ))}
        </div>
    );
};
