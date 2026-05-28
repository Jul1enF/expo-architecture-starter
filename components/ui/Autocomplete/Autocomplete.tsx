import { View, TouchableOpacity, StyleSheet, Pressable, Animated, Easing, TextInput } from "react-native";
import { useState, useEffect, useRef, useMemo } from "react";
import MyTextInput from "../MyTextInput";
import { useDropdownProps } from "./AutocompleteProvider";
import { AutocompleteProps, DropDownProps } from "@/components/ui/Autocomplete/Autocomplete.types";

import { findSelectedItemTitle, createId } from "./AutocompleteUtils";
import { getStringValue, getKeyValue } from "@/utils/unknownObjectUtils";
import { isArrayOfString } from "@/utils/typeGuards";

import { RPH, RPW, phoneDevice } from '@/utils/dimensions'
import { appStyle } from '@/styles/appStyle';

import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Feather from '@expo/vector-icons/Feather';

// TO DISPLAY CORRECTLY THE ITEMS OF THE DATA LIST ONE OF THOSE THREE CONDITIONS MUST BE RESPECTED :
// - THE ITEMS ARE OBJECT AND HAVE A KEY "title"
// - THE ITEMS ARE OBJECT AND THE AUTCOMPLETE HAS THE PROPS "titleKey"
// - THE ITEMS ARE DIRECTLY A STRING

// BETTER TO USE IN A SCROLLVIEW WITH : keyboardShouldPersistTaps="handled" TO HAVE ICONS PRESSABLE EVEN WHEN ANOTHER INPUT IS FOCUSED

// THE PARENT MUST NOT HAVE alignItems : "strech"

export default function Autocomplete<SelectedItemType = unknown>({
    data,
    setSelectedItem,
    selectedItem,
    valueKey, // if items are object, field to select if not the all the item
    titleKey, // if items are object with no "title" key, the field to display
    placeholderText = "",
    placeholderColor = appStyle.placeholderColor,
    dropdownMaxHeight = phoneDevice ? RPW(55) : 350,
    emptyResultText = "Aucun résultat",
    inputStyle,
    dropdownContainerStyle,
    dropdownItemStyle,
    dropdownTextStyle,
    dropdownLineColor = appStyle.lightGrey,
    boldTitleWeight,
    iconColor,
    canCreate, // "object" = create an object in selectedItem ; "string" = create a string
    editable = true,
    showClear = true,
    multiline = false,
    autoCapitalize,
    tabBar = true,
    header = true,
}: AutocompleteProps<SelectedItemType>) {


    // VAR, STATES AND HOOKS

    // States and ref for the autocomplete and the dropdown
    const [inputValue, setInputValue] = useState("")
    const [dropdownVisible, setDropdownVisible] = useState(false)
    const autocompleteInputRef = useRef<TextInput>(null)

    // Icon container width depending on the display of the clear icon
    const iconsContainerWidth = appStyle.regularHorizontalPadding + ((showClear && inputValue) ? appStyle.inputIconSize * 3.6 : appStyle.inputIconSize * 1.8)

    // current dropdown props and id shared through context
    const { setDropdownProps, currentDropdownId, setCurrentDropdownId } = useDropdownProps() ?? {}

    // Var to help set selectedItem
    const resolvedTitleKey = titleKey ?? "title"



    // EXTRACT LAYOUT STYLE PROPS FOR THE STYLE OF THE ITEM IN THE DROPDOWN

    const inputObjectStyle = StyleSheet.flatten(inputStyle) ?? {}

    const layoutStyleProps = new Set(["height", "minHeight", "maxHeight", "width", "minWidth", "maxWidth", "paddingLeft", "paddingRight", "paddingHorizontal", "paddingTop", "paddingBottom", "paddingVertical"])

    const layoutStyle = Object.fromEntries(
        Object.entries(inputObjectStyle).filter(
            ([key, value]) => layoutStyleProps.has(key) && value !== undefined
        )
    )



    // USEEFFECT TO CHANGE THE INPUTVALUE IF SELECTEDITEM HAS BEEN CHANGE ELSWHERE

    useEffect(() => {
        if (!selectedItem && inputValue) {
            setInputValue("")
            return
        }

        if (!selectedItem) return

        // For the cases where canCreate = "string" and a registration of the input value has just been made in selectedItem
        if (canCreate === "string" && typeof selectedItem === "string" && selectedItem === inputValue) {
            return
        }

        // For the cases where canCreate = "object" and a registration of the input value has just been made in a title key of the selectedItem object
        if (canCreate === "object" && typeof selectedItem === "object" &&
            getStringValue(selectedItem, resolvedTitleKey) === inputValue
        ) {
            return
        }


        if (selectedItem && selectedItem !== inputValue) {

            if (isArrayOfString(data) && typeof selectedItem === "string") {
                setInputValue(selectedItem)
                return
            }
            else if (data.every(e => typeof e !== "string")) {
                const selectedItemTitle = findSelectedItemTitle({ data, valueKey, titleKey, selectedItem })

                if (selectedItemTitle && selectedItemTitle !== inputValue) setInputValue(selectedItemTitle)
            }
        }
    }, [selectedItem, data])




    // DATA FILTERED WITH INPUT SEARCH VALUE FOR THE DROPDOWN FLATLIST

    const flatlistData = useMemo(() => {
        if (!inputValue || !editable) return data
        else {
            const inputTxtLC = inputValue.toLowerCase()

            return data.filter(e => {
                const title = typeof e === "string" ? e : getStringValue(e, resolvedTitleKey)
                return title && title.toLowerCase().includes(inputTxtLC)
            })
        }
    }, [data, inputValue])

    // useEffect to change the flatlistData in the provider
    useEffect(() => {
        if (dropdownVisible) {
            setDropdownProps && setDropdownProps(prev => prev && ({
                ...prev,
                flatlistData,
            }))
        }
    }, [flatlistData])




    // FUNCTIONS TO OPEN OR CLOSE THE DROPDOWN

    const dropdownIdRef = useRef(createId(32))
    const inputFocusRef = useRef(false)

    const closeDropdown = () => {
        if (inputFocusRef.current) autocompleteInputRef.current?.blur()
        setDropdownVisible(false)
        setDropdownProps && setDropdownProps(null)
        setCurrentDropdownId && setCurrentDropdownId(null)
    }

    const openDropdown = () => {
        if (!inputFocusRef.current) autocompleteInputRef.current?.focus()
        setDropdownVisible(true)
        setCurrentDropdownId && setCurrentDropdownId(dropdownIdRef.current)
        setDropdownProps && setDropdownProps({
            flatlistData,
            setSelectedItem,
            valueKey,
            titleKey,
            closeDropdown,
            emptyResultText,
            layoutStyle,
            dropdownMaxHeight,
            dropdownContainerStyle,
            dropdownItemStyle,
            dropdownTextStyle,
            boldTitleWeight,
            dropdownLineColor,
            autocompleteInputRef,
            tabBar,
            header,
            dropdownId: dropdownIdRef.current,
        } as DropDownProps)
    }



    // CHEVRON ANIMATION
    const chevronRotation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(chevronRotation, {
            toValue: dropdownVisible ? 1 : 0,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    }, [dropdownVisible]);

    const rotateChevron = chevronRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
    });



    // USEEFFECT TO RESET DROPDOWN VISIBLE IF THE ID OF THE CURRENT DROPDOWN IS NOT THIS ONE
    useEffect(() => {
        if (dropdownVisible && !currentDropdownId || dropdownVisible && currentDropdownId !== dropdownIdRef.current) {
            setDropdownVisible(false)
        }
    }, [currentDropdownId])




    return (
        <MyTextInput
            style={[inputObjectStyle, { paddingRight: iconsContainerWidth }]}
            onChangeText={(e) => {
                setInputValue(e)

                if (canCreate === "string") {
                    setSelectedItem(e as SelectedItemType)
                }
                if (canCreate === "object") {
                    setSelectedItem({ [resolvedTitleKey]: e, ...(valueKey && { [valueKey]: e }) } as SelectedItemType)
                }
            }}
            onSubmitEditing={(e) => {
                const inputValueLC = e.nativeEvent.text.toLowerCase()
                const foundItem = data.find(e => {
                    const title = typeof e === "string" ? e : getStringValue(e, resolvedTitleKey)
                    return title && title.toLowerCase() === inputValueLC
                })

                if (foundItem) {
                    setSelectedItem((!valueKey ? foundItem : getKeyValue(foundItem, valueKey)) as SelectedItemType)
                }
            }}
            onFocus={() => {
                inputFocusRef.current = true
                !dropdownVisible && openDropdown()
            }}
            onBlur={() => {
                inputFocusRef.current = false
                dropdownVisible && closeDropdown()
            }}
            value={inputValue}
            placeholder={placeholderText}
            placeholderTextColor={placeholderColor}
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
            editable={editable}
            multiline={multiline}
            inputRef={autocompleteInputRef}
        >


            {/* If non editable, pressable to open or close the dropdown */}
            {!editable && (
                <Pressable
                    style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
                    onPress={() =>
                        dropdownVisible ? closeDropdown() : openDropdown()
                    }
                />
            )}



            <View style={{ ...appStyle.inputIconContainer, width: iconsContainerWidth, flexDirection: "row", zIndex: 2 }}>
                {(showClear && inputValue) &&
                    <TouchableOpacity activeOpacity={0.6} style={[styles.iconContainer]} onPress={() => {
                        setInputValue("")
                        setSelectedItem(null)
                    }} >
                        <Feather
                            name="x-circle"
                            color={iconColor ?? placeholderColor}
                            size={appStyle.inputIconSize}
                        />
                    </TouchableOpacity>
                }

                <TouchableOpacity activeOpacity={0.6} style={styles.iconContainer} onPress={() => dropdownVisible ? closeDropdown() : openDropdown()} >
                    <Animated.View style={{ transform: [{ rotate: rotateChevron }] }}>
                        <FontAwesome5
                            name="chevron-down"
                            color={iconColor ?? placeholderColor}
                            size={appStyle.inputIconSize}
                        />
                    </Animated.View>
                </TouchableOpacity>
            </View>


        </MyTextInput>
    )
}


const styles = StyleSheet.create({
    iconContainer: {
        width: appStyle.inputIconSize * 2,
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
})