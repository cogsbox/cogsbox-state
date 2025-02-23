import { createCogsState } from "../../CogsState";

interface Product {
    id: number | string;
    name: string;
    price: number;
    stock: number;
    category: string;
}

type Products = { items: Product[]; category: string };

interface CartItem {
    id: number | string;
    productId: number | string;
    quantity: number;
    unitPrice: number;
}
type Cart = { items: CartItem[]; total: number; isOpen: boolean };

type StateType = {
    products: Products;
    cart: Cart;
};

const dbState: StateType = {
    products: {
        items: [
            {
                id: 1,
                name: "T-Shirt",
                price: 5,
                stock: 100,
                category: "clothing",
            },
            {
                id: 2,
                name: "Jeans",
                price: 10,
                stock: 50,
                category: "clothing",
            },
            {
                id: 3,
                name: "Sneakers",
                price: 25,
                stock: 30,
                category: "shoes",
            },
        ],
        category: "Clothing",
    },
    cart: {
        items: [] as CartItem[],
        isOpen: false,
        total: 0,
    },
};

export const { useCogsState } = createCogsState(dbState);
