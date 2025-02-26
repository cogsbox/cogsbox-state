import React, { useState } from "react";
import { useCogsState } from "./state";
import { Code, TriangleIcon } from "lucide-react";
import CodeLine from "../CodeLine";
import CodeExampleDropdown from "./CodeExamples";

// Main Form Example Component
export default function FormsMain() {
  const [activeTab, setActiveTab] = useState("description");
  const [currentAddressIndex, setCurrentAddressIndex] = useState(0);
  const user = useCogsState("user", {
    reactiveDeps: (state) => [state.addresses],
  });

  const addNewAddress = () => {
    user.addresses.insert({
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
      isDefault: false,
    });
    setCurrentAddressIndex(user.addresses.get().length - 1);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full p-6 bg-gray-50">
      <div className="w-full max-w-[90%]">
        <h1 className="text-2xl font-bold mb-6">CogsState Form Examples</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tabs for API Description and JSON */}
          <div>
            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`px-4 py-2 text-sm font-medium cursor-pointer ${
                  activeTab === "description"
                    ? "text-blue-600 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("description")}
              >
                FormElement API
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium cursor-pointer  ${
                  activeTab === "json"
                    ? "text-blue-600 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("json")}
              >
                JSON State
              </button>
            </div>

            {/* Description Tab Content */}
            {activeTab === "description" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">FormElement API</h2>

                <div className="space-y-6">
                  <p className="text-gray-700">
                    The FormElement function creates a controlled input
                    connected to state, handling binding, validation, and
                    synchronization.
                  </p>

                  {/* params.get() */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-medium text-lg text-blue-700">
                      params.get()
                    </h3>
                    <p className="text-gray-600 mt-2">
                      Retrieves the current value of the state field. Creates a
                      reactive connection between the form field and the
                      underlying state.
                    </p>
                    <div className="bg-gray-100 p-3 rounded mt-2">
                      <pre className="text-xs">
                        {`<input
  value={params.get()}
  ...
/>`}
                      </pre>
                    </div>
                  </div>

                  {/* params.set() */}
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-medium text-lg text-green-700">
                      params.set()
                    </h3>
                    <p className="text-gray-600 mt-2">
                      Updates the state with new values. The form element
                      automatically handles debouncing and validation.
                    </p>
                    <div className="bg-gray-100 p-3 rounded mt-2">
                      <pre className="text-xs">
                        {`onChange={(e) => 
  params.set(e.target.value)
}`}
                      </pre>
                    </div>
                  </div>

                  {/* params.inputProps */}
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-medium text-lg text-purple-700">
                      params.inputProps
                    </h3>
                    <p className="text-gray-600 mt-2">
                      Provides ready-to-use input properties including value and
                      onChange handlers. This is a convenient shorthand for
                      quickly binding form elements.
                    </p>
                    <div className="bg-gray-100 p-3 rounded mt-2">
                      <pre className="text-xs">
                        {`<input
  {...params.inputProps}
  className="form-input"
/>`}
                      </pre>
                    </div>
                  </div>

                  {/* params.validationErrors() */}
                  <div className="border-l-4 border-red-500 pl-4">
                    <h3 className="font-medium text-lg text-red-700">
                      params.validationErrors()
                    </h3>
                    <p className="text-gray-600 mt-2">
                      Retrieves validation errors for the current field. You can
                      display these errors directly in your form fields.
                    </p>
                    <div className="bg-gray-100 p-3 rounded mt-2">
                      <pre className="text-xs">
                        {`{params.validationErrors().length > 0 && (
  <div className="error">
    {params.validationErrors().join(', ')}
  </div>
)}`}
                      </pre>
                    </div>
                  </div>

                  {/* params.syncStatus */}
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h3 className="font-medium text-lg text-yellow-700">
                      params.syncStatus
                    </h3>
                    <p className="text-gray-600 mt-2">
                      Provides information about the synchronization status of
                      the field.
                    </p>
                    <div className="bg-gray-100 p-3 rounded mt-2">
                      <pre className="text-xs">
                        {`{params.syncStatus && (
  <span>
    Updated: {params.syncStatus.date.toLocaleTimeString()}
  </span>
)}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* JSON State Tab Content */}
            {activeTab === "json" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Current State</h2>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-[600px]">
                  {JSON.stringify(user.get(), null, 2)}
                </pre>
              </div>
            )}
          </div>
          <div className="">
            {" "}
            <div className="p-6">
              <div className="flex gap-2 h-12 ">
                <CodeLine code={`user.revertToInitialState()`} />
                <button
                  type="button"
                  className="px-4 py-2 border-2 border-amber-400 bg-amber-500 text-white rounded-md hover:bg-amber-400 min-w-[200px] cursor-pointer"
                  onClick={() => user.revertToInitialState()}
                >
                  Reset Form
                </button>
              </div>
              <div className="  h-4 " />
              <div className="flex gap-2  h-12 ">
                <CodeLine code={` user.validateZodSchema()`} />
                <button
                  type="button"
                  className="px-4 py-2 border-2 border-amber-400 bg-amber-500 text-white rounded-md hover:bg-amber-400 min-w-[200px] cursor-pointer"
                  onClick={() => {
                    console.log("validating", user);
                    user.validateZodSchema();
                  }}
                >
                  Simulated Save
                </button>
              </div>{" "}
            </div>
            <CodeExampleDropdown />
            <div className="  h-4 " />
          </div>
          <div className="bg-white rounded-lg p-6">
            <div className="grid grid-cols-1 gap-6">
              {/* User Form */}
              <div className="space-y-4">
                {/* First Name Field with explanation */}
                <div className="bg-amber-50 p-3 rounded-md mb-4">
                  <p className="text-xs text-amber-700 mb-2">
                    <strong>Direct value/onChange pattern:</strong> This field
                    demonstrates manually connecting the input to state using
                    params.get() and params.set(). This gives you complete
                    control over how the value is read and written.
                  </p>
                  {user.firstName.formElement((params) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        className={`mt-1 block w-full rounded-md border-2 border-amber-400 p-2 focus:border-amber-600 focus:ring-amber-600 `}
                        value={params.get()}
                        onChange={(e) => params.set(e.target.value)}
                        onBlur={params.inputProps.onBlur}
                        ref={params.inputProps.ref}
                      />
                    </div>
                  ))}
                </div>

                {/* Last Name Field with explanation */}
                <div className="bg-amber-50 p-3 rounded-md mb-4">
                  <p className="text-xs text-amber-700 mb-2">
                    <strong>Hidden validation:</strong> This field uses
                    inputProps for simplified binding with the hideMessage
                    option in the validation config to handle validation state
                    without showing error messages. Notice the red border that
                    appears when validation fails.
                  </p>
                  {user.lastName.formElement(
                    (params) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          className={`mt-1 block w-full rounded-md border-2 border-amber-400 p-2 focus:border-amber-600 focus:ring-amber-600 ${
                            params.validationErrors().length > 0
                              ? "border-red-500"
                              : ""
                          }`}
                          {...params.inputProps}
                        />
                      </div>
                    ),
                    {
                      validation: {
                        hideMessage: true,
                      },
                    }
                  )}
                </div>

                {/* Email Field with explanation */}
                <div className="bg-amber-50 p-3 rounded-md mb-4">
                  <p className="text-xs text-amber-700 mb-2">
                    <strong>Custom validation message:</strong> This field
                    demonstrates setting a custom validation message in the
                    formElement options. The message is displayed when
                    validation fails instead of using the default Zod error
                    messages.
                  </p>
                  {user.email.formElement(
                    (params) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <input
                          {...params.inputProps}
                          type="email"
                          className={`mt-1 block w-full rounded-md border-2 border-amber-400 p-2 focus:border-amber-600 focus:ring-amber-600 `}
                        />
                      </div>
                    ),
                    {
                      validation: {
                        message: "Please enter a valid email address",
                      },
                    }
                  )}
                </div>

                {/* Phone Field with explanation */}
                <div className="bg-amber-50 p-3 rounded-md mb-4">
                  <p className="text-xs text-amber-700 mb-2">
                    <strong>Custom error display:</strong> This field shows how
                    to manually display validation errors by using
                    params.validationErrors() directly in the component. This
                    gives you complete control over error presentation.
                  </p>
                  {user.phone.formElement(
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
                          onBlur={() => {
                            params.addValidationError("custom onBlur");
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
                  )}
                </div>
              </div>
              {/* Address Navigation with explanation */}
              <div className="bg-amber-50 p-3 rounded-md mb-4">
                <p className="text-xs text-amber-700 mb-2">
                  <strong>Array management:</strong> This section demonstrates
                  working with array data. The buttons below show how to render
                  multiple items with stateMap, add/remove items, and track
                  validation status for each array element.
                </p>
                <div className="font-medium">Addresses</div>

                <div className="flex space-x-2 mt-2 relative">
                  {user.addresses.stateMap((_, setter, index) => {
                    const errorCount = setter.showValidationErrors().length;
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentAddressIndex(index)}
                        className={`w-12 h-8 rounded-lg flex items-center justify-center text-sm cursor-pointer relative
                  ${
                    errorCount > 0
                      ? "border-2 border-red-500 bg-red-400"
                      : currentAddressIndex === index
                      ? "bg-amber-400 text-white"
                      : "bg-amber-200 text-amber-800 hover:bg-amber-300"
                  }`}
                      >
                        {index + 1}
                        {errorCount > 0 && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md">
                            {errorCount}
                          </div>
                        )}
                      </button>
                    );
                  })}{" "}
                  <button
                    onClick={addNewAddress}
                    className="px-3 py-1 bg-amber-400 text-white text-sm rounded hover:bg-amber-600 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {user.addresses.get().length > 1 && (
                  <button
                    onClick={() => {
                      user.addresses.cut(currentAddressIndex);
                      setCurrentAddressIndex(
                        Math.max(0, currentAddressIndex - 1)
                      );
                    }}
                    className="ml-auto px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 mt-2"
                  >
                    Remove Selected Address
                  </button>
                )}
              </div>
              <div className="flex gap-2 h-8 w-full px-4 justify-between">
                <button
                  type="button"
                  className="px-2 py-0.5 border-1 border-amber-400 bg-amber-500 text-white rounded-md hover:bg-amber-400 min-w-[150px] cursor-pointer"
                  onClick={() => user.revertToInitialState()}
                >
                  Reset Form
                </button>

                <button
                  type="button"
                  className="px-2 py-0.5 border-1 border-amber-400 bg-amber-500 text-white rounded-md hover:bg-amber-400 min-w-[150px] cursor-pointer"
                  onClick={() => {
                    console.log("validating", user);
                    user.validateZodSchema();
                  }}
                >
                  Simulated Save
                </button>
              </div>{" "}
              {/* Current Address Form */}
              {user.addresses.get().length > 0 && (
                <div className="space-y-4 bg-amber-50 p-3 rounded-md">
                  <p className="text-xs text-amber-700 mb-2">
                    <strong>Nested array access:</strong> These fields
                    demonstrate how to access and update elements in a nested
                    array using the index() method. Notice how validation works
                    correctly for each array element.
                  </p>{" "}
                  <div className="grid grid-cols-1 gap-4">
                    {user.addresses
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
                      )}

                    {/* City and State in a row */}
                    <div className="grid grid-cols-2 gap-4">
                      {user.addresses
                        .index(currentAddressIndex)
                        .city.formElement((params) => (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              City
                            </label>
                            <input
                              type="text"
                              className="mt-1 block w-full rounded-md border-2 border-amber-400 p-2 focus:border-amber-600 focus:ring-amber-600"
                              value={params.get()}
                              onChange={(e) => params.set(e.target.value)}
                            />
                          </div>
                        ))}

                      {user.addresses
                        .index(currentAddressIndex)
                        .state.formElement((params) => (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              State
                            </label>
                            <input
                              type="text"
                              className="mt-1 block w-full rounded-md border-2 border-amber-400 p-2 focus:border-amber-600 focus:ring-amber-600"
                              value={params.get()}
                              onChange={(e) => params.set(e.target.value)}
                            />
                          </div>
                        ))}
                    </div>
                    {/* Zip and Country in a row */}
                    <div className="grid grid-cols-2 gap-4">
                      {user.addresses
                        .index(currentAddressIndex)
                        .zipCode.formElement((params) => (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Zip Code
                            </label>
                            <input
                              type="text"
                              className="mt-1 block w-full rounded-md border-2 border-amber-400 p-2 focus:border-amber-600 focus:ring-amber-600"
                              value={params.get()}
                              onChange={(e) => params.set(e.target.value)}
                            />
                          </div>
                        ))}

                      {user.addresses
                        .index(currentAddressIndex)
                        .country.formElement((params) => (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Country
                            </label>
                            <select
                              className="mt-1 block w-full rounded-md border-2 border-amber-400 p-2 focus:border-amber-600 focus:ring-amber-600"
                              value={params.get()}
                              onChange={(e) => params.set(e.target.value)}
                            >
                              <option value="USA">United States</option>
                              <option value="CAN">Canada</option>
                              <option value="MEX">Mexico</option>
                              <option value="GBR">United Kingdom</option>
                            </select>
                          </div>
                        ))}
                    </div>
                    {/* Default Address Checkbox */}
                    <div className="bg-amber-100 p-2 rounded-md">
                      <p className="text-xs text-amber-700 mb-2">
                        <strong>Boolean field handling:</strong> For boolean the
                        standard debounce time is interally set to 20ms instead
                        of the usual 200ms
                      </p>
                      {user.addresses
                        .index(currentAddressIndex)
                        .isDefault.formElement((params) => (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-amber-400 focus:ring-amber-400 border-amber-300 rounded"
                              checked={params.get()}
                              onChange={(e) => params.set(e.target.checked)}
                              id={`default-address-${currentAddressIndex}`}
                            />
                            <label
                              htmlFor={`default-address-${currentAddressIndex}`}
                              className="ml-2 block text-sm text-gray-700"
                            >
                              Set as default address
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>{" "}
        </div>
      </div>
    </div>
  );
}
