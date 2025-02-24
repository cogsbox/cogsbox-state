import { CartOverview, CartOverviewDep, CartOverviewGet } from "./CartOvervlew";
import { ProductList } from "./ProductList";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import React from "react";

const CartComponentsDescription = () => {
    return (
        <div className="bg-white rounded-lg p-6 w-full space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Component Reactive - get()
                </h2>
                <p className="text-gray-600">
                    This component demonstrates how values accessed with get()
                    automatically trigger re-renders when they change. While
                    straightforward to use, it re-renders the entire component
                    on any state change, making it ideal for simpler UIs or when
                    you need to track all state changes.
                </p>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Reactive Dependencies
                </h2>
                <p className="text-gray-600">
                    A more optimized approach where you specify exactly which
                    parts of the state should cause re-renders using
                    reactiveDeps. This provides better control over component
                    updates and improved performance since the component only
                    re-renders when those specific dependencies change.
                </p>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Signal Based - $get()
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

export default function App() {
    const codeString = ` const cart = useCogsState("cart");
        const products = useCogsState("products");
    
        return (
            <>
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
            </>
        );`;

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="h-6" />
            <div className="w-[1600px]">
                <div className="w-full  bg-sky-50 rounded-lg p-6 flex flex-col gap-4">
                    <div className="bg-white rounded-lg p-6 w-full flex gap-4">
                        <ProductList />
                        <CartComponentsDescription />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <CartOverviewGet />
                        <CartOverviewDep />

                        <CartOverview />
                    </div>
                </div>
            </div>{" "}
            {/* <div className="bg-gray-900 p-2 rounded-lg ">
                    <SyntaxHighlighter
                        language="typescript"
                        style={vscDarkPlus}
                        showLineNumbers
                    >
                        {codeString}
                    </SyntaxHighlighter>
                </div> */}
        </div>
    );
}
