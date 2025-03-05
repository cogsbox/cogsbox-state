import { createCogsState } from "../../CogsState";

type User = {
  id?: number;
  name: string;
  age?: number;
  email: string;
};

type Setting = {
  id?: number;
  userId: number;
  theme: string;
  notifications: boolean;
};

type Database = {
  users: User[];
  settings: Setting[];
  [key: string]: any[];
};

type ConfigType = {
  [key: string]: { tableName: string; pk: string };
};

const config: ConfigType = {
  users: { tableName: "users", pk: "id" },
  settings: { tableName: "settings", pk: "id" },
};

const mockDatabase: Database = {
  users: [
    {
      id: 1,
      name: "Alice Johnson",
      age: 28,
      email: "alice.johnson@example.com",
    },
    { id: 2, name: "Bob Smith", age: 35, email: "bob.smith@example.com" },
  ],
  settings: [
    { id: 1, userId: 1, theme: "dark", notifications: true },
    { id: 2, userId: 2, theme: "light", notifications: false },
  ],
};

// Direct function to get state data
export function getStateData(stateKey: string, stateId: string): any {
  console.log("getStateData-", mockDatabase);

  if (config[stateKey]) {
    const { tableName, pk } = config[stateKey];
    const item = mockDatabase[tableName]?.find(
      (item) => item[pk].toString() === stateId
    );
    return item || { error: "Item not found" };
  } else if (stateKey in mockDatabase) {
    return (mockDatabase as any)[stateKey];
  }

  return { error: "Unknown state key" };
}

// Direct function to update state data
export function updateStateData(
  stateKey: string,
  stateId: string,
  newData: any
): any {
  console.log("updateStateData--------------------", mockDatabase);

  if (config[stateKey]) {
    const { tableName, pk } = config[stateKey];
    const index = mockDatabase[tableName]?.findIndex(
      (item) => item[pk].toString() === stateId
    )!;

    if (index !== -1) {
      // Update existing record
      mockDatabase[tableName]![index] = {
        ...mockDatabase[tableName]![index],
        ...newData,
      };
      return mockDatabase[tableName]![index];
    } else {
      // Create new record
      const newRecord = {
        ...newData,
        [pk]: parseInt(stateId) || mockDatabase[tableName]!.length + 1,
      };
      mockDatabase[tableName]!.push(newRecord);
      return newRecord;
    }
  } else if (stateKey in mockDatabase) {
    (mockDatabase as any)[stateKey] = {
      ...(mockDatabase as any)[stateKey],
      ...newData,
    };
    return (mockDatabase as any)[stateKey];
  }

  return { error: "Unknown state key" };
}

export const initialUserState = {
  name: "",
  age: undefined,
  email: "",
};

export const { useCogsState } = createCogsState<{ testUser: User }>({
  testUser: initialUserState,
});
