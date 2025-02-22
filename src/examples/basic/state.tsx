import { createCogsState } from "../../CogsState";

interface Product {
    id: number | string;
    name: string;
    price: number;
    stock: number;
    category: string;
}

interface CartItem {
    id: number | string;
    productId: number | string;
    quantity: number;
    unitPrice: number;
}

const dbState = {
    products: {
        items: [
            {
                id: 1,
                name: "T-Shirt",
                price: 29.99,
                stock: 100,
                category: "clothing",
            },
            {
                id: 2,
                name: "Jeans",
                price: 59.99,
                stock: 50,
                category: "clothing",
            },
            {
                id: 3,
                name: "Sneakers",
                price: 89.99,
                stock: 30,
                category: "shoes",
            },
        ] as Product[],
        filters: {
            category: "all",
            searchTerm: "",
            maxPrice: 100,
        },
    },
    cart: {
        items: [] as CartItem[],
        isOpen: false,
        total: 0,
    },
};

export const { useCogsState } = createCogsState(dbState);
