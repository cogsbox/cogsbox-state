// state.ts
import { z, ZodSchema } from "zod";
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
    firstName: "",
    lastName: "Doe",
    email: "",
    phone: "(555) 123-4567",
    addresses: [
      {
        street: "123 Main St",
        city: "Anytown",
        state: "",
        zipCode: "12345",
        country: "USA",
        isDefault: true,
      },
    ],
  },
};
const userSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  addresses: z.array(
    z.object({
      street: z.string().min(2),
      city: z.string().min(2),
      state: z.string().min(2),
      zipCode: z.string().min(5),
      country: z.string().min(2),
      isDefault: z.boolean(),
    })
  ),
});

// Create the CogsState with validation
export const { useCogsState, setCogsOptions } = createCogsState(initialState);

// Set up additional options for specific state keys
setCogsOptions("user", {
  validation: {
    key: "userValidation",
    zodSchema: userSchema,
  },
  formElements: {
    validation: ({ children, active, message }) => (
      <div>
        {active ? (
          <div className="font-bold text-red-500  ">
            {" "}
            {children}
            {message}
          </div>
        ) : (
          children
        )}
      </div>
    ),
  },
});
