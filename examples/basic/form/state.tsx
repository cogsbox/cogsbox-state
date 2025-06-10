// state.ts

import { z } from "zod";
import { createCogsState } from "../../../src/CogsState";

export type Address = {
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
  addresses: Address[];
};

// Initial state with user and nested addresses
const initialState: StateType = {
  addresses: [],
  user: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addresses: [
      {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "USA",
        isDefault: false,
      },
    ],
  },
};

// Address schema with simple validations
const addressSchema = z.object({
  street: z.string().min(2, "Street is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Valid zip code is required"),
  country: z.string().min(2, "Country is required"),
  isDefault: z.boolean(),
});

// User schema with simple validations
const userSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  addresses: z.array(addressSchema).min(1, "At least one address is required"),
});

// Create the CogsState with validation
export const { useCogsState, setCogsOptions } = createCogsState(initialState);

// Set up additional options for specific state keys

setCogsOptions("user", {
  validation: {
    key: "userValidation",
    zodSchema: userSchema as any,
    onBlur: true,
  },
  formElements: {
    validation: ({ children, active, message }) => (
      <div>
        {children}{" "}
        {active && <span className="font-bold text-red-500  ">{message}</span>}
      </div>
    ),
  },
});
