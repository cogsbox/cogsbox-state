import { useCogsState } from "./state";

// CartOverview.tsx
export const CartOverview = () => {
    const cart = useCogsState("cart");
    const products = useCogsState("products");

    const items = cart.items;
    return (
        <div>
            {cart._componentId}
            <h3>Cart ({items.get().length} items)</h3>
            {items.get().map((item, itemIndex) => {
                const product = products.items.findWith("id", item.productId);
                return (
                    <div key={item.id}>
                        {product?.name} - Qty: {item.quantity}
                        <button
                            onClick={() =>
                                items
                                    .findWith("productId", item.productId)
                                    .quantity.update((prev) => prev + 1)
                            }
                        >
                            +
                        </button>
                        <button
                            onClick={
                                () =>
                                    items
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
