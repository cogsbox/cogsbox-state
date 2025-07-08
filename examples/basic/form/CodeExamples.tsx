import React, { useEffect, useState, useRef } from 'react';
import CodeLine from '../src/CodeLine';
import { useCogsState } from './state';

const CodeExampleDropdown = () => {
  const [selectedExample, setSelectedExample] = useState('global');

  const user = useCogsState('user');

  useEffect(() => {
    const formRefs = user.getAllFormRefs();
    if (formRefs) {
      const fieldToExampleMap = {
        'user.firstName': 'firstName',
        'user.lastName': 'lastName',
        'user.email': 'email',
        'user.phone': 'phone',
        'user.addresses.0.street': 'street',
        'user.addresses.0.isDefault': 'isDefault',
      } as any;

      formRefs.forEach((refElement, key) => {
        if (refElement && refElement.current) {
          const mappedExample = fieldToExampleMap[key];
          if (mappedExample) {
            refElement.current.addEventListener('focus', () => {
              setSelectedExample(mappedExample);
            });
          }
        }
      });
    }
  }, []);

  // List of available examples
  const exampleOptions = [
    { id: 'global', label: 'Global Validation Setup' },
    { id: 'firstName', label: 'First Name Field' },
    { id: 'lastName', label: 'Last Name Field' },
    { id: 'email', label: 'Email Address Field' },
    { id: 'phone', label: 'Phone Number Field' },
    { id: 'street', label: 'Street Address Field' },
    { id: 'isDefault', label: 'Default Checkbox Field' },
  ];

  const getExampleCode = (exampleId: string) => {
    // Return the appropriate code example based on the example ID
    switch (exampleId) {
      case 'global':
        return `setCogsOptions("user", {
  validation: {
    key: "userValidation",
    zodSchema: userSchema,
  },
  formElements: {
    validation: ({ children, active, message }) => (


      <div>
        {children}
        {active && <div className="error-message">{message}</div>}
      </div>
    ),
  },
});`;
      case 'firstName':
        return `{user.firstName.formElement((params) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">
      First Name
    </label>
    <input
      type="text"
      className={\`mt-1 block w-full rounded-md border-2 border-amber-400 
      p-2 focus:border-amber-600 focus:ring-amber-600 \${
        params.validationErrors().length > 0
          ? "border-red-500"
          : ""
      }\`}
      value={params.get()}
      onChange={(e) => params.set(e.target.value)}
      ref={params.inputProps.ref} // Important: This connects to the ref system
    />
  </div>
))}`;
      case 'lastName':
        return `       
    {user.lastName.formElement(
    (params) => (
        <div>
        <label className="block text-sm font-medium text-gray-700">
            Last Name
        </label>
        <input
            type="text"
            className="mt-1 block w-full rounded-md border-2 border-amber-400 p-2 focus:border-amber-600 focus:ring-amber-600"
            {...params.inputProps}
            // inputProps already includes the ref
        />
        </div>
    ),
    {
        validation: {
        message: "Please enter your last name",
        },
    }
    )}
    `;
      case 'email':
        return `{user.email.formElement(
  (params) => (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Email Address
      </label>
      <input
        {...params.inputProps}
        type="email"
        className={\`mt-1 block w-full rounded-md border-2 border-amber-400 p-2 focus:border-amber-600 focus:ring-amber-600 \${
          params.validationErrors().length > 0
            ? "border-red-500"
            : ""
        }\`}
        // inputProps already includes the ref
      />
    </div>
  ),
  {
    validation: {
      message: "Please enter a valid email address",
    },
  }
)}`;
      case 'phone':
        return `{user.phone.formElement(
    (params) => (
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          className="mt-1 block w-full rounded-md border-2 border-amber-400 p-2 focus:border-amber-600 focus:ring-amber-600"
          {...params.inputProps}
          onBlur={(e) => {
            if (
              e.target.value.length == 0 ||
              isNaN(Number(e.target.value))
            ) {
              params.addValidationError("custom onBlur");
            }
          }}
          placeholder="(555) 123-4567"
        />
      </div>
    ),
    {
      validation: {
        message: "Please enter a valid phone number",
      },
    }
  )}`;
      case 'street':
        return `{user.addresses
  .index(currentAddressIndex)
  .street.formElement(
    (params) => (
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Street
        </label>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-2 border-amber-400 p-2 focus:border-amber-600 focus:ring-amber-600"
          value={params.get()}
          onChange={(e) => params.set(e.target.value)}
          ref={params.inputProps.ref} // Important: This connects to the ref system
        />
      </div>
    ),
    {
      validation: {
        message: "Street address is required",
      },
    }
  )}`;
      case 'isDefault':
        return `{user.addresses
  .index(currentAddressIndex)
  .isDefault.formElement((params) => (
    <div className="flex items-center">
      <input
        type="checkbox"
        className="h-4 w-4 text-amber-400 focus:ring-amber-400 border-amber-300 rounded"
        checked={params.get()}
        onChange={(e) => params.set(e.target.checked)}
        id={\`default-address-\${currentAddressIndex}\`}
        ref={params.inputProps.ref} // Important: This connects to the ref system
      />
      <label
        htmlFor={\`default-address-\${currentAddressIndex}\`}
        className="ml-2 block text-sm text-gray-700"
      >
        Set as default address
      </label>
    </div>
  ))}`;
      default:
        return '// Select an example to see its implementation';
    }
  };

  const getExampleDescription = (exampleId: String) => {
    switch (exampleId) {
      case 'global':
        return 'This is the configuration that enables validation across all form elements';
      case 'firstName':
        return 'Basic form element with manual value and onChange handling. Focus on this field to see this example.';
      case 'lastName':
        return 'Using the inputProps shorthand and custom validation rendering. Focus on this field to see this example.';
      case 'email':
        return 'Form element with custom validation message. Focus on this field to see this example.';
      case 'phone':
        return 'Form element with placeholder and inline validation errors. Focus on this field to see this example.';
      case 'street':
        return 'Nested form element for arrays using index(). Focus on this field to see this example.';
      case 'isDefault':
        return 'Checkbox implementation with label. Focus on this field to see this example.';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      {/* Dropdown selector */}
      <div className="mb-6">
        <select
          className="w-full p-2 border-2 border-gray-300 rounded-md"
          value={selectedExample}
          onChange={(e) => setSelectedExample(e.target.value)}
        >
          {exampleOptions.map((example) => (
            <option key={example.id} value={example.id}>
              {example.label}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <p className="mb-4 text-gray-600">
        {getExampleDescription(selectedExample)}
      </p>

      {/* Code example */}
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">
          {exampleOptions.find((e) => e.id === selectedExample)?.label}
        </h4>
      </div>
      <CodeLine style="dark" code={getExampleCode(selectedExample)} />
    </div>
  );
};

export default CodeExampleDropdown;
