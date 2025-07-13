'use client';
import { createCogsState } from './CogsState';
import { z } from 'zod';

type UserType = {
  name: string;
  age: number;
  email: string;
};
export const userState: UserType = {
  name: 'test',
  age: 30,
  email: 'test@test.com',
};
const allSchemas = {
  user: userState,
};
export const { useCogsState } = createCogsState(allSchemas);
// src/pages/CogsStateSyncPage.tsx

// --- Reusable Utility Components (same as above) ---

// --- Main Form Components ---
const schema = z.object({
  name: z.string().min(1),
  age: z.number().min(1),
  email: z.string().email(),
});
function CogsStateForm() {
  const syncKeyGet = window.location.search.split('syncKey=')[1];
  const syncState = useCogsState('user', {
    validation: {
      key: 'user.name',
      zodSchema: schema,
    },
  });

  return <></>;
}
