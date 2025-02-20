import type { InitialStateType, TransformedStateType } from "./useCogsState";
export const isObject = (item: any): item is Record<string, any> => {
    return (
        item &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        item !== null
    );
};
type GenericObject = Record<string, any>;
export const isArray = (item: any): item is Array<any> => {
    return Array.isArray(item);
};
export const isDeepEqual = (
    object1?: Record<string, any>,
    object2?: Record<string, any>,
    opts: { get?: () => void } = {},
    currentPath: string[] = [],
): boolean => {
    if (isObject(object1) && isObject(object2)) {
        const objKeys1 = Object.keys(object1);
        const objKeys2 = Object.keys(object2);

        if (objKeys1.length !== objKeys2.length) {
            //     console.log("not equal", objKeys1, objKeys2);
            return false;
        }

        for (let key of objKeys1) {
            const value1 = object1[key];
            const value2 = object2[key];

            // Check if the key exists in both objects
            if (!(key in object1) || !(key in object2)) {
                //     console.log("not equal", key);
                return false;
            }

            const newPath = [...currentPath, key];

            // If current path is in ignoreArray, continue to the next key

            if (!isDeepEqual(value1, value2, opts, newPath)) {
                //   console.log("not equal", value1, value2);
                return false;
            }
        }
        return true;
    } else if (isArray(object1) && isArray(object2)) {
        if (object1.length !== object2.length) {
            //  console.log("not equal", object1);
            return false;
        }

        for (let i = 0; i < object1.length; i++) {
            if (
                !isDeepEqual(object1[i], object2[i], opts, [
                    ...currentPath,
                    i.toString(),
                ])
            ) {
                //    console.log("not equal", object1[i]);
                return false;
            }
        }
        return true;
    } else {
        return (
            object1 === object2 ||
            (Number.isNaN(object1) && Number.isNaN(object2))
        );
    }
};
export function updateNestedProperty(
    path: string[],
    state: any,
    update: any,
): any {
    if (!path || path.length === 0) return update;
    const head = path[0];
    const tail = path.slice(1);

    if (Array.isArray(state)) {
        const index = Number(head);

        if (!isNaN(index) && index >= 0 && index < state.length) {
            return [
                ...state.slice(0, index),
                updateNestedProperty(tail, state[index], update),
                ...state.slice(index + 1),
            ];
        } else {
            console.log("errorstate", state, path);
            throw new Error(
                `Invalid array index "${index}" in path "${path.join(".")}".`,
            );
        }
    } else if (typeof state === "object" && state !== null) {
        if (head && head in state) {
            return {
                ...state,
                [head!]: updateNestedProperty(tail, state[head!], update),
            };
        } else {
            console.log(`Invalid property`, head, tail, path);
            throw new Error(
                `Invalid property "${head}" in path "${path.join(".")}".`,
            );
        }
    } else {
        throw new Error(
            `Cannot update nested property at path "${path.join(".")}". The path does not exist.`,
        );
    }
}

export function deleteNestedProperty(path: string[], state: any): any {
    if (!path || path.length === 0) return state;
    const head = path[0] as string;
    const tail = path.slice(1);

    if (Array.isArray(state)) {
        const index = Number(head);

        if (!isNaN(index) && index >= 0 && index < state.length) {
            if (tail.length === 0) {
                // Remove the item at the index
                return [...state.slice(0, index), ...state.slice(index + 1)];
            } else {
                return [
                    ...state.slice(0, index),
                    deleteNestedProperty(tail, state[index]),
                    ...state.slice(index + 1),
                ];
            }
        } else {
            throw new Error(
                `Invalid array index "${index}" in path "${path.join(".")}".`,
            );
        }
    } else if (typeof state === "object" && state !== null) {
        if (tail.length === 0) {
            // Delete the property and return the new object
            const { [head]: _, ...rest } = state;
            return rest;
        } else if (head in state) {
            return {
                ...state,
                [head]: deleteNestedProperty(tail, state[head]),
            };
        } else {
            throw new Error(
                `Invalid property "${head}" in path "${path.join(".")}".`,
            );
        }
    } else {
        throw new Error(
            `Cannot delete nested property at path "${path.join(".")}". The path does not exist.`,
        );
    }
}

export function getNestedValue<TStateObject extends unknown>(
    obj: TStateObject,
    pathArray: string[],
) {
    let value: any = obj;

    for (let i = 0; i < pathArray.length; i++) {
        const key = pathArray[i];
        //  console.log(key, "loooo");
        if (!key) {
            throw new Error("Invalid path");
        }
        if (Array.isArray(value)) {
            value = value[parseInt(key)];
        } else {
            if (!value) {
                //  console.log(key, value, pathArray);
                return;
            }

            value = value[key];
        }
    }
    return value;
}
type DifferencePaths = string[];

export function getDifferences(
    obj1: any,
    obj2: any,
    currentPath: string = "",
): DifferencePaths {
    let differences: DifferencePaths = [];
    // Handling null and undefined cases
    if (typeof obj1 === "function" && typeof obj2 === "function") {
        return differences;
    }
    if (
        obj1 === null ||
        obj1 === undefined ||
        obj2 === null ||
        obj2 === undefined
    ) {
        if (obj1 !== obj2) {
            //     console.log(obj1, obj2);
            return [currentPath];
        }
        return differences;
    }

    // Handling primitive types
    if (typeof obj1 !== "object" || typeof obj2 !== "object") {
        if (obj1 !== obj2) {
            return [currentPath];
        }
        return differences;
    }

    // Handling arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        // Handle changes in length directly
        if (obj1.length !== obj2.length) {
            differences.push(`${currentPath}.length`);
        }

        // Use the shorter length for comparison to detect shifts or changes
        const commonLength = Math.min(obj1.length, obj2.length);
        for (let i = 0; i < commonLength; i++) {
            if (obj1[i] !== obj2[i]) {
                differences = differences.concat(
                    getDifferences(obj1[i], obj2[i], `${currentPath}[${i}]`),
                );
            }
        }

        // If an array is shorter post-cut, the remaining items in the longer array are implicitly shifted/deleted
        if (obj1.length !== obj2.length) {
            const longerArrayPath = obj1.length > obj2.length ? obj1 : obj2;
            for (let i = commonLength; i < longerArrayPath.length; i++) {
                differences.push(`${currentPath}[${i}]`);
            }
        }
        return differences;
    }
    // Handling objects
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const allKeys = Array.from(new Set([...keys1, ...keys2]));

    allKeys.forEach((key) => {
        const newPath = currentPath ? `${currentPath}.${key}` : key;
        differences = differences.concat(
            getDifferences(obj1[key], obj2[key], newPath),
        );
    });
    return differences;
}

export function getDifferencesArray(obj1: any, obj2: any) {
    const convertedDiff = getDifferences(obj1, obj2).map((string) =>
        string
            .replace(/\[(\w+)\]/g, ".$1")
            .split(".")
            .filter(Boolean),
    );

    return convertedDiff;
}
export function getArrayLengthDifferences(
    obj1: any,
    obj2: any,
    currentPath: string = "",
): string[] {
    let differences: string[] = [];

    // Check for null or undefined in entire objects
    if (
        obj1 === null ||
        obj1 === undefined ||
        obj2 === null ||
        obj2 === undefined
    ) {
        return differences;
    }

    // Check and compare only array lengths
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) {
            differences.push(currentPath);
        }
    } else if (typeof obj1 === "object" && typeof obj2 === "object") {
        // Recursively check for nested arrays
        const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
        for (const key of keys) {
            const newPath = currentPath ? `${currentPath}.${key}` : key;

            // Perform recursive checks only for array fields
            if (Array.isArray(obj1[key]) || Array.isArray(obj2[key])) {
                differences = differences.concat(
                    getArrayLengthDifferences(obj1[key], obj2[key], newPath),
                );
            }
        }
    }

    return differences;
}

export function getArrayLengthDifferencesArray(obj1: any, obj2: any) {
    const convertedDiff = getArrayLengthDifferences(obj1, obj2).map((string) =>
        string
            .replace(/\[(\w+)\]/g, ".$1")
            .split(".")
            .filter(Boolean),
    );

    return convertedDiff;
}
// export function determineUpdateType(prevState: any, newState: any): UpdateTypeDetail[] {
//     console.time("determineUpdateType");
//     const updateDetails: UpdateTypeDetail[] = [];

//     function checkForUpdates(prev: any, next: any, path: string[] = []) {
//         if (Array.isArray(prev) && Array.isArray(next)) {
//             if (prev.length !== next.length) {
//                 updateDetails.push({
//                     updateType: prev.length < next.length ? "push" : "cut",
//                     path,
//                     oldValue: prev,
//                     newValue: next,
//                 });
//                 // If an array has changed size, no need to check deeper for this path
//                 return;
//             } else {
//                 // Check for updates within the array
//                 for (let i = 0; i < prev.length; i++) {
//                     checkForUpdates(prev[i], next[i], path.concat(i.toString()));
//                 }
//             }
//         } else if (typeof prev === "object" && typeof next === "object" && prev !== null && next !== null) {
//             const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
//             for (let key of keys) {
//                 checkForUpdates(prev[key], next[key], path.concat(key));
//             }
//         } else if (prev !== next) {
//             updateDetails.push({
//                 updateType: "updated",
//                 path,
//                 oldValue: prev,
//                 newValue: next,
//             });
//         }
//     }

//     checkForUpdates(prevState, newState);
//     console.timeEnd("determineUpdateType");
//     console.log("updateDetails", updateDetails);
//     return updateDetails;
// }

export function transformStateFunc<State extends unknown>(initialState: State) {
    const isInitialStateType = (
        state: any,
    ): state is InitialStateType<State> => {
        return Object.values(state).some((value) =>
            value?.hasOwnProperty("initialState"),
        );
    };
    let initalOptions: GenericObject = {};
    const transformInitialState = (
        state: InitialStateType<State>,
    ): GenericObject | GenericObject[] => {
        const transformedState: GenericObject | GenericObject[] = {};
        Object.entries(state).forEach(([key, value]) => {
            if (value?.initialState) {
                initalOptions = { ...(initalOptions ?? {}), [key]: value };

                transformedState[key] = { ...value.initialState };
            } else {
                transformedState[key] = value;
            }
        });

        return transformedState;
    };

    const transformedInitialState = isInitialStateType(initialState)
        ? (transformInitialState(initialState) as State)
        : (initialState as State);

    return [transformedInitialState, initalOptions] as [
        TransformedStateType<State>,
        GenericObject,
    ];
}
