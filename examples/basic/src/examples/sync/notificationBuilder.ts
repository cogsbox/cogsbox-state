// === TYPE UTILITIES FOR PATH EXTRACTION ===

import { isFunction } from "cogsbox-state";

// Helper to check if a type is an array
type IsArray<T> = T extends readonly any[] ? true : false;

// Get the element type of an array
type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

// Check if a type is a primitive
type IsPrimitive<T> = T extends string | number | boolean | null | undefined | Date ? true : false;

// Depth counter to prevent infinite recursion
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...0[]];

// Extract all possible paths from a type with depth limit
type PathsOf<T, D extends number = 2> = [D] extends [never]
    ? never
    : T extends any
      ? {
            [K in keyof T]-?: K extends string | number
                ? IsArray<T[K]> extends true
                    ? // For arrays, provide both direct access and element access
                      | `${K}`
                          | `${K}[*]`
                          | (IsPrimitive<ArrayElement<T[K]>> extends true
                                ? never
                                : PathsOf<ArrayElement<T[K]>, Prev[D]> extends infer P
                                  ? P extends string
                                      ? `${K}[*].${P}`
                                      : never
                                  : never)
                    : IsPrimitive<T[K]> extends true
                      ? `${K}`
                      :
                            | `${K}`
                            | (PathsOf<T[K], Prev[D]> extends infer P
                                  ? P extends string
                                      ? `${K}.${P}`
                                      : never
                                  : never)
                : never;
        }[keyof T]
      : never;

// Value type extraction with depth limit
type ValueAtPath<T, P extends string, D extends number = 2> = [D] extends [never]
    ? unknown
    : P extends `${infer K}.${infer Rest}`
      ? K extends keyof T
          ? ValueAtPath<T[K], Rest, Prev[D]>
          : never
      : P extends `${infer K}[*]`
        ? K extends keyof T
            ? IsArray<T[K]> extends true
                ? ArrayElement<T[K]>
                : never
            : never
        : P extends `${infer K}[*].${infer Rest}`
          ? K extends keyof T
              ? IsArray<T[K]> extends true
                  ? ValueAtPath<ArrayElement<T[K]>, Rest, Prev[D]>
                  : never
              : never
          : P extends keyof T
            ? T[P]
            : never;

// === QUERY BUILDER TYPES ===

type ComparisonOperators =
    | "equals"
    | "notEquals"
    | "contains"
    | "startsWith"
    | "endsWith"
    | "gt"
    | "lt"
    | "gte"
    | "lte";

type SerializedCondition = {
    path: string;
    operator: ComparisonOperators;
    value: any;
};

export type SerializedQuery<T> = {
    type: "notification-query";
    conditions: SerializedCondition[];
    sourceType: string;
};

export function createContextProxy<T>(): T {
    const buildProxy = (path: string[] = []): any => {
        return new Proxy(() => {}, {
            get: (target, prop) => {
                // Ignore serialization methods and symbols
                if (prop === "toJSON" || prop === "valueOf" || prop === "toString" || typeof prop === "symbol") {
                    return () => `{{ctx.${path.join(".")}}}`;
                }

                if (typeof prop === "string") {
                    return buildProxy([...path, prop]);
                }
                return undefined;
            },
            // This makes the proxy callable, which returns the path as a serialized string
            apply: () => {
                return `{{ctx.${path.join(".")}}}`;
            },
        });
    };

    return buildProxy() as T;
}
// Update the TypedQueryBuilder to handle context accessors
export class TypedQueryBuilder<T> {
    private conditions: SerializedCondition[] = [];
    private sourceTypeName: string;

    constructor(sourceTypeName: string = "unknown") {
        this.sourceTypeName = sourceTypeName;
    }

    where<P extends PathsOf<T>, C = any>(
        path: P,
        operator: ComparisonOperators,
        value: ValueAtPath<T, P> | string | boolean | number | ((ctx: C) => any),
    ): TypedQueryBuilder<T> {
        let finalValue = value;

        // If value is a function, execute it with the context proxy
        if (isFunction(value)) {
            const contextProxy = createContextProxy<C>();
            finalValue = value(contextProxy) as string;
        }

        this.conditions.push({
            path: path as string,
            operator,
            value: finalValue,
        });
        return this;
    }
    // Update convenience methods to support context functions
    whereEquals<P extends PathsOf<T>, C = any>(
        path: P,
        value: ValueAtPath<T, P> | string | boolean | number | ((ctx: C) => any),
    ): TypedQueryBuilder<T> {
        return this.where(path, "equals", value);
    }

    whereNotEquals<P extends PathsOf<T>, C = any>(
        path: P,
        value: ValueAtPath<T, P> | string | boolean | number | ((ctx: C) => any),
    ): TypedQueryBuilder<T> {
        return this.where(path, "notEquals", value);
    }

    whereContains<P extends PathsOf<T>>(
        path: P,
        value: ValueAtPath<T, P> extends string ? string : never,
    ): TypedQueryBuilder<T> {
        return this.where(path, "contains", value);
    }

    // Array-specific helpers
    whereArrayContains<P extends PathsOf<T>, C = any>(
        arrayPath: P,
        itemPath: string,
        value: any | ((ctx: C) => any),
    ): TypedQueryBuilder<T> {
        const fullPath = `${arrayPath}[*].${itemPath}` as PathsOf<T>;
        return this.where(fullPath, "equals", value);
    }

    serialize(): SerializedQuery<T> {
        return {
            type: "notification-query",
            conditions: this.conditions,
            sourceType: this.sourceTypeName,
        };
    }

    // Debug helper updated to show context references
    toSQL(): string {
        const conditions = this.conditions
            .map((cond) => {
                const { path, operator, value } = cond;
                const sqlOp = {
                    equals: "=",
                    notEquals: "!=",
                    contains: "LIKE",
                    startsWith: "LIKE",
                    endsWith: "LIKE",
                    gt: ">",
                    lt: "<",
                    gte: ">=",
                    lte: "<=",
                }[operator];

                let sqlValue = typeof value === "string" && value.startsWith("{{ctx.") ? value : `'${value}'`;

                if (operator === "contains" && !value.toString().startsWith("{{")) {
                    sqlValue = `'%${value}%'`;
                }
                if (operator === "startsWith" && !value.toString().startsWith("{{")) {
                    sqlValue = `'${value}%'`;
                }
                if (operator === "endsWith" && !value.toString().startsWith("{{")) {
                    sqlValue = `'%${value}'`;
                }

                return `${path} ${sqlOp} ${sqlValue}`;
            })
            .join(" AND ");

        return `SELECT * FROM ${this.sourceTypeName} WHERE ${conditions}`;
    }
}
export class TypedQueryExecutor {
    execute<T>(query: SerializedQuery<T>, data: T[], context: Record<string, any>): T[] {
        return data.filter((item) => {
            return query.conditions.every((condition) => {
                const value = this.getValueAtPath(item, condition.path);
                const compareValue = this.resolveValue(condition.value, context);

                return this.compareValues(value, condition.operator, compareValue);
            });
        });
    }

    private getValueAtPath(obj: any, path: string): any {
        // Handle array paths like "recipients[*].recipient_id"
        if (path.includes("[*]")) {
            const [arrayPath, ...restPath] = path.split("[*].");
            const array = this.getNestedValue(obj, arrayPath!);

            if (!Array.isArray(array)) return false;

            // For array paths, check if ANY element matches
            if (restPath.length > 0) {
                const fieldPath = restPath.join(".");
                return array.some((item) => this.getNestedValue(item, fieldPath));
            }

            return array;
        }

        return this.getNestedValue(obj, path);
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split(".").reduce((current, key) => current?.[key], obj);
    }

    private resolveValue(value: any, context: Record<string, any>): any {
        if (typeof value === "string" && value.startsWith("{{ctx.") && value.endsWith("}}")) {
            const path = value.slice(6, -2); // Remove {{ctx. and }}
            return this.getNestedValue(context, path);
        }
        return value;
    }

    private compareValues(actual: any, operator: ComparisonOperators, expected: any): boolean {
        switch (operator) {
            case "equals":
                return actual === expected;
            case "notEquals":
                return actual !== expected;
            case "contains":
                return typeof actual === "string" && actual.includes(expected);
            case "startsWith":
                return typeof actual === "string" && actual.startsWith(expected);
            case "endsWith":
                return typeof actual === "string" && actual.endsWith(expected);
            case "gt":
                return actual > expected;
            case "lt":
                return actual < expected;
            case "gte":
                return actual >= expected;
            case "lte":
                return actual <= expected;
            default:
                return false;
        }
    }
}
