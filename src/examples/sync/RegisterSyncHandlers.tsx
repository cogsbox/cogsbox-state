import { mockFetch } from "./MockDB";
import { useSyncContext } from "./SyncProvider";

export default function RegisterSyncHandlers() {
  const { registerHandlers } = useSyncContext();

  // Handler for fetching state
  const fetchStateHandler = async (syncKey: string): Promise<any> => {
    try {
      // Parse the sync key to get components
      const [serviceId, userId, stateKey, stateId] = syncKey.split("-");

      // Fetch data from your API
      const response = await mockFetch(
        `https://goot.co.uk:60002/api/state/${stateKey}/${stateId}`
      );

      const data = await response.json();

      return data;
    } catch (error: any) {
      throw error;
    }
  };

  // Handler for updating state
  const updateStateHandler = async (
    syncKey: string,
    newData: any
  ): Promise<any> => {
    try {
      // Parse the sync key to get components
      const [serviceId, userId, stateKey, stateId] = syncKey.split("-");
      console.log("updateStateHandler", serviceId, userId, stateKey, stateId);
      // Update data via your API
      const response = await mockFetch(
        `https://goot.co.uk:60002/api/state/${stateKey}/${stateId}`,
        { body: JSON.stringify(newData) }
      );

      const result = await response.json();

      return result;
    } catch (error: any) {
      throw error;
    }
  };
  registerHandlers(fetchStateHandler, updateStateHandler);
  return null;
}
