import React, { useState } from "react";
import CodeLine from "../CodeLine";

const CodeExampleDropdown = () => {
  const [selectedExample, setSelectedExample] = useState("global");

  // List of available examples
  const exampleOptions = [
    { id: "global", label: "Global Validation Setup" },
    { id: "firstName", label: "First Name Field" },
    { id: "lastName", label: "Last Name Field" },
    { id: "email", label: "Email Address Field" },
    { id: "phone", label: "Phone Number Field" },
    { id: "street", label: "Street Address Field" },
    { id: "isDefault", label: "Default Checkbox Field" },
  ];

  const getExampleCode = (exampleId: string) => {
    // Return the appropriate code example based on the example ID
    switch (exampleId) {
      case "global":
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
      case "firstName":
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
    />
  </div>
))}`;
      case "lastName":
        return `{user.lastName.formElement(
  (params) => (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Last Name
      </label>
      <input
        type="text"
        className="mt-1 block w-full rounded-md border-2 border-amber-400 p-2 focus:border-amber-600 focus:ring-amber-600"
        {...params.inputProps}
      />
      {params.validationErrors().map((error, index) => (
        <div key={index} className="text-red-500">
          <TriangleIcon className="inline-block" />
        </div>
      ))}
    </div>
  ),
  {
    validation: {
      hideMessage: true,
    },
  }
)}`;
      case "email":
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
      />
    </div>
  ),
  {
    validation: {
      message: "Please enter a valid email address",
    },
  }
)}`;
      case "phone":
        return `{user.phone.formElement(
  (params) => (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Phone Number
      </label>
      <input
        type="tel"
        className="mt-1 block w-full rounded-md border-2 border-amber-400 p-2 focus:border-amber-600 focus:ring-amber-600"
        value={params.get()}
        onChange={(e) => params.set(e.target.value)}
        placeholder="(555) 123-4567"
      />
      {params.validationErrors().length > 0 && (
        <div className="text-xs text-red-500 mt-1">
          {params.validationErrors().join(", ")}
        </div>
      )}
    </div>
  ),
  {
    validation: {
      message: "Please enter a valid phone number",
    },
  }
)}`;
      case "street":
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
        />
      </div>
    ),
    {
      validation: {
        message: "Street address is required",
      },
    }
  )}`;
      case "isDefault":
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
        return "// Select an example to see its implementation";
    }
  };

  const getExampleDescription = (exampleId: String) => {
    switch (exampleId) {
      case "global":
        return "This is the configuration that enables validation across all form elements";
      case "firstName":
        return "Basic form element with manual value and onChange handling";
      case "lastName":
        return "Using the inputProps shorthand and custom validation rendering";
      case "email":
        return "Form element with custom validation message";
      case "phone":
        return "Form element with placeholder and inline validation errors";
      case "street":
        return "Nested form element for arrays using index()";
      case "isDefault":
        return "Checkbox implementation with label";
      default:
        return "";
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
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">
            {exampleOptions.find((e) => e.id === selectedExample)?.label}
          </h4>
        </div>
        <CodeLine style="dark" code={getExampleCode(selectedExample)} />
      </div>
    </div>
  );
};

export default CodeExampleDropdown;
