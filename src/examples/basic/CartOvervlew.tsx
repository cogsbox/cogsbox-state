import CodeLine from "./CodeLine";
import { FlashWrapper } from "./FlashOnUpdate";
import { useCogsState } from "./state";

// CartOverview.tsx
export const CartOverviewGet = () => {
    const cart = useCogsState("cart");
    const products = useCogsState("products");

    return (
        <FlashWrapper
            componentId={cart._componentId!}
            title="Component Reactive - get()"
        >
            <CodeLine code={`const cart = useCogsState("cart")`} />{" "}
            <div className="h-4" />
            <div className="flex gap-2 w-full">
                <div className="basis-1/2">
                    <CodeLine code={`cart.items.get().length`} />
                    <div className="p-1 px-4 border-2 border-blue-500 rounded-b-lg">
                        {cart.items.get().length} items
                    </div>
                </div>{" "}
                <div className="basis-1/2">
                    <CodeLine code={`cart.total.get()`} />
                    <div className="p-1 px-4 border-2 border-blue-500 rounded-b-lg">
                        Total: $ {cart.total.get()}
                    </div>{" "}
                </div>
            </div>
            <div className="h-4" />
            <CodeLine code={`cart.items.get().map((item, itemIndex) =>`} />
            <div className="p-3 min-h-[160px] flex flex-col gap-2">
                {cart.items.get().map((item, itemIndex) => {
                    const product = products.items.findWith(
                        "id",
                        item.productId
                    );
                    console.log("cartItems", cart.items, item.productId);
                    return (
                        <div
                            key={item.id}
                            className="border-2 border-blue-500 p-1 rounded cursor-pointer grid grid-cols-[auto_90px] gap-2 px-2"
                        >
                            {product?.name.get()} - Qty: {item.quantity}
                            <button
                                className="border rounded border-white hover:bg-orange-400 cursor-pointer bg-orange-500 text-white"
                                onClick={() =>
                                    cart.items
                                        .findWith("productId", item.productId)
                                        .cut()
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
export const CartOverviewDep = () => {
    const cart = useCogsState("cart", {
        reactiveType: ["deps"],
        reactiveDeps: (state) => [state.items, state.status],
    });
    const products = useCogsState("products");

    return (
        <FlashWrapper
            componentId={cart._componentId!}
            title="Reactive Dependencies"
        >
            <CodeLine
                code={`  const cart = useCogsState("cart", {
        reactiveType: ["deps"],
        reactiveDeps: (state) => [state.items, state.status],
    });`}
            />
            <div className="h-4" />
            <div className="flex gap-2 w-full">
                <div className="basis-1/2">
                    <CodeLine code={`cart.items.get().length`} />
                    <div className="p-1 px-4 border-2 border-blue-500 rounded-b-lg">
                        {cart.items.get().length} items
                    </div>
                </div>
                <div className="basis-1/2">
                    <CodeLine code={`cart.total.get()`} />
                    <div className="p-1 px-4 border-2 border-blue-500 rounded-b-lg">
                        Total: $ {cart.total.get()}
                    </div>
                </div>
            </div>
            <div className="h-4" />
            <CodeLine code={`cart.items.stateMap((item, setter) =>`} />
            <div className="p-3 min-h-[160px] flex flex-col gap-2">
                {cart.items.stateMap((item, setter) => {
                    const product = products.items.findWith(
                        "id",
                        item.productId
                    );
                    return (
                        <div
                            key={item.id}
                            className="border-2 border-blue-500 p-1 rounded cursor-pointer grid grid-cols-[auto_90px] gap-2 px-2"
                        >
                            {product?.name.get()} - Qty: {item.quantity}
                            <button
                                className="border rounded border-white hover:bg-orange-400 cursor-pointer bg-orange-500 text-white"
                                onClick={() => setter.cut()}
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
        <FlashWrapper
            componentId={cart._componentId!}
            title="Signal Based - $get()"
        >
            <CodeLine code={`const cart = useCogsState("cart")`} />{" "}
            <div className="h-4" />
            <div className="flex gap-2 w-full">
                <div className="basis-1/2">
                    <CodeLine
                        code={`cart.items.$derive((state) => state.length)`}
                    />
                    <div className="p-1 px-4 border-2 border-blue-500 rounded-b-lg">
                        {cart.items.$derive((state) => state.length || 0) ||
                            "0"}{" "}
                        items
                    </div>
                </div>{" "}
                <div className="basis-1/2">
                    <CodeLine code={`cart.total.$get()`} />
                    <div className="p-1 px-4 border-2 border-blue-500 rounded-b-lg">
                        Total: $ {cart.total.$get()}
                    </div>{" "}
                </div>
            </div>
            <div className="h-4" />
            <CodeLine code={`cart.items.$stateMap((item, setter)`} />
            <div className="p-3 min-h-[160px] flex flex-col gap-2">
                {cart.items.$stateMap((item, setter) => {
                    const product = products.items.findWith(
                        "id",
                        item.productId
                    );

                    return (
                        <div
                            key={item.id}
                            className="border-2 border-blue-500 p-1 rounded cursor-pointer grid grid-cols-[auto_90px] gap-2 px-2"
                        >
                            {product.name.$get()} - Qty: {item.quantity}
                            <button
                                className="border rounded border-white hover:bg-orange-400 cursor-pointer bg-orange-500 text-white"
                                onClick={() => setter.cut()}
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
