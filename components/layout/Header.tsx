import { View, Text, StyleSheet, StatusBar, TouchableOpacity } from "react-native";
import { NativeStackHeaderProps } from '@react-navigation/native-stack'

import { LinearGradient } from "expo-linear-gradient";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import LateralMenu from "./LateralMenu/LateralMenu";
import ForcedUpdateModal from "./ForcedUpdateModal";
import SearchModal from "./SearchModal";

import { useState } from 'react'
import useLayoutSpaces from "@/hooks/useLayoutSpaces"
import { RPH, RPW, phoneDevice } from "@/utils/dimensions"
import { appStyle } from "@/styles/appStyle";


type HeaderProps = NativeStackHeaderProps & { appObsolete : boolean}

export default function Header({ appObsolete, ...props } : HeaderProps) {

    const [menuVisible, setMenuVisible] = useState(false)

    // Hook for the height/width of the screen (for tablets orientation changes), the height available and detection of android insetTop to use as offset

    const { modalOffsetTop, statusBarOffset, freeHeight, screenHeight, screenWidth, fullHeaderHeight } = useLayoutSpaces()


    // States for the display of the search modal

    const [searchVisible, setSearchVisible] = useState(false)


    return (
        <View>
            <StatusBar translucent={true} backgroundColor="transparent" barStyle="light-content" />
            <LinearGradient style={[styles.header, { height: fullHeaderHeight, paddingTop: statusBarOffset }]}
                colors={[appStyle.strongRed, appStyle.strongBlack]}
                locations={[0, 0.75]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
            >
                <TouchableOpacity activeOpacity={0.6} style={styles.menuIconContainer} onPress={() => setMenuVisible(!menuVisible)}>
                    <FontAwesome name="navicon" style={styles.icon} size={phoneDevice ? RPW(6) : 38} />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title} allowFontScaling={false}>
                        APP NAME
                    </Text>
                </View>
                <TouchableOpacity activeOpacity={0.6} style={styles.searchIconContainer} onPress={() => setSearchVisible(!searchVisible)}>
                    <FontAwesome6 name="magnifying-glass" style={styles.icon} size={phoneDevice ? RPW(6) : 38} />
                </TouchableOpacity>
            </LinearGradient>
            <View style={styles.headerLigne}></View>

            <SearchModal screenHeight={screenHeight} screenWidth={screenWidth} modalOffsetTop={modalOffsetTop} searchVisible={searchVisible} setSearchVisible={setSearchVisible} />

            <LateralMenu menuVisible={menuVisible} setMenuVisible={setMenuVisible} screenHeight={screenHeight} screenWidth={screenWidth} modalOffsetTop={modalOffsetTop} freeHeight={freeHeight} />


            <ForcedUpdateModal screenHeight={screenHeight} screenWidth={screenWidth} appObsolete={appObsolete} freeHeight={freeHeight} modalOffsetTop={modalOffsetTop} />

        </View>
    )
}


const styles = StyleSheet.create({
    header: {
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        width: "100%",
    },
    menuIconContainer: {
        width: "15%",
        height: "100%",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingLeft: appStyle.headerHorizPadd,
    },
    titleContainer: {
        width: "70%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: phoneDevice ? RPW(8) : 46,
        color: appStyle.darkWhite,
        letterSpacing: phoneDevice ? 1.5 : 4,
        fontWeight: "600",
    },
    searchIconContainer: {
        width: "15%",
        height: "100%",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingRight: appStyle.headerHorizPadd,
    },
    icon: {
        color: appStyle.darkWhite,
    },
    headerLigne: {
        borderBottomColor: appStyle.lightGrey,
        borderBottomWidth: phoneDevice ? 0.5 : 1,
    },
})