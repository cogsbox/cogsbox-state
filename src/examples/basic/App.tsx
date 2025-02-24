import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ProductList } from "./ProductList";
import {
    CartOverview,
    CartOverviewDep,
    CartOverviewFully,
    CartOverviewGet,
} from "./CartOvervlew";
import { TriangleAlert } from "lucide-react";

const CartComponentsDescription = () => {
    return (
        <div className="bg-white rounded-lg p-6 w-full space-y-6">
            This showcases teh various reactivity types and how they work. The
            default is reactiveType: ["component","deps"]. So any values used in
            the component and any dependencies will trigger a rerender. If you
            want to only rerender when a value changes, you can use the
            reactiveType: ["component"]. If you want to rerender only when a
            dependency changes, you can use the reactiveType: ["deps"].
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2 flex gap-2">
                    <div className="rounded-full h-8 w-8 bg-orange-500" />{" "}
                    Component Reactive - get()
                </h2>
                <p className="text-gray-600">
                    This component demonstrates how values accessed wiothin the
                    component by using non "$" functions automatically trigger
                    re-renders when they change. This is the default behavior,
                    essentially limiting rerenders to state it actuallky uses.
                </p>
            </div>
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2 flex gap-2">
                    <div className="rounded-full h-8 w-8 bg-sky-500" /> Reactive
                    Dependencies
                </h2>
                <p className="text-gray-600">
                    A more optimized approach where you specify exactly which
                    parts of the state should cause re-renders using
                    reactiveDeps.{" "}
                </p>{" "}
                <p className="text-gray-600">
                    <span className="text-red-500">
                        <TriangleAlert size={24} className="inline-block" />
                        This has its risks. If you update a property price it
                        does not update the component because
                        "products.items[*].price" is never actually directly
                        used in the component. The total price of the cart is
                        derived in the inital form.
                        <TriangleAlert size={24} className="inline-block" />
                    </span>{" "}
                </p>{" "}
            </div>
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2 flex gap-2">
                    <div className="rounded-full h-8 w-8 bg-emerald-500" />{" "}
                    Reactive Dependencies Signal Based - $get()
                </h2>
                <p className="text-gray-600">
                    The most efficient implementation using signals ($get(),
                    $derive()). Instead of re-rendering the whole component, it
                    only updates the specific DOM elements that depend on
                    changed values. This makes it ideal for complex UIs or
                    components that update frequently.
                </p>
            </div>
        </div>
    );
};

const CodeToggleWrapper = ({
    children,
    code,
}: {
    children: React.ReactNode;
    code: string;
}) => {
    const [showCode, setShowCode] = useState(false);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end">
                <button
                    onClick={() => setShowCode(!showCode)}
                    className="px-3 py-1 text-sm bg-gray-800 text-white rounded hover:bg-gray-700"
                >
                    {showCode ? "Hide Code" : "Show Code"}
                </button>
            </div>{" "}
            {showCode && (
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <SyntaxHighlighter
                        language="typescript"
                        style={vscDarkPlus}
                        customStyle={{ margin: 0 }}
                    >
                        {code}
                    </SyntaxHighlighter>
                </div>
            )}
            {children}
        </div>
    );
};

// Modified App component with code toggles
export default function App() {
    const cartOverviewFullCode = ` 
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
                code={\`    const cart = useCogsState("cart", {
        reactiveType: ["all"],
    });
    const products = useCogsState("products", {
        reactiveType: ["all"],
    });;\`}
            />
            <div className="h-4" />

            {/* Updated layout: CodeLine (2/3) and value (1/3) vertically stacked */}
            <div className="flex flex-col gap-2 w-full">
                <div className="flex w-full">
                    <div className="w-2/3">
                        <CodeLine code={\`cart.items.get().length\`} />
                    </div>
                    <div className="w-1/3 p-1 px-4 border-2 border-blue-500 rounded-lg">
                        {cart.items.get().length} items
                    </div>
                </div>

                <div className="flex w-full">
                    <div className="w-2/3">
                        <CodeLine code={\`cart.total.get()\`} />
                    </div>
                    <div className="w-1/3 p-1 px-4 border-2 border-blue-500 rounded-lg">
                        Total: $ {cart.total.get()}
                    </div>
                </div>
            </div>

            <div className="h-4" />
            <CodeLine code={\`cart.items.stateMap((item, setter) =>\`} />
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
    );`;

    const cartOverviewGetCode = `export const CartOverviewGet = () => {
    const cart = useCogsState("cart");
    const products = useCogsState("products");

    return (
        <FlashWrapper
            color="bg-orange-500"
            componentId={cart._componentId!}
            title="Component Reactive - get()"
        >
            <CodeLine code={\`cart.items.get().length\`} />
            <div className="flex gap-2 w-full">
                <div className="basis-1/2">
                    <div className="p-1 px-4 border-2 border-blue-500 rounded-b-lg">
                        {cart.items.get().length} items
                    </div>
                </div>
                <div className="basis-1/2">
                    <div className="p-1 px-4 border-2 border-blue-500 rounded-b-lg">
                        Total: $ {cart.total.get()}
                    </div>
                </div>
            </div>
            {cart.items.get().map((item) => {
                const product = products.items.findWith("id", item.productId);
                return (
                    <div key={item.id}>
                        {product?.name.get()} - Qty: {item.quantity}
                        <button onClick={() => cart.items.findWith("productId", item.productId).cut()}>
                            Remove
                        </button>
                    </div>
                );
            })}
        </FlashWrapper>
    );
}`;

    const cartOverviewDepCode = `export const CartOverviewDep = () => {
    const cart = useCogsState("cart", {
        reactiveType: ["deps"],
        reactiveDeps: (state) => [state.items, state.status],
    });
    const products = useCogsState("products");

    return (
        <FlashWrapper
            color="bg-sky-500"
            componentId={cart._componentId!}
            title="Reactive Dependencies"
        >
            {cart.items.stateMap((item, setter) => {
                const product = products.items.findWith("id", item.productId);
                return (
                    <div key={item.id}>
                        {product?.name.get()} - Qty: {item.quantity}
                        <button onClick={() => setter.cut()}>
                            Remove
                        </button>
                    </div>
                );
            })}
        </FlashWrapper>
    );
}`;

    const cartOverviewCode = `export const CartOverview = () => {
    const cart = useCogsState("cart");
    const products = useCogsState("products");

    return (
        <FlashWrapper
            color="bg-emerald-500"
            componentId={cart._componentId!}
            title="Signal Based - $get()"
        >
            <div className="flex gap-2 w-full">
                <div className="basis-1/2">
                    {cart.items.$derive((state) => state.length || 0)} items
                </div>
                <div className="basis-1/2">
                    Total: $ {cart.total.$get()}
                </div>
            </div>
            {cart.items.$stateMap((item, setter) => {
                const product = products.items.findWith("id", item.productId);
                return (
                    <div key={item.id}>
                        {product.name.$get()} - Qty: {item.quantity}
                        <button onClick={() => setter.cut()}>
                            Remove
                        </button>
                    </div>
                );
            })}
        </FlashWrapper>
    );
}`;
    console.log(CartOverviewFully.toString());
    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="h-6" />
            <div className="w-[90%]">
                <div className="w-full bg-sky-50 rounded-lg p-6 flex flex-col gap-4">
                    <div className="bg-white rounded-lg p-6 w-full flex gap-4">
                        <CartComponentsDescription />
                        <div className="rounded-lg border-2 border-blue-500">
                            <ProductList />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <CodeToggleWrapper code={cartOverviewFullCode}>
                            <CartOverviewFully />
                        </CodeToggleWrapper>
                        <CodeToggleWrapper code={cartOverviewGetCode}>
                            <CartOverviewGet />
                        </CodeToggleWrapper>{" "}
                        <CodeToggleWrapper code={cartOverviewDepCode}>
                            <CartOverviewDep />
                        </CodeToggleWrapper>
                        <CodeToggleWrapper code={cartOverviewCode}>
                            <CartOverview />
                        </CodeToggleWrapper>
                    </div>
                </div>
            </div>
        </div>
    );
}
