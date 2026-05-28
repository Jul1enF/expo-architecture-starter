import { Text, TouchableOpacity, FlatList, View, StyleSheet } from "react-native";
import { useMemo, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { getStringValue } from "@/utils/unknownObjectUtils";
import { RPH, RPW, phoneDevice } from "@/utils/dimensions"
import { appStyle } from "@/styles/appStyle"
import { useRouter } from "expo-router";

// titleKey props => if the item is an object without a "title" key, the key with the value of the title to display
// valueKey props => if the item is an object and the title shouldn't be selected with setChosenItem, the key whose value will be chosen

// TYPES
type HorizontalMenuDataElem = 
{ title?: string, link?: string, func?: () => void, [key: string]: unknown } | string

export type HorizontalMenuData = HorizontalMenuDataElem[] | { [category: string]: HorizontalMenuDataElem }

type HorizontalMenuProps = { data: HorizontalMenuData; menuBelow?: boolean, menuFunction?: () => void, titleKey?: string, chosenItem: string, setChosenItem: Dispatch<SetStateAction<string>>, valueKey?: string, countProp?: string, sortByLength?: boolean }


// COMPONENT 

export function HorizontalMenu({ data, menuBelow = false, menuFunction, titleKey, chosenItem, setChosenItem, valueKey, countProp, sortByLength }: HorizontalMenuProps) {

    const router = useRouter()
    const resolvedTitleKey = titleKey ?? "title"

    const dataArray = useMemo(() => {
        if (Array.isArray(data)) return data
        return Object.values(data).sort((a, b) => {
            if (countProp && typeof a !== "string" && typeof b !== "string") {
                const valA = a[countProp]
                const valB = b[countProp]

                if (sortByLength && (Array.isArray(valA) || typeof valA === "string") && (Array.isArray(valB) || typeof valB === "string")) {
                    return valB.length - valA.length
                }
                else if (typeof valA === "number" && typeof valB === "number") return valB - valA
                else return 0
            }
            else return 0
        })
    }, [data, countProp, sortByLength])




    const flatlistRef = useRef<FlatList<HorizontalMenuDataElem>>(null)

    // Function to know if an item is selected
    const isItemSelected = (item: HorizontalMenuDataElem): boolean => {
        if (typeof item === "string") return item === chosenItem
        else if (valueKey && typeof item[valueKey] === "string")
            return item[valueKey] === chosenItem
        else if (typeof item[resolvedTitleKey] === "string") return item[resolvedTitleKey] === chosenItem
        else return false
    }

    // Scroll to index function for the flatlist
    const scrollToIndex = (delay: number, selectedIndex = dataArray.findIndex(item => isItemSelected(item))) => {
        if (selectedIndex >= 0 && flatlistRef.current)
            // Delay to ensure flatlist is ready
            setTimeout(() => {
                flatlistRef.current && flatlistRef.current.scrollToIndex({
                    index: selectedIndex,
                    animated: true,
                    viewPosition: 0.5,
                })
            }, delay)
    }

    // useEffect to scroll to the selected element when chosen item changes
    useEffect(() => {
        scrollToIndex(10)
    }, [chosenItem, dataArray])


    // FLATLIST ITEM
    const Item = ({ item }: { item: HorizontalMenuDataElem }) => {
        const itemIsString = typeof item === "string"

        const itemSelected = isItemSelected(item)

        const elemToSelect = itemIsString ? item : getStringValue(item, valueKey ?? resolvedTitleKey) ?? ""

        const itemPress = () => {
            setChosenItem(elemToSelect)
            menuFunction?.()
            if (!itemIsString) {
                item.func?.()
                item?.link && router.navigate(item.link)
            }
        }

        const title = itemIsString ? item : getStringValue(item, resolvedTitleKey) ?? ""

        return (
            <TouchableOpacity style={[styles.itemBtn, itemSelected ? styles.selectedItemBtn : styles.unselectedItemBtn]} onPress={itemPress}>
                <Text style={[styles.itemText, itemSelected ? styles.selectedItemText : styles.unselectedItemText]} allowFontScaling={false}>
                    {title}
                </Text>
            </TouchableOpacity>
        )
    }

    return (
        <FlatList
            data={dataArray}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: 'center', paddingRight: phoneDevice ? RPW(3.5) : 34 }}
            style={[styles.flatlist, !menuBelow && styles.flatlistBorderBottom]}
            renderItem={({ item }) => {
                return <Item item={item} />
            }}
            ref={flatlistRef}
            onScrollToIndexFailed={(info) => scrollToIndex(100, info.index)}
        />
    )
}

const styles = StyleSheet.create({
    flatlist: {
        minHeight: appStyle.secondHeaderHeight,
        maxHeight: appStyle.secondHeaderHeight,
        width: "100%",
        minWidth: RPW(100),
        backgroundColor: appStyle.pageBody.backgroundColor
    },
    flatlistBorderBottom: {
        ...appStyle.secondHeaderBorderBottom,
    },
    itemBtn: {
        marginLeft: appStyle.headerHorizPadd,
        minHeight: "100%",
        justifyContent: "center",
    },
    unselectedItemBtn: {

    },
    selectedItemBtn: {
        borderBottomColor: appStyle.strongBlack,
        borderBottomWidth: phoneDevice ? 5 : 7,
        paddingTop: phoneDevice ? 5 : 7,
    },
    itemText: {
        ...appStyle.secondHeaderText,
    },
    unselectedItemText: {
        fontWeight: "400",
    },
    selectedItemText: {
        fontWeight: "600",
    }
})