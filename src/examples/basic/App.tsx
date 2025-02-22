import { CartOverview } from "./CartOvervlew";
import { ProductList } from "./ProductList";

export default function App() {
    return (
        <div>
            Hello World
            <CartOverview />
            <div className="h-12" />
            <ProductList />
        </div>
    );
}
