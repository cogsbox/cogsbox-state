import { CartOverview, CartOverviewDep, CartOverviewGet } from "./CartOvervlew";
import { ProductList } from "./ProductList";

export default function App() {
    return (
        <div className="flex items-center justify-center ">
            <div className="bg-orange-100 rounded-lg p-6 flex gap-2">
                <div className="bg-white rounded-lg p-6">
                    <ProductList />{" "}
                </div>
                <div className="">
                    <CartOverviewGet />
                    <div className="h-4" />
                    <CartOverview />
                    <div className="h-4" />
                    <CartOverviewDep />
                </div>
            </div>
        </div>
    );
}
