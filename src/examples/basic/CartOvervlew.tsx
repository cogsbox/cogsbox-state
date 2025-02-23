
import ComponentIdRenderer from "../components/ComponentIdRenderer";
import { FlashWrapper } from "../components/FlashOnUpdate";
import { useCogsState } from "./state";

// CartOverview.tsx
export const CartOverviewGet = () => {
    const cart = useCogsState("cart");
    const products = useCogsState("products");

    const items = cart.items;
    return (
        <FlashWrapper>
            <ComponentIdRenderer componentId={cart._componentId!} />
            <h3>Cart ({cart.items.get().length} items)</h3>
            {cart.items.get().map((item, itemIndex) => {
                const product = products.items.findWith("id", item.productId);
                return (
                    <div key={item.id}>
                        {product?.name.get()} - Qty: {item.quantity}
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
        </FlashWrapper>
    );
};
export const CartOverview = () => {
    const cart = useCogsState("cart");
    const products = useCogsState("products");

    return (
        <FlashWrapper>
            <ComponentIdRenderer componentId={cart._componentId!} />

            <h3>Cart ({cart.items.$effect((state) => state.length)} items)</h3>

            {cart.items.stateEach((item, setter) => {
                const product = products.items.findWith("id", item.productId);
                console.log("product", product.name.get(), item);
                return (
                    <div key={item.id}>
                        {product.name.$get()} - Qty: {item.quantity}
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
        <FlashWrapper>
            <ComponentIdRenderer componentId={cart._componentId!} />
            <h3>Cart ({cart.items.get().length} items)</h3>
            {cart.items.stateEach((item, setter) => {
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
