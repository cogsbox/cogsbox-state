import { TriangleAlert } from "lucide-react";
import CodeLine from "./CodeLine";
import { FlashWrapper } from "./FlashOnUpdate";
import { useCogsState } from "./state";

// CartOverviewGet.tsx
export const CartOverviewGet = () => {
    const cart = useCogsState("cart");
    const products = useCogsState("products");

    return (
        <FlashWrapper
            color="bg-orange-500"
            componentId={cart._componentId!}
            title="Component Reactive"
        >
            <CodeLine code={`const cart = useCogsState("cart")`} />{" "}
            <div className="h-4" />
            <div className="flex flex-col gap-2 w-full">
                <div className="flex w-full">
                    <div className="w-3/4">
                        <CodeLine code={`cart.items.get().length`} />
                    </div>
                    <div className="w-1/4 p-1 px-4 text-white  bg-blue-500 rounded">
                        {cart.items.get().length} items
                    </div>
                </div>

                <div className="flex w-full">
                    <div className="w-3/4">
                        <CodeLine code={`cart.total.get()`} />
                    </div>
                    <div className="w-1/4 p-1 px-4 text-white  bg-blue-500 rounded">
                        Total: $ {cart.total.get()}
                    </div>
                </div>
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
            color="bg-sky-500"
            componentId={cart._componentId!}
            title={
                <div className="flex gap-2">
                    <div className="flex w-8 h-8 items-center justify-center rounded-lg bg-red-500 p-1">
                        <TriangleAlert size={30} className="inline-block" />{" "}
                    </div>
                    Reactive Dependencies
                </div>
            }
        >
            <CodeLine
                code={`  const cart = useCogsState("cart", {
        reactiveType: ["deps"],
        reactiveDeps: (state) => [state.items, state.status],
    });`}
            />
            <div className="h-4" />

            {/* Updated layout: CodeLine (2/3) and value (1/4) vertically stacked */}
            <div className="flex flex-col gap-2 w-full">
                <div className="flex w-full">
                    <div className="w-3/4">
                        <CodeLine code={`cart.items.get().length`} />
                    </div>
                    <div className="w-1/4 p-1 px-4 text-white  bg-blue-500 rounded">
                        {cart.items.get().length} items
                    </div>
                </div>

                <div className="flex w-full">
                    <div className="w-3/4">
                        <CodeLine code={`cart.total.get()`} />
                    </div>
                    <div className="w-1/4 p-1 px-4 text-white  bg-blue-500 rounded">
                        Total: $ {cart.total.get()}
                    </div>
                </div>
            </div>
        </FlashWrapper>
    );
};
export const CartOverviewFully = () => {
    const cart = useCogsState("cart", {
        reactiveType: ["all"],
    });
    const products = useCogsState("products", {
        reactiveType: ["all"],
    });

    return (
        <FlashWrapper
            color="bg-gray-500"
            componentId={cart._componentId!}
            title="Fully Reactive"
        >
            <CodeLine
                code={`    const cart = useCogsState("cart", {
        reactiveType: ["all"],
    });
    const products = useCogsState("products", {
        reactiveType: ["all"],
    });;`}
            />
            <div className="h-4" />

            {/* Updated layout: CodeLine (2/3) and value (1/4) vertically stacked */}
            <div className="flex flex-col gap-2 w-full">
                <div className="flex w-full">
                    <div className="w-3/4">
                        <CodeLine code={`cart.items.get().length`} />
                    </div>
                    <div className="w-1/4 p-1 px-4 text-white  bg-blue-500 rounded">
                        {cart.items.get().length} items
                    </div>
                </div>

                <div className="flex w-full">
                    <div className="w-3/4">
                        <CodeLine code={`cart.total.get()`} />
                    </div>
                    <div className="w-1/4 p-1 px-4 text-white  bg-blue-500 rounded">
                        Total: $ {cart.total.get()}
                    </div>
                </div>
            </div>
        </FlashWrapper>
    );
};

export const CartOverview = () => {
    const cart = useCogsState("cart");
    const products = useCogsState("products");

    return (
        <FlashWrapper
            color="bg-emerald-500"
            componentId={cart._componentId!}
            title="Signal Based - $get()"
        >
            <CodeLine code={`const cart = useCogsState("cart")`} />{" "}
            <div className="h-4" />
            {/* Updated layout: CodeLine (2/3) and value (1/4) vertically stacked */}
            <div className="flex flex-col gap-2 w-full">
                <div className="flex w-full">
                    <div className="w-3/4">
                        <CodeLine
                            code={`cart.items.$derive((state) => state.length)`}
                        />
                    </div>
                    <div className="w-1/4 p-1 px-4 text-white  bg-blue-500 rounded">
                        {cart.items.$derive((state) => state.length || 0) ||
                            "0"}{" "}
                        items
                    </div>
                </div>

                <div className="flex w-full">
                    <div className="w-3/4">
                        <CodeLine code={`cart.total.$get()`} />
                    </div>
                    <div className="w-1/4 p-1 px-4 text-white  bg-blue-500 rounded">
                        Total: $ {cart.total.$get()}
                    </div>
                </div>
            </div>
        </FlashWrapper>
    );
};
