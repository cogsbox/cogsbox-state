// state.ts
import { createCogsState } from "../../../CogsState";

type Address = {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
};

type User = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    addresses: Address[];
};

type StateType = {
    user: User;
};

// Initial state with user and nested addresses
const initialState: StateType = {
    user: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "(555) 123-4567",
        addresses: [
            {
                street: "123 Main St",
                city: "Anytown",
                state: "CA",
                zipCode: "12345",
                country: "USA",
                isDefault: true,
            },
        ],
    },
};

// Create the CogsState with validation
export const { useCogsState, setCogsOptions } = createCogsState(initialState);

// Set up additional options for specific state keys
setCogsOptions("user", {
    validationKey: "userValidation",
    formElements: {
        validation: ({ children, active, message }) => (
            <div className="form-field">
                {children}
                {active && <div className="error-message">{message}</div>}
            </div>
        ),
    },
});

// Sample validation utility functions
export const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? null : "Please enter a valid email address";
};

export const validateRequired = (
    value: string,
    fieldName: string
): string | null => {
    return value?.trim() ? null : `${fieldName} is required`;
};

export const validatePhone = (phone: string): string | null => {
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    return phoneRegex.test(phone)
        ? null
        : "Phone format should be (555) 123-4567";
};

export const validateZipCode = (zipCode: string): string | null => {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zipCode) ? null : "Please enter a valid ZIP code";
};
