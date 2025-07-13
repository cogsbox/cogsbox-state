import SyncUser from '../user-sync/SyncUser';

import { SyncProviderSPA } from './SyncProviderSpa';

export default function SyncExample() {
  return (
    <SyncProviderSPA>
      <SyncUser />
    </SyncProviderSPA>
  );
}
