import { useCogsState } from "./state";

// CartOverview.tsx
export const CartOverview = () => {
    const [cartState, cartUpdater] = useCogsState("cart");
    const [products] = useCogsState("products");

    return (
        <div>
            <h3>Cart ({cartState.items.length} items)</h3>
            {cartState.items.map((item, itemIndex) => {
                const product = products.items.find(
                    (p) => p.id === item.productId,
                );
                return (
                    <div key={item.id}>
                        {product?.name} - Qty: {item.quantity}
                        <button
                            onClick={() =>
                                cartUpdater.items
                                    .findWith("productId", item.productId)
                                    .quantity.update((prev) => prev + 1)
                            }
                        >
                            +
                        </button>
                        <button
                            onClick={
                                () =>
                                    cartUpdater.items
                                        .findWith("productId", item.productId)
                                        .cut()
                                // or cartUpdater.items.cut(itemIndex)}
                            }
                        >
                            Remove
                        </button>
                    </div>
                );
            })}
        </div>
    );
};
