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
            />{" "}
            <div className="h-4" />
            <CodeLine code={`cart.items.get().length`} />
            <div className="p-1 px-4 border-2 border-blue-500  rounded-b-lg">
                ({cart.items.get().length} items)
            </div>{" "}
            <div className="h-4" />
            <CodeLine code={`cart.total.get()`} />
            <div className="p-1 px-4 border-2 border-blue-500  rounded-b-lg">
                Total: $ {cart.total.get()}
            </div>{" "}
            <div className="h-4" />
            <CodeLine code={`cart.items.get().map((item, itemIndex) =>`} />
            <div className="p-3 min-h-[200px] flex flex-col gap-2 ">
                {cart.items.get().map((item, itemIndex) => {
                    const product = products.items.findWith(
                        "id",
                        item.productId
                    );
                    console.log("cartItems", cart.items, item.productId);
                    return (
                        <div
                            key={item.id}
                            className="border-2 border-blue-500 p-1 rounded cursor-pointer grid grid-cols-[auto_50px_90px] gap-2 px-2"
                        >
                            {product?.name.get()} - Qty: {item.quantity}
                            <button
                                className="border rounded border-white hover:bg-orange-400 cursor-pointer bg-orange-500 text-white"
                                onClick={() =>
                                    cart.items
                                        .findWith("productId", item.productId)
                                        .quantity.update((prev) => prev + 1)
                                }
                            >
                                +
                            </button>
                            <button
                                className="border rounded border-white hover:bg-orange-400 cursor-pointer bg-orange-500 text-white"
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
            />{" "}
            <div className="h-4" />
            <CodeLine code={`cart.items.$effect((state) => state.length)`} />
            <div className="p-1 px-4 border-2 border-blue-500  rounded-b-lg">
                {cart.items.$effect((state) => state.length || 0) || "0"} items
            </div>{" "}
            <div className="h-4" />
            <CodeLine code={`cart.total.$get()`} />
            <div className="p-1 px-4 border-2 border-blue-500  rounded-b-lg">
                Total: $ {cart.total.$get()}
            </div>{" "}
            <CodeLine code={`cart.items.$stateMap((item, setter)`} />
            <div className="p-3 min-h-[200px] flex flex-col gap-2 ">
                {cart.items.$stateMap((item, setter) => {
                    const product = products.items.findWith(
                        "id",
                        item.productId
                    );

                    return (
                        <div
                            key={item.id}
                            className="border-2 border-blue-500 p-1 rounded cursor-pointer grid grid-cols-[auto_50px_90px] gap-2 px-2"
                        >
                            {product.name.$get()} - Qty: {item.quantity}
                            <button
                                className="border rounded border-white hover:bg-orange-400 cursor-pointer bg-orange-500 text-white"
                                onClick={() =>
                                    setter.quantity.update((prev) => prev + 1)
                                }
                            >
                                +
                            </button>
                            <button
                                className="border rounded border-white hover:bg-orange-400 cursor-pointer bg-orange-500 text-white"
                                onClick={() => setter.cut()}
                            >
                                Remove
                            </button>
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
