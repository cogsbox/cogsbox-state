import { CartOverview, CartOverviewDep, CartOverviewGet } from "./CartOvervlew";
import { ProductList } from "./ProductList";

export default function App() {
    return (
        <div className="flex items-center justify-center ">
            <div className="bg-white rounded-lg p-6 flex gap-2">
                <div className="bg-white rounded-lg p-6">
                    <ProductList />{" "}
                </div>
                <div className="h-12">
                    <CartOverviewGet />
                    <CartOverview />
                    <CartOverviewDep />
                </div>
            </div>
        </div>
    );
}
