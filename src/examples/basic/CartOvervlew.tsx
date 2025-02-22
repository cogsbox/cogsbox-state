import { $cogsSignal } from "../../CogsState";
import { FlashWrapper } from "../components/FlashOnUpdate";
import { useCogsState } from "./state";

// CartOverview.tsx
export const CartOverviewGet = () => {
    const cart = useCogsState("cart");
    const products = useCogsState("products");

    const items = cart.items;
    return (
        <FlashWrapper>
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
        </FlashWrapper>
    );
};
export const CartOverview = () => {
    const cart = useCogsState("cart");
    const products = useCogsState("products");
    console.log("cart", cart.get());
    const items = cart.items;

    return (
        <FlashWrapper>
            {cart._componentId}

            <h3>Cart ({items.$effect((state) => state.length)} items)</h3>
            {items.stateEach((item, setter) => {
                const product = products.items.findWith("id", item.productId);
                console.log("product", product.name.get(), item);
                return (
                    <div key={item.id}>
                        {product.name.$get()} - Qty: {item.quantity}
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
export const CartOverviewDep = () => {
    const cart = useCogsState("cart", {
        reactiveDeps: (state) => [state.total],
    });
    const products = useCogsState("products");

    const items = cart.items;
    return (
        <FlashWrapper>
            {cart._componentId}
            <h3>Cart ({items.get().length} items)</h3>
            {items.get().map((item, itemIndex) => {
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
