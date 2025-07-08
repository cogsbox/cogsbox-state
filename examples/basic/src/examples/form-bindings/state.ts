import { createCogsState, type StateObject } from '@lib/CogsState';
// Form data state
const formDataState = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  country: 'us',
  theme: 'dark' as 'light' | 'dark' | 'auto',
  newsletter: false,
  daysOfWeek: [] as number[],
};

// Advanced form state
const advancedFormState = {
  fastField: '',
  slowField: '',
  selectedTags: [] as string[],
};

// Toggle demo state
const toggleDemoState = {
  simpleToggle: false,
  checkboxToggle: false,
  selectedIds: [] as number[],
};

export const { useCogsState } = createCogsState({
  formData: { initialState: formDataState },
  advancedForm: { initialState: advancedFormState },
  toggleDemo: { initialState: toggleDemoState },
});
