import { FlashWrapper } from "./FlashOnUpdate";
import { useCogsState } from "./state";

// CartOverview.tsx
export const CartOverviewGet = () => {
    const cart = useCogsState("cart");
    const products = useCogsState("products");

    return (
        <FlashWrapper componentId={cart._componentId!}>
            <div>Cart ({cart.items.get().length} items)</div>{" "}
            <div> £ {cart.total.get()}</div>
            {cart.items.get().map((item, itemIndex) => {
                const product = products.items.findWith("id", item.productId);
                return (
                    <div key={item.id}>
                        {product?.name.get()} - Qty: {item.quantity}
                        <button
                            onClick={() =>
                                cart.items
                                    .findWith("productId", item.productId)
                                    .quantity.update((prev) => prev + 1)
                            }
                        >
                            +
                        </button>
                        <button
                            onClick={
                                () =>
                                    cart.items
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
        </FlashWrapper>
    );
};

export const CartOverview = () => {
    const cart = useCogsState("cart");
    const products = useCogsState("products");

    return (
        <FlashWrapper componentId={cart._componentId!}>
            <div>
                Cart ({cart.items.$effect((state) => state.length)} items)
            </div>
            <div> £ {cart.total.$get()}</div>
            {cart.items.$stateMap((item, setter) => {
                console.log("products", products);
                const product = products.items.findWith("id", item.productId);

                return (
                    <div key={item.id}>
                        {product.name.$get()} - Qty: {item.quantity} - value:{" "}
                        <button
                            onClick={() =>
                                setter.quantity.update((prev) => prev + 1)
                            }
                        >
                            +
                        </button>
                        <button onClick={() => setter.cut()}>Remove</button>
                    </div>
                );
            })}
        </FlashWrapper>
    );
};
export const CartOverviewDep = () => {
    const cart = useCogsState("cart", {
        reactiveDeps: (state) => [state.items],
    });
    const products = useCogsState("products");

    return (
        <FlashWrapper componentId={cart._componentId!}>
            <div>Cart ({cart.items.get().length} items)</div>{" "}
            <div> £ {cart.total.get()}</div>
            {cart.items.stateMap((item, setter) => {
                const product = products.items.findWith("id", item.productId);
                return (
                    <div key={item.id}>
                        {product?.name.get()} - Qty: {item.quantity}
                        <button
                            onClick={() =>
                                setter.quantity.update((prev) => prev + 1)
                            }
                        >
                            +
                        </button>
                        <button
                            onClick={
                                () => {
                                    setter.cut();
                                }
                                // or cartUpdater.items.cut(itemIndex)}
                            }
                        >
                            Remove
                        </button>
                    </div>
                );
            })}
        </FlashWrapper>
    );
};
