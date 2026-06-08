import { View, FlatList, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useState, useEffect, Dispatch, SetStateAction } from "react"
import useDropdownPosition from "./useDropdownPosition";

import { RPH, RPW, phoneDevice } from '@/utils/dimensions'
import { appStyle } from '@/styles/appStyle';
import { getStringValue, getKeyValue, getItemId } from '@/utils/unknownObjectUtils'
import { DropDownProps, AutocompleteItem, ScreenLocationType } from "./Autocomplete.types";

type PressTypes = {
    pressLocation: null | ScreenLocationType;
    setPressLocation: Dispatch<SetStateAction<ScreenLocationType | null>>
}

export default function Dropdown({ flatlistData, setSelectedItem, valueKey, titleKey, closeDropdown, emptyResultText, layoutStyle = {}, dropdownMaxHeight, dropdownContainerStyle = {}, dropdownItemStyle = {}, dropdownTextStyle = {}, boldTitleWeight = "700", dropdownLineColor, autocompleteInputRef, tabBar, header, dropdownId, pressLocation, setPressLocation }: DropDownProps & PressTypes) {

    // useEffect to reset a potential register value of the location of a tap
    useEffect(() => {
        setPressLocation(null)
        return () => {
            setPressLocation(null)
        }
    }, [])

    // State to register the height of the dropdown
    const [dropdownHeight, setDropdownHeight] = useState<null | number>(null)

    // Hook to get the dropdown style position
    const dropdownPositionStyle = useDropdownPosition({ dropdownHeight, autocompleteInputRef, tabBar, header, dropdownId, pressLocation, closeDropdown })


    // Base style of the text + potential override if dropdownTextStyle has been filled
    const textStyle = [styles.dropdownItemText, dropdownTextStyle]


    // Dropdown item component for the flatlist
    const DropdownItem = ({ item }: { item: AutocompleteItem | null }) => {

        const resolvedTitleKey = titleKey ?? "title"
        const title = typeof item === "string" ? item : getStringValue(item, resolvedTitleKey)
        const boldTitle = getStringValue(item, "boldTitle")
        const lightTitle = getStringValue(item, "lightTitle")

        return (
            <View style={[appStyle.regularItem, { ...layoutStyle }, { ...dropdownItemStyle }, { marginTop: 0 }]} >

                {item &&
                    <Text style={textStyle}>

                        {boldTitle &&
                            <Text style={[...textStyle, { fontWeight: boldTitleWeight }]} >
                                {boldTitle}
                            </Text>
                        }

                        {lightTitle ?? title ?? null}

                    </Text>
                }

                {!item &&
                    <Text style={textStyle}>
                        {emptyResultText}
                    </Text>
                }

            </View>
        )
    }



    return (
        <View
            style={[styles.dropdownContainer, dropdownContainerStyle, { maxHeight: dropdownMaxHeight, overflow: "hidden" }, dropdownPositionStyle]}
            onLayout={(e) => setDropdownHeight(e.nativeEvent.layout.height)}
        >
            <FlatList
                data={flatlistData}
                keyExtractor={(item, index) => {
                    const id = getItemId(item) ?? getItemId(getKeyValue(item, valueKey))
                    return id ?? index.toString()
                }}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: "center",
                }}
                renderItem={({ item, index }) =>
                    <TouchableOpacity onPress={() => {
                        setSelectedItem((valueKey ? getKeyValue(item, valueKey) : item))
                        closeDropdown()
                    }} >
                        <DropdownItem item={item} />
                    </TouchableOpacity>
                }
                ListEmptyComponent={<DropdownItem item={null} />}
                ItemSeparatorComponent={
                    () => <View style={{ height: 1, backgroundColor: dropdownLineColor }} />
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    dropdownContainer: {
        backgroundColor: appStyle.strongGrey2,
        borderRadius: appStyle.regularItemBorderRadius,
        position: "absolute",
        zIndex: 100,

        // setting of opacity 0 until it's override by dropdownPositionStyle with the accurate position
        opacity: 0,
    },
    dropdownItemText: {
        ...appStyle.regularText,
        color: appStyle.fontColorDarkBg,
    },
})