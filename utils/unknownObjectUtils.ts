export const getStringValue = (item: unknown, key: string) => {
    if (typeof item !== "object" || item === null) return undefined;

    const value = (item as Record<string, unknown>)[key];

    return typeof value === "string" ? value : undefined;
};

export const getKeyValue = (item: unknown, key?: string) => {
    if (typeof item !== "object" || item === null || !key) return undefined;

    const value = (item as Record<string, unknown>)[key];

    return value;
};

export const getItemId = (item: unknown) => {
    if (typeof item !== "object" || item === null) return undefined;

    const id = (item as Record<string, unknown>)._id;

    return typeof id === "string" ? id : undefined;
}