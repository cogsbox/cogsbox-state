import { useState } from 'react';
import { createCogsState } from '../../../../../src/CogsState';
import { useSync, useSyncReact } from './SyncProvider';
import { SyncProviderSPA } from './SyncProviderSpa';
import { s, schema } from 'cogsbox-shape';

const userSchema = schema({
  _tableName: 'user',
  name: s.sql({ type: 'varchar', length: 100 }).initialState('test'),
  age: s.sql({ type: 'int' }).initialState(30),
  email: s.sql({ type: 'varchar', length: 100 }).initialState('test@test.com'),
});

type UserType = {
  name: string;
  age: number;
  email: string;
};
const userState: UserType = {
  name: 'test',
  age: 30,
  email: 'test@test.com',
};
const allSchemas = {
  user: userState,
};

const { useCogsState } = createCogsState(allSchemas);

export default function SyncUser() {
  const [state, setState] = useState(userState);

  const [syncState, update, details] = useSyncReact(state, setState, {
    syncKey: 'user',
    syncId: 'teset-chat',
    connect: true,
    inMemoryState: true,
  });

  console.log('SyncUser state', syncState);

  return (
    <>
      <div>
        Sync Example -
        <input
          className="bg-white border border-gray-700/50 rounded-lg p-4 flex flex-col gap-4 text-gray-200"
          onChange={(e) => {
            update((state) => ({
              ...state,
              name: e.target.value,
            }));
          }}
        />
      </div>
      <div className="bg-blue text-white">{syncState.name}</div>
    </>
  );
}
