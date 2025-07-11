import { useState } from 'react';
import { createCogsState } from '../../../../../src/CogsState';
import { useSync, useSyncReact } from './SyncProvider';
import { SyncProviderSPA } from './SyncProviderSpa';

const userState: UserType = {
  name: 'test',
  age: 30,
  email: 'test@test.com',
};

type UserType = {
  name: string;
  age: number;
  email: string;
};

const allSchemas = {
  user: userState,
};

const { useCogsState } = createCogsState(allSchemas);

export default function SyncExample() {
  // const state = useCogsState('user');

  const [state, update, details] = useSyncReact(useState(userState), {
    syncKey: 'user',
    syncId: 'teset-chat',
    connect: true,
  });

  return <SyncProviderSPA>Sync Example</SyncProviderSPA>;
}
