import { useSync } from './SyncProvider';
import { SyncProviderSPA } from './SyncProviderSpa';
import SyncUser from './SyncUser';

export default function SyncExample() {
  return (
    <SyncProviderSPA>
      <SyncUser />
    </SyncProviderSPA>
  );
}
