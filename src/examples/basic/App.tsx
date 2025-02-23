import { CartOverview, CartOverviewDep, CartOverviewGet } from "./CartOvervlew";
import { ProductList } from "./ProductList";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import LivePreview from "./Sandbox";

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
            <div className="flex items-start justify-center ">
                <div className="bg-sky-100 rounded-lg p-6 grid grid-cols-2 gap-2">
                    <div className="bg-white rounded-lg p-6">
                        <ProductList />
                    </div>
                    <div className="">
                        <CartOverviewGet />
                        <div className="h-4" />
                        <CartOverview />
                        <div className="h-4" />
                        <CartOverviewDep />
                    </div>
                </div>
                <div className="w-6" />
                <div className="bg-gray-900 p-2 rounded-lg">
                    <SyntaxHighlighter
                        language="typescript"
                        style={vscDarkPlus}
                        showLineNumbers
                    >
                        {codeString}
                    </SyntaxHighlighter>
                </div>
            </div>
            {/* <LivePreview /> */}
        </div>
    );
}
