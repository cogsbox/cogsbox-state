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

            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    {/* First Name Field */}
                    {user.firstName.formElement(
                        (params) => (
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
                        ),
                        {
                            validation: {
                                message: "First name is required",
                            },
                        }
                    )}

                    {/* Last Name Field */}
                    {user.lastName.formElement(
                        (params) => (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={params.get()}
                                    onChange={(e) => params.set(e.target.value)}
                                />
                            </div>
                        ),
                        {
                            validation: {
                                message: "Last name is required",
                            },
                        }
                    )}

                    {/* Email Field */}
                    {user.email.formElement(
                        (params) => (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={params.get()}
                                    onChange={(e) => params.set(e.target.value)}
                                />
                                {/* Display sync status - when the field was last updated */}
                                {params.syncStatus && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        Last updated:{" "}
                                        {params.syncStatus.date.toLocaleTimeString()}
                                    </div>
                                )}
                            </div>
                        ),
                        {
                            validation: {
                                message: "Please enter a valid email address",
                            },
                            debounceTime: 500, // Debounce email validation
                        }
                    )}

                    {/* Phone Field */}
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
                                validationKey: "userForm",
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
