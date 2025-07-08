import { v4 as uuidv4 } from 'uuid';

import {
  createCogsState,
  type StateObject,
} from '../.../../../../../../src/CogsState';

export type TodoItem = {
  id: string;
  text: string;
  done: boolean;
};

export type TestState = {
  simpleCounter: number;
  simpleCounter2: number;
  inputMessage: string;
  isBooleanValue: boolean;
  isBooleanValue2: boolean;
  todoList: TodoItem[];
};
export type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  newsletter: boolean;
  theme: 'light' | 'dark' | 'auto';
  daysOfWeek: number[];
};
// --- Initial state ---
const initialAppState: TestState = {
  simpleCounter: 0,
  simpleCounter2: 0,
  inputMessage: 'Hello Cogs State!',
  isBooleanValue: false,
  isBooleanValue2: false,
  todoList: [
    { id: uuidv4(), text: 'Initial Todo 1', done: false },
    { id: uuidv4(), text: 'Initial Todo 2 (Done)', done: true },
    { id: uuidv4(), text: 'Initial Todo 3', done: false },
  ],
};
const formData: FormData = {
  daysOfWeek: [1, 3, 5],
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  country: 'us',
  newsletter: true,
  theme: 'auto',
};

// --- Create Cogs State Instance ---
export const { useCogsState } = createCogsState({
  testData: initialAppState,
  formData: formData,
});
