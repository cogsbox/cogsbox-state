import { CartOverview } from "./CartOvervlew";
import { ProductList } from "./ProductList";

export default function App() {
    return (
        <div className="bg-red-500 p-10">
            Hello World
            <CartOverview />
            <div className="h-12" />
            <ProductList />
        </div>
    );
}
