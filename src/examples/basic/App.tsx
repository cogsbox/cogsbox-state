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
import { useCogsState } from "./state";

const CartComponentsDescription = () => {
    return (
        <div className="bg-white rounded-lg p-6 w-full space-y-6 text-gray-600">
            <p>
                This showcase demonstrates different reactivity types and how
                they function. The default setting is reactiveType:
                ["component","deps"], which means any values used in the
                component and any dependencies will trigger a rerender. If you
                want to limit rerenders to only when a component value changes,
                use reactiveType: ["component"]. To rerender only when a
                dependency changes, use reactiveType: ["deps"].
            </p>
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2 flex gap-2">
                    <div className="rounded-full h-8 w-8 bg-gray-500" /> Fully
                    Reactive
                </h2>
                <p>
                    By setting reactiveType: ["all"], the component will
                    re-render in a standard React fashion whenever any value in
                    the state object changes.
                </p>
            </div>
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2 flex gap-2">
                    <div className="rounded-full h-8 w-8 bg-orange-500" />{" "}
                    Component Reactive
                </h2>
                <p>
                    This component demonstrates how values accessed within the
                    component using non "$" functions automatically trigger
                    re-renders when they change. This is the default behavior,
                    essentially limiting rerenders to state it actually uses.
                </p>
            </div>
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2 flex gap-2">
                    <div className="rounded-full h-8 w-8 bg-sky-500" /> Reactive
                    Dependencies
                </h2>
                <p>
                    A more optimized approach where you specify exactly which
                    parts of the state should cause re-renders using
                    reactiveDeps.
                </p>
                <p>
                    <span className="text-red-500">
                        <TriangleAlert size={24} className="inline-block" />
                        This approach has risks. If you update a property price,
                        it won't update the component because
                        "products.items[*].price" is never directly used in the
                        component. The total price of the cart is derived in the
                        initial form.
                        <TriangleAlert size={24} className="inline-block" />
                    </span>
                </p>
            </div>
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2 flex gap-2">
                    <div className="rounded-full h-8 w-8 bg-emerald-500" />{" "}
                    Reactive Dependencies Signal Based - $get()
                </h2>
                <p>
                    The most efficient implementation using signals ($get(),
                    $derive()). Instead of re-rendering the entire component, it
                    only updates the specific DOM elements that depend on
                    changed values. This makes it ideal for complex UIs or
                    components that require frequent updates.
                </p>
            </div>
        </div>
    );
};

function JSONView() {
    const cart = useCogsState("cart");

    return (
        <div>
            <pre>Cart: {JSON.stringify(cart.get(), null, 2)}</pre>
            <span className="text-gray-300">{cart._componentId}</span>
        </div>
    );
}
// Modified App component with code toggles
export default function App() {
    const [tab, setTab] = useState<"description" | "json">("description");
    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="h-6" />
            <div className="w-[90%]">
                <div className="w-full bg-sky-50 rounded-lg p-6 flex flex gap-4">
                    <div className="bg-white rounded-lg p-6 flex-1 flex gap-4">
                        {" "}
                        <div className="rounded-lg border-2 border-blue-500 w-[500px]">
                            <ProductList />
                        </div>
                        <div className="w-[700px] flex flex-col gap-1">
                            <div className="flex gap-1 items-center p-2 bg-gray-50">
                                <button
                                    className="border rounded-lg border-gray-600 hover:bg-gray-200 cursor-pointer bg-gray-100 text-gray-600 px-2  py-1"
                                    onClick={() => setTab("description")}
                                >
                                    Description
                                </button>
                                <button
                                    className="border rounded-lg border-gray-600 hover:bg-gray-200 cursor-pointer bg-gray-100 text-gray-600  px-2  py-1"
                                    onClick={() => setTab("json")}
                                >
                                    JSON
                                </button>{" "}
                            </div>
                            {tab == "description" && (
                                <CartComponentsDescription />
                            )}
                            {tab == "json" && <JSONView />}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 w-[700px]">
                        <CartOverviewFully />
                        <CartOverviewGet />
                        <CartOverviewDep />
                        <CartOverview />
                    </div>
                </div>
            </div>
        </div>
    );
}
