import { createCogsState } from "../../CogsState";

type User = {
  id: number;
  name: string;
  age: number;
  email: string;
};

type Setting = {
  id: number;
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
  user: { tableName: "users", pk: "id" },
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
// Mock fetch function to simulate API requests
export async function mockFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  // Parse URL to determine endpoint
  const urlParts = url.replace(/^https?:\/\/[^\/]+\/api\//, "").split("/");
  const endpoint = urlParts[0];
  console.log("endpoint", endpoint);
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  let responseData: any;
  let status = 200;

  switch (endpoint) {
    case "state":
      // Handle state endpoint: /api/state/{stateKey}/{stateId}
      if (urlParts.length >= 3) {
        const stateKey = urlParts[1]!;
        const stateId = urlParts[2]!;

        // GET request
        if (!options || options.method === "GET" || !options.method) {
          responseData = getStateData(stateKey, stateId);
        }
        // PUT request
        else if (options.method === "PUT" && options.body) {
          const newData = JSON.parse(options.body.toString());
          responseData = updateStateData(stateKey, stateId, newData);
        }
      } else {
        status = 400;
        responseData = { error: "Invalid state endpoint URL" };
      }
      break;

    default:
      status = 404;
      responseData = { error: "Endpoint not found" };
  }

  // Create mock response
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => responseData,
    text: async () => JSON.stringify(responseData),
    headers: new Headers({ "Content-Type": "application/json" }),
  } as Response;
}

// Helper function to get state data
function getStateData(stateKey: string, stateId: string): any {
  if (config[stateKey]) {
    const { tableName, pk } = config[stateKey];
    const item = mockDatabase[tableName!]!.find(
      (item) => item[pk].toString() === stateId
    );

    return item || { error: "Item not found" };
  } else if (stateKey in mockDatabase) {
    return (mockDatabase as any)[stateKey];
  }
  return { error: "Unknown state key" };
}

// Helper function to update state data
function updateStateData(stateKey: string, stateId: string, newData: any): any {
  if (config[stateKey]) {
    const { tableName, pk } = config[stateKey];
    const index = mockDatabase[tableName]!.findIndex(
      (item) => item[pk].toString() === stateId
    );

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
export const { useCogsState } = createCogsState({
  testUser: initialUserState,
});
