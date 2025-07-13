import { s, schema } from 'cogsbox-shape';
import { createCogsState } from '../../../../../src/CogsState';

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
export const userState: UserType = {
  name: 'test',
  age: 30,
  email: 'test@test.com',
};
const allSchemas = {
  user: userState,
};
type AllSchemas = typeof allSchemas;
const cogsStateHooks = createCogsState(allSchemas);

// Re-export as const to break the type chain
export const useCogsState = cogsStateHooks.useCogsState;
