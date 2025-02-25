import { createCogsState } from "../../CogsState";

type StateType = {
    products: {
        items: {
            id: number | string;
            name: string;
            price: number;
            stock: number;
            category: string;
        }[];
        category: string;
    };
    cart: {
        items: {
            id: number | string;
            productId: number | string;
            quantity: number;
        }[];
        total: number;
        isOpen: boolean;
        status: "open" | "closed";
    };
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
        items: [],
        isOpen: false,
        total: 0,
        status: "open",
    },
};

export const { useCogsState } = createCogsState(dbState);
