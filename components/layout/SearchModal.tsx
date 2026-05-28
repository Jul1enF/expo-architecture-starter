import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useState, Dispatch, SetStateAction } from "react";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Modal from "react-native-modal"
import { RPH, RPW, phoneDevice } from "@/utils/dimensions"
import { appStyle } from "@/styles/appStyle";
import { useRouter } from "expo-router";
import MyTextInput from "@/components/ui/MyTextInput";

type SearchModalProps = {
    searchVisible : boolean, setSearchVisible : Dispatch<SetStateAction<boolean>>, screenWidth : number, screenHeight : number, modalOffsetTop : number
}

export default function SearchModal({ searchVisible, setSearchVisible, screenWidth, screenHeight, modalOffsetTop } : SearchModalProps) {

    const [searchText, setSearchText] = useState('')
    const router = useRouter()

    // Function called when a search is submitted

    const submitSearch = () => {
        router.push(`/searches/${searchText}`)
        setSearchText('')
        setSearchVisible(false)
    }

    return (
        <Modal
            isVisible={searchVisible}
            style={styles.modal}
            backdropColor="transparent"
            animationIn="fadeInDown"
            animationOut="fadeOutUp"
            onBackButtonPress={() => setSearchVisible(!searchVisible)}
            onBackdropPress={() => setSearchVisible(!searchVisible)}
            deviceWidth={screenWidth}
            deviceHeight={screenHeight}
        >
            <LinearGradient style={[styles.searchContainer, { top: modalOffsetTop + 0.5 }]}
                colors={[appStyle.strongRed, appStyle.strongBlack]}
                locations={[0, 0.9]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
            >

                <MyTextInput
                    style={styles.searchInput}
                    placeholder="Rechercher..."
                    onChangeText={(e) => setSearchText(e)}
                    value={searchText}
                    returnKeyType="send"
                    placeholderTextColor={appStyle.placeholderColor}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onSubmitEditing={() => submitSearch()}
                >

                    <TouchableOpacity activeOpacity={0.6} style={styles.searchIconContainer} onPress={() => submitSearch()}>
                        <FontAwesome6 name="magnifying-glass" color={appStyle.darkWhite} size={appStyle.inputIconSize * 0.9} />
                    </TouchableOpacity>

                </MyTextInput>



                <TouchableOpacity activeOpacity={0.6} style={styles.chevronContainer} onPress={() => setSearchVisible(!searchVisible)} >
                    <FontAwesome6 name="chevron-up" color={appStyle.darkWhite} size={appStyle.inputIconSize} />
                </TouchableOpacity>

            </LinearGradient>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modal: {
        alignItems: "flex-start",
        justifyContent: "flex-start",
        margin: 0,
    },
    searchContainer: {
        position: "absolute",
        minHeight: appStyle.secondHeaderHeight,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: appStyle.headerHorizPadd,
        paddingVertical : phoneDevice ? RPW(1.5) : 7,
    },
    searchInput: {
        ...appStyle.regularText,
        ...appStyle.input.withIcon,
        ...appStyle.secondHeaderText,
        color: appStyle.darkWhite,
        height : "100%",
        width: phoneDevice ? RPW(68) : 450,
        maxWidth : Math.min(RPW(80), RPH(80)),
        paddingTop: phoneDevice ? RPW(1) : 5,
        paddingBottom: phoneDevice ? RPW(1) : 5,
         borderBottomColor: appStyle.darkWhite,
        borderBottomWidth: phoneDevice ? 0.5 : 1,
    },
    searchIconContainer: {
        ...appStyle.inputIconContainer,
        paddingRight : 0,
    },
    chevronContainer: {
        position: "absolute",
        right: appStyle.headerHorizPadd,
        height: "100%",
        width: phoneDevice ? RPW(10) : 70,
        alignItems: "flex-end",
        justifyContent: "center",
    }
})