import CodeLine from "./CodeLine";
import { FlashWrapper } from "./FlashOnUpdate";
import { useCogsState } from "./state";

// CartOverview.tsx
export const CartOverviewGet = () => {
    const cart = useCogsState("cart");
    const products = useCogsState("products");

    return (
        <FlashWrapper componentId={cart._componentId!}>
            <div className="p-2 text-gray-500">
                The get() method returns the current state of the value and is
                reactive.
            </div>
            <CodeLine
                header={true}
                code={`const cart = useCogsState("cart")`}
            />
            <div className="h-2" />
            <CodeLine code={`cart.items.get().length`} />
            <div className="p-3">
                Cart ({cart.items.get().length} items)
            </div>{" "}
            <CodeLine code={`cart.total.get()`} />
            <div className="p-3">Total: $ {cart.total.get()}</div>
            <CodeLine code={`cart.items.get().map((item, itemIndex) =>`} />
            <div className="p-3">
                {cart.items.get().map((item, itemIndex) => {
                    const product = products.items.findWith(
                        "id",
                        item.productId
                    );
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
                                            .findWith(
                                                "productId",
                                                item.productId
                                            )
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
        </FlashWrapper>
    );
};

export const CartOverview = () => {
    const cart = useCogsState("cart");
    const products = useCogsState("products");

    return (
        <FlashWrapper componentId={cart._componentId!}>
            <div className="p-2 text-gray-500">
                in this version the function used such as $get() and $effect()
                are not reactive. They create signals that are tracked by the
                component id
            </div>
            <CodeLine
                header={true}
                code={`const cart = useCogsState("cart")`}
            />
            <div className="h-2" />
            <CodeLine code={`cart.items.$effect((state) => state.length)`} />
            <div className="p-3">
                Cart ({cart.items.$effect((state) => state.length ?? 0)} items)
            </div>{" "}
            <CodeLine code={`cart.total.$get()`} />
            <div className="p-3">Total: $ {cart.total.$get()}</div>
            <CodeLine code={`cart.items.$stateMap((item, setter)`} />
            <div className="p-3">
                {cart.items.$stateMap((item, setter) => {
                    console.log("products", products);
                    const product = products.items.findWith(
                        "id",
                        item.productId
                    );

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
                })}{" "}
            </div>
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
