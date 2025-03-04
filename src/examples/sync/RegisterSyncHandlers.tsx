import { getStateData, updateStateData } from "./MockDB";
import { useSyncContext } from "./SyncProvider";

export default function RegisterSyncHandlers() {
  const { registerHandlers } = useSyncContext();

  // Simple handler that directly calls getStateData
  const fetchStateHandler = (syncKey: string) => {
    const [, , stateKey, stateId] = syncKey.split("-");
    console;
    return getStateData(stateKey!, stateId!);
  };

  // Simple handler that directly calls updateStateData
  const updateStateHandler = (syncKey: string, newData: any) => {
    const [, , stateKey, stateId] = syncKey.split("-");
    return updateStateData(stateKey!, stateId!, newData);
  };

  registerHandlers(fetchStateHandler, updateStateHandler);
  return null;
}
