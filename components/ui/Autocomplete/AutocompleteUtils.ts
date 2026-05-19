import { hasId, itemHasKey, itemHasStringValue } from "@/utils/typeGuards"
import { FindSelectItemTitleOptions } from "./Autocomplete.types"


const isPrimitive = (v : unknown) : v is null | string | number | boolean =>
    v === null ||
    typeof v === "string" ||
    typeof v === "number" ||
    typeof v === "boolean"

const isDate = (v : unknown) : v is Date =>
    v instanceof Date ||
    (typeof v === "string" && !Number.isNaN(Date.parse(v)))



const sameArrays = (a :unknown, b : unknown) : boolean => {
    if (!Array.isArray(a) || !Array.isArray(b)) return false
    if (a.length !== b.length) return false

    return a.every((value, index) => {
        const other = b[index]

        if (isPrimitive(value)) return value === other
        if (isDate(value))
            return isDate(other) && new Date(value).getTime() === new Date(other).getTime()

        if (Array.isArray(value)) return sameArrays(value, other)

        if (typeof value === "object") return sameObjects(value, other)

        return false
    })
}


const sameObjects = (a : unknown, b : unknown) => {
    if (a === b) return true
    if (!a || !b) return false
    if (typeof a !== "object" || typeof b !== "object") return false
    if (Array.isArray(a) || Array.isArray(b)) return false

    // Mongo priority
    if (hasId(a) && hasId(b)) return a._id === b._id

    const keysA = Object.keys(a)
    const keysB = Object.keys(b)

    if (keysA.length !== keysB.length) return false

    return keysA.every((key) => {
        const recordA = a as Record<string, unknown>
        const recordB = b as Record<string, unknown>
        const valA = recordA[key]
        const valB = recordB[key]

        if (isPrimitive(valA)) return valA === valB
        if (isDate(valA))
            return isDate(valB) && new Date(valA).getTime() === new Date(valB).getTime()

        if (Array.isArray(valA)) return sameArrays(valA, valB)

        if (typeof valA === "object") return typeof valB === "object"

        return false
    })
}


export const findSelectedItemTitle = ({ data, valueKey, titleKey, selectedItem } : FindSelectItemTitleOptions) : string => {

    let title = ""
    const resolvedTitleKey = titleKey ?? "title"

    for (let item of data) {
        const selectedSection = valueKey && itemHasKey(item, valueKey) ? item[valueKey] : null

        // Case where there is no key/value to select in the data array of items (which are objects, prior check in Autocomplete)

        if (!valueKey) {
            // selectedItem is an object (because without valueKey the all item is selected), check if a title field match the item title field
            if (itemHasStringValue(item, resolvedTitleKey) && itemHasStringValue(selectedItem, resolvedTitleKey) && item[resolvedTitleKey] === selectedItem[resolvedTitleKey]) {
                title = item[resolvedTitleKey]
                break;
            }
        }

        // There was a section of the items that was selected : trying to find the one matching selectedItem
        else if (typeof selectedSection === "string" && itemHasStringValue(item, resolvedTitleKey) && selectedSection === selectedItem) {
            title = item[resolvedTitleKey]
            break;
        }
        else if (hasId(selectedSection) && hasId(selectedItem) && itemHasStringValue(item, resolvedTitleKey) && selectedSection._id === selectedItem._id) {
            title = item[resolvedTitleKey]
            break;
        }
        else if (Array.isArray(selectedSection) && itemHasStringValue(item, resolvedTitleKey) && sameArrays(selectedItem, selectedSection)) {
            title = item[resolvedTitleKey]
            break;
        }
        else if (itemHasStringValue(item, resolvedTitleKey) && typeof selectedSection === "object" && sameObjects(selectedItem, selectedSection)) {
            title = item[resolvedTitleKey]
            break;
        }
    }
    return title
}


export const createId = (length : number) => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('')
    let id = ""
    for (let i = 0; i < length; i++) {
        id += chars[Math.floor(Math.random() * chars.length)]
    }
    return id
}