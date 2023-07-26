export function isValueOfStringEnum<T extends Record<string, string>>(
    enumType: T,
    value: string
): value is T[keyof T] {
    return Object.values<string>(enumType)
        .includes(value);
}
