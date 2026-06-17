import { useState, useEffect, useRef } from "react";
import { Keyboard, Platform, Dimensions, ViewStyle } from "react-native";
import { useLayoutSpaces } from "@/hooks/useLayoutSpaces";
import { phoneDevice, RPH } from "@/utils/dimensions";
import { UseDropdownPositionOptions, InputMeasureType } from "./Autocomplete.types";

export default function useDropdownPosition({ dropdownHeight, autocompleteInputRef, tabBar = true, header = true, dropdownId, pressLocation, closeDropdown } : UseDropdownPositionOptions) {

    const inputMeasureRef = useRef<null | InputMeasureType>(null)
    const { fullHeaderHeight, freeHeight, screenHeight, screenWidth } = useLayoutSpaces({ tabBar, header })

    // State to re-render if the inputMeasureRef has changed
    const [forceUpdate, setForceUpdate] = useState(0)


    /* ----------------------------------------
       GET THE INPUT MEASURE AND TRACK CHANGES 
       ----------------------------------------*/

    // Function to record the measure of the input if there has been any change
    const recordInputMeasure = () => {
        if (!autocompleteInputRef.current) return
        else {
            autocompleteInputRef.current.measure((x, y, width, height, pageX, pageY) => {
                if (!inputMeasureRef.current || inputMeasureRef.current.pageX !== pageX || inputMeasureRef.current.pageY !== pageY || inputMeasureRef.current.height !== height) {

                    inputMeasureRef.current = { width, height, pageX, pageY }
                    setForceUpdate(prev => prev + 1)
                }
            })
        }
    }


    // frame ref and loop to record the measure
    const frameRef = useRef<number | null>(null)

    const loop = () => {
        recordInputMeasure()
        frameRef.current = requestAnimationFrame(loop)
    }

    // useEffect to start the loop
    useEffect(() => {

        loop()

        return () => {
            if (frameRef.current !== null) {
                cancelAnimationFrame(frameRef.current)
                frameRef.current = null
            }
        }
    }, [dropdownId])



  /* -------------------------------------------------------------
      CLOSE THE DROPDOWN IF THERE HAS BEEN A TAP OUTSIDE THE INPUT
      ------------------------------------------------------------*/

      useEffect(()=>{
        if (!pressLocation || !inputMeasureRef.current) return

        const {pageX : eventX, pageY : eventY} = pressLocation
        const { width, height, pageX, pageY } = inputMeasureRef.current
   
        const isInside = eventX >= pageX && eventX <= (pageX + width) && eventY >= pageY && eventY <= (pageY + height) 

        if(!isInside) setTimeout(closeDropdown, 0)

      },[pressLocation])




    /* -------------------------------------
      CALCULATION OF THE DROPDOWN POSITION
      --------------------------------------*/
    const [dropdownPositionStyle, setDropdownPositionStyle] = useState<ViewStyle>({})
    const [keyboardMounted, setKeyboardMounted] = useState(false)
    const keyboardHeightRef = useRef(0)

    // LISTENER OF THE KEYBOARD STATUS AND HEIGHT REGISTRATION
    useEffect(() => {
        const showSubscription = Keyboard.addListener("keyboardDidShow", (e) => {
            if (Platform.OS === "ios") keyboardHeightRef.current = e.endCoordinates.height
            else {
                const portrait = screenHeight > screenWidth
                const estimKeyboardHeight = phoneDevice ? screenHeight * 0.4 : portrait ? screenHeight * 0.3 : screenHeight * 0.24
                keyboardHeightRef.current = estimKeyboardHeight
            }
            setKeyboardMounted(true)
        })
        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
            keyboardHeightRef.current = 0
            setKeyboardMounted(false)
        })
        return () => {
            showSubscription.remove()
            hideSubscription.remove()
        }
    }, [])


    // CALCULATION OF THE POSITION

    useEffect(() => {
        if (!dropdownHeight || !inputMeasureRef.current) return

        const style : ViewStyle = {}

        // Measure of the input layout
        const { width, height, pageX, pageY } = inputMeasureRef.current

        // Because the dropdown is wrapped in a view that has a top : fullHeaderHeight, the top 0 here is not the same as pageY = 0. So we create a relative one
        const relativeY = pageY - fullHeaderHeight

        // If the keyboard is mounted we don't have to worry about the tabbar so we don't use freeHeightSpace (screenHeight - header - tabbar) but the screenheight minus the header
        const comparisonHeight = keyboardMounted ? (screenHeight - fullHeaderHeight) : freeHeight

        // Calculation of the free space below and above the input
        const inputBottomFreeSpace = comparisonHeight - (height + relativeY) - keyboardHeightRef.current
        const safeBottomSpace = Math.max(0, inputBottomFreeSpace)

        const inputTopFreeSpace = relativeY

        // If the dropdown is higher than the space available below and if there is more space available above, we put it on the top of the input
        const shouldBeOnTop = dropdownHeight >= safeBottomSpace &&
            inputTopFreeSpace > safeBottomSpace

        if (shouldBeOnTop) {
            style.bottom = freeHeight - relativeY + 5
            style.top = undefined
        }
        // Otherwise we put it below
        else {
            style.top = relativeY + height + 5
            style.bottom = undefined
        }

        style.width = width
        style.left = pageX
        style.opacity = 1

        setDropdownPositionStyle(style)

    }, [dropdownHeight, keyboardMounted, forceUpdate])

    return dropdownPositionStyle
}