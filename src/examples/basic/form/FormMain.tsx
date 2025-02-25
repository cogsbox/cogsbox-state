import React, { useState } from "react";
import { useCogsState } from "./state";

// Main Form Example Component
export default function FormsMain() {
    const [activeTab, setActiveTab] = useState("description");
    const [currentAddressIndex, setCurrentAddressIndex] = useState(0);
    const user = useCogsState("user");

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
                <h1 className="text-2xl font-bold mb-6">
                    CogsState Form Examples
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Tabs for API Description and JSON */}
                    <div>
                        {/* Tabs Navigation */}
                        <div className="flex border-b border-gray-200 mb-6">
                            <button
                                className={`px-4 py-2 text-sm font-medium ${
                                    activeTab === "description"
                                        ? "text-blue-600 border-b-2 border-blue-500"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                                onClick={() => setActiveTab("description")}
                            >
                                FormElement API
                            </button>
                            <button
                                className={`px-4 py-2 text-sm font-medium ${
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
                                <h2 className="text-xl font-semibold mb-4">
                                    FormElement API
                                </h2>

                                <div className="space-y-6">
                                    <p className="text-gray-700">
                                        The FormElement function creates a
                                        controlled input connected to state,
                                        handling binding, validation, and
                                        synchronization.
                                    </p>

                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="font-medium text-blue-800 mb-2">
                                            Basic Usage
                                        </h3>
                                        <pre className="text-xs bg-gray-800 text-white p-3 rounded">
                                            {`// Basic usage with get/set
{stateObject.field.formElement((params) => (
  <input 
    value={params.get()}
    onChange={(e) => params.set(e.target.value)}
  />
))}

// With validation
{stateObject.field.formElement((params) => (
  <>
    <input value={params.get()} onChange={(e) => params.set(e.target.value)} />
    {params.validationErrors().length > 0 && (
      <div className="error">{params.validationErrors().join(', ')}</div>
    )}
  </>
), {
  validation: { message: "Field is required" },
  debounceTime: 300
})}`}
                                        </pre>
                                    </div>

                                    {/* params.get() */}
                                    <div className="border-l-4 border-blue-500 pl-4">
                                        <h3 className="font-medium text-lg text-blue-700">
                                            params.get()
                                        </h3>
                                        <p className="text-gray-600 mt-2">
                                            Retrieves the current value of the
                                            state field. Creates a reactive
                                            connection between the form field
                                            and the underlying state.
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
                                            Updates the state with new values.
                                            The form element automatically
                                            handles debouncing and validation.
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
                                            Provides ready-to-use input
                                            properties including value and
                                            onChange handlers. This is a
                                            convenient shorthand for quickly
                                            binding form elements.
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
                                            Retrieves validation errors for the
                                            current field. You can display these
                                            errors directly in your form fields.
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
                                            Provides information about the
                                            synchronization status of the field.
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
                                <h2 className="text-xl font-semibold mb-4">
                                    Current State
                                </h2>
                                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-[600px]">
                                    {JSON.stringify(user.get(), null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Forms (always visible) */}
                    <div className="bg-white rounded-lg p-6">
                        <div className="grid grid-cols-1 gap-6">
                            {/* User Form */}
                            <div className="space-y-4">
                                <h3 className="font-medium text-gray-700 border-b pb-2">
                                    Personal Information
                                </h3>

                                {/* First Name Field */}
                                <div className="grid grid-cols-2 gap-4 items-start">
                                    <div className="text-sm bg-gray-100 p-3 rounded">
                                        <div className="font-medium">
                                            First Name
                                        </div>
                                        <pre className="text-xs mt-2 overflow-auto">
                                            {`user.firstName.formElement((params) => (
  <input
    value={params.get()}
    onChange={(e) => params.set(e.target.value)}
  />
))`}
                                        </pre>
                                    </div>

                                    <div>
                                        {user.firstName.formElement(
                                            (params) => (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        First Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="mt-1 block w-full rounded-md border-2 border-orange-500 p-2 focus:border-orange-600 focus:ring-orange-600"
                                                        value={params.get()}
                                                        onChange={(e) =>
                                                            params.set(
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            ),
                                            {
                                                validation: {
                                                    message:
                                                        "First name is required",
                                                },
                                            }
                                        )}
                                    </div>
                                </div>

                                {/* Last Name Field */}
                                <div className="grid grid-cols-2 gap-4 items-start">
                                    <div className="text-sm bg-gray-100 p-3 rounded">
                                        <div className="font-medium">
                                            Last Name
                                        </div>
                                        <pre className="text-xs mt-2 overflow-auto">
                                            {`user.lastName.formElement((params) => (
  <input
    value={params.get()}
    onChange={(e) => params.set(e.target.value)}
  />
))`}
                                        </pre>
                                    </div>

                                    <div>
                                        {user.lastName.formElement(
                                            (params) => (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Last Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="mt-1 block w-full rounded-md border-2 border-orange-500 p-2 focus:border-orange-600 focus:ring-orange-600"
                                                        value={params.get()}
                                                        onChange={(e) =>
                                                            params.set(
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            ),
                                            {
                                                validation: {
                                                    message:
                                                        "Last name is required",
                                                },
                                            }
                                        )}
                                    </div>
                                </div>

                                {/* Email Field with inputProps */}
                                <div className="grid grid-cols-2 gap-4 items-start">
                                    <div className="text-sm bg-gray-100 p-3 rounded">
                                        <div className="font-medium">
                                            Email with inputProps
                                        </div>
                                        <pre className="text-xs mt-2 overflow-auto">
                                            {`user.email.formElement((params) => (
  <input
    {...params.inputProps}
    type="email"
  />
))`}
                                        </pre>
                                    </div>

                                    <div>
                                        {user.email.formElement(
                                            (params) => (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Email Address
                                                    </label>
                                                    <input
                                                        {...params.inputProps}
                                                        type="email"
                                                        className="mt-1 block w-full rounded-md border-2 border-orange-500 p-2 focus:border-orange-600 focus:ring-orange-600"
                                                    />
                                                </div>
                                            ),
                                            {
                                                validation: {
                                                    message:
                                                        "Please enter a valid email address",
                                                },
                                                debounceTime: 500,
                                            }
                                        )}
                                    </div>
                                </div>

                                {/* Phone Field with validation errors */}
                                <div className="grid grid-cols-2 gap-4 items-start">
                                    <div className="text-sm bg-gray-100 p-3 rounded">
                                        <div className="font-medium">
                                            Phone with Validation
                                        </div>
                                        <pre className="text-xs mt-2 overflow-auto">
                                            {`user.phone.formElement((params) => (
  <>
    <input value={params.get()} onChange={...} />
    {params.validationErrors().length > 0 && (
      <div className="error">
        {params.validationErrors().join(', ')}
      </div>
    )}
  </>
))`}
                                        </pre>
                                    </div>

                                    <div>
                                        {user.phone.formElement(
                                            (params) => (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Phone Number
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        className="mt-1 block w-full rounded-md border-2 border-orange-500 p-2 focus:border-orange-600 focus:ring-orange-600"
                                                        value={params.get()}
                                                        onChange={(e) =>
                                                            params.set(
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="(555) 123-4567"
                                                    />
                                                    {params.validationErrors()
                                                        .length > 0 && (
                                                        <div className="text-xs text-red-500 mt-1">
                                                            {params
                                                                .validationErrors()
                                                                .join(", ")}
                                                        </div>
                                                    )}
                                                </div>
                                            ),
                                            {
                                                validation: {
                                                    message:
                                                        "Please enter a valid phone number",
                                                },
                                            }
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Address Form */}
                            <div>
                                <div className="bg-orange-100 p-4 rounded-lg border-l-4 border-orange-500 mb-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-medium text-orange-800">
                                            Address Information
                                        </h3>
                                        <button
                                            onClick={addNewAddress}
                                            className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600"
                                        >
                                            Add New Address
                                        </button>
                                    </div>

                                    {/* Address Navigation */}
                                    {user.addresses.get().length > 0 && (
                                        <div className="mt-4 flex items-center">
                                            <div className="text-sm text-orange-800 font-medium mr-2">
                                                Select Address:
                                            </div>
                                            <div className="flex space-x-2">
                                                {user.addresses
                                                    .get()
                                                    .map((_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() =>
                                                                setCurrentAddressIndex(
                                                                    index
                                                                )
                                                            }
                                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                              ${
                                  currentAddressIndex === index
                                      ? "bg-orange-500 text-white"
                                      : "bg-orange-200 text-orange-800 hover:bg-orange-300"
                              }`}
                                                        >
                                                            {index + 1}
                                                        </button>
                                                    ))}
                                            </div>

                                            {user.addresses.get().length >
                                                1 && (
                                                <button
                                                    onClick={() => {
                                                        user.addresses.cut(
                                                            currentAddressIndex
                                                        );
                                                        setCurrentAddressIndex(
                                                            Math.max(
                                                                0,
                                                                currentAddressIndex -
                                                                    1
                                                            )
                                                        );
                                                    }}
                                                    className="ml-auto px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Current Address Form */}
                                {user.addresses.get().length > 0 && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            {/* Using stateMap with formElement */}
                                            <div className="text-sm bg-gray-100 p-3 rounded mb-4">
                                                <div className="font-medium">
                                                    Array with formElement
                                                </div>
                                                <pre className="text-xs mt-2 overflow-auto">
                                                    {`// Access array elements with index
user.addresses.index(${currentAddressIndex}).street.formElement((params) => (
  <input value={params.get()} onChange={...} />
))`}
                                                </pre>
                                            </div>

                                            {/* Street Field */}
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
                                                                className="mt-1 block w-full rounded-md border-2 border-orange-500 p-2 focus:border-orange-600 focus:ring-orange-600"
                                                                value={params.get()}
                                                                onChange={(e) =>
                                                                    params.set(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    ),
                                                    {
                                                        validation: {
                                                            message:
                                                                "Street address is required",
                                                        },
                                                    }
                                                )}

                                            {/* City and State in a row */}
                                            <div className="grid grid-cols-2 gap-4">
                                                {user.addresses
                                                    .index(currentAddressIndex)
                                                    .city.formElement(
                                                        (params) => (
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700">
                                                                    City
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="mt-1 block w-full rounded-md border-2 border-orange-500 p-2 focus:border-orange-600 focus:ring-orange-600"
                                                                    value={params.get()}
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        params.set(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        )
                                                    )}

                                                {user.addresses
                                                    .index(currentAddressIndex)
                                                    .state.formElement(
                                                        (params) => (
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700">
                                                                    State
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="mt-1 block w-full rounded-md border-2 border-orange-500 p-2 focus:border-orange-600 focus:ring-orange-600"
                                                                    value={params.get()}
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        params.set(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        )
                                                    )}
                                            </div>

                                            {/* Zip and Country in a row */}
                                            <div className="grid grid-cols-2 gap-4">
                                                {user.addresses
                                                    .index(currentAddressIndex)
                                                    .zipCode.formElement(
                                                        (params) => (
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700">
                                                                    Zip Code
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="mt-1 block w-full rounded-md border-2 border-orange-500 p-2 focus:border-orange-600 focus:ring-orange-600"
                                                                    value={params.get()}
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        params.set(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        )
                                                    )}

                                                {user.addresses
                                                    .index(currentAddressIndex)
                                                    .country.formElement(
                                                        (params) => (
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700">
                                                                    Country
                                                                </label>
                                                                <select
                                                                    className="mt-1 block w-full rounded-md border-2 border-orange-500 p-2 focus:border-orange-600 focus:ring-orange-600"
                                                                    value={params.get()}
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        params.set(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="USA">
                                                                        United
                                                                        States
                                                                    </option>
                                                                    <option value="CAN">
                                                                        Canada
                                                                    </option>
                                                                    <option value="MEX">
                                                                        Mexico
                                                                    </option>
                                                                    <option value="GBR">
                                                                        United
                                                                        Kingdom
                                                                    </option>
                                                                </select>
                                                            </div>
                                                        )
                                                    )}
                                            </div>

                                            {/* Default Address Checkbox */}
                                            {user.addresses
                                                .index(currentAddressIndex)
                                                .isDefault.formElement(
                                                    (params) => (
                                                        <div className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-orange-300 rounded"
                                                                checked={params.get()}
                                                                onChange={(e) =>
                                                                    params.set(
                                                                        e.target
                                                                            .checked
                                                                    )
                                                                }
                                                                id={`default-address-${currentAddressIndex}`}
                                                            />
                                                            <label
                                                                htmlFor={`default-address-${currentAddressIndex}`}
                                                                className="ml-2 block text-sm text-gray-700"
                                                            >
                                                                Set as default
                                                                address
                                                            </label>
                                                        </div>
                                                    )
                                                )}

                                            {/* Using stateMap with formElement */}
                                            <div className="text-sm bg-gray-100 p-3 rounded mt-4">
                                                <div className="font-medium">
                                                    Alternative: Using stateMap
                                                </div>
                                                <pre className="text-xs mt-2 overflow-auto">
                                                    {`// Iterate through all addresses
user.addresses.stateMap((address, addressSetter, index) => (
  <div key={index}>
    {addressSetter.street.formElement((params) => (
      <input value={params.get()} onChange={...} />
    ))}
  </div>
))`}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="mt-4 flex justify-end space-x-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 border-2 border-orange-500 text-orange-700 rounded-md hover:bg-orange-50"
                                    onClick={() =>
                                        user.revertToInitialState({
                                            validationKey: "formValidation",
                                        })
                                    }
                                >
                                    Reset Form
                                </button>

                                <button
                                    type="button"
                                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                                    onClick={() => setActiveTab("json")}
                                >
                                    View JSON
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
