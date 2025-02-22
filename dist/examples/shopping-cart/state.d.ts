interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    category: string;
}
interface CartItem {
    id: number;
    productId: number;
    quantity: number;
    unitPrice: number;
}
export declare const useCogsState: <StateKey extends "products" | "cart">(stateKey: StateKey, options?: import('../..').OptionsType<import('../..').TransformedStateType<{
    products: {
        items: Product[];
        filters: {
            category: string;
            searchTerm: string;
            maxPrice: number;
        };
    };
    cart: {
        items: CartItem[];
        isOpen: boolean;
        total: number;
    };
}>[StateKey]> | undefined) => readonly [import('../..').TransformedStateType<{
    products: {
        items: Product[];
        filters: {
            category: string;
            searchTerm: string;
            maxPrice: number;
        };
    };
    cart: {
        items: CartItem[];
        isOpen: boolean;
        total: number;
    };
}>[StateKey], import('../..').StateObject<import('../..').TransformedStateType<{
    products: {
        items: Product[];
        filters: {
            category: string;
            searchTerm: string;
            maxPrice: number;
        };
    };
    cart: {
        items: CartItem[];
        isOpen: boolean;
        total: number;
    };
}>[StateKey]>];
export {};
