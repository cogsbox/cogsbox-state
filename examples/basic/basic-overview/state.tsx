import { v4 as uuidv4 } from 'uuid';

import { createCogsState, type StateObject } from '@lib/CogsState';
import { FlashWrapper } from '../FlashOnUpdate';
export type TodoItem = {
  id: string;
  text: string;
  done: boolean;
};

export type AppState = {
  simpleCounter: number;
  inputMessage: string;
  isBooleanValue: boolean;
  todoList: TodoItem[];
  daysOfWeek: number[];
  // Additional form fields
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  newsletter: boolean;
  theme: 'light' | 'dark' | 'auto';
};

// --- Initial state ---
const initialAppState: AppState = {
  simpleCounter: 0,
  inputMessage: 'Hello Cogs State!',
  isBooleanValue: false,
  todoList: [
    { id: uuidv4(), text: 'Initial Todo 1', done: false },
    { id: uuidv4(), text: 'Initial Todo 2 (Done)', done: true },
    { id: uuidv4(), text: 'Initial Todo 3', done: false },
  ],
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
  appData: initialAppState,
});
