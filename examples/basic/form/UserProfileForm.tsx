import React from "react";
import { useCogsState } from "./state";

// User Profile Form Component
const UserProfileForm = () => {
  // Get user state with validation key
  const user = useCogsState("user");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation could be handled here or in the form elements
    console.log("Submitting user data:", user.get());
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">User Profile</h2>
      <p className="text-gray-600 mb-6">
        This form demonstrates different ways to use CogsState form validation.
      </p>

      <form onSubmit={handleSubmit}>
        {/* First Name Field - basic implementation */}
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-600 mb-3">
            <strong>Basic Implementation:</strong> This field demonstrates the
            simplest way to use form elements. It manually handles the value and
            onChange without using the inputProps shorthand.
          </p>
          {user.firstName.formElement((params) => (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={params.get()}
                onChange={(e) => params.set(e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* Last Name Field - using inputProps & custom validation message */}
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-600 mb-3">
            <strong>InputProps & Custom Messages:</strong> This field uses the
            inputProps shorthand to automatically wire up value and onChange. It
            also demonstrates setting a custom validation message in the
            formElement options.
          </p>
          {user.lastName.formElement(
            (params) => (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  {...params.inputProps}
                />
              </div>
            ),
            {
              validation: {
                message: "Last name is required",
              },
            }
          )}
        </div>

        {/* Email Field - custom validation display */}
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-600 mb-3">
            <strong>Custom Error Display:</strong> This field shows how to
            display field-specific validation errors by using the
            validationErrors() method. It gives you full control over how errors
            are presented to the user.
          </p>
          {user.email.formElement((params) => (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                {...params.inputProps}
              />
              {params.validationErrors().map((error, index) => (
                <div key={index} className="text-xs text-red-500 mt-1">
                  {error}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Phone Field with onBlur validation */}
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-600 mb-3">
            <strong>onBlur Validation:</strong> This field demonstrates how to
            implement validation that only triggers when the field loses focus
            (onBlur), rather than on every keystroke. This creates a better user
            experience for complex validations.
          </p>
          {user.phone.formElement(
            (params) => (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={params.get()}
                  onChange={(e) => params.set(e.target.value)}
                  onBlur={() => {
                    // Example of custom onBlur validation logic
                    console.log("Phone field blurred");
                    const value = params.get();

                    if (value && !/^\(\d{3}\) \d{3}-\d{4}$/.test(value)) {
                      console.log("Would trigger validation here");
                    }
                  }}
                  placeholder="(555) 123-4567"
                />
                {/* Display validation errors if any */}
                {params.validationErrors().length > 0 && (
                  <div className="text-xs text-red-500 mt-1">
                    {params.validationErrors().join(", ")}
                  </div>
                )}
              </div>
            ),
            {
              validation: {
                message:
                  "Please enter a valid phone number in format (555) 123-4567",
              },
            }
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            onClick={() =>
              user.revertToInitialState({
                validationKey: "userValidation",
              })
            }
          >
            Reset
          </button>

          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfileForm;
