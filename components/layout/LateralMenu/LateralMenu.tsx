import { StyleSheet, View, FlatList } from "react-native"
import { Dispatch, SetStateAction } from "react"
import Modal from "react-native-modal"
import { RPH, RPW, phoneDevice } from "@/utils/dimensions"
import LateralMenuItem from "./LateralMenuItem"
import { appStyle } from "@/styles/appStyle"

import { logout } from "@/reducers/user";
import { useAppSelector, useAppDispatch } from "@/store/hooks"


// TYPES

type LateralMenuProps = {
    menuVisible: boolean;
    setMenuVisible: Dispatch<SetStateAction<boolean>>;
    screenHeight: number;
    screenWidth: number;
    modalOffsetTop : number;
    freeHeight : number;
}

export type LateralMenuItemBase = {
    sectionName : string;
    link?: string;
    func?: undefined | (() => void) ;
}


// COMPONENT

export default function LateralMenu({ menuVisible, setMenuVisible, screenHeight, screenWidth, modalOffsetTop, freeHeight }: LateralMenuProps) {

    const jwtToken = useAppSelector((state) => state.user.value.jwtToken)
    const dispatch = useAppDispatch()
    const logoutUser = () : void => {
        dispatch(logout())
    }

    const sectionsArray : LateralMenuItemBase[] = [
        { sectionName: "Accueil", link: "/" },
        { sectionName: jwtToken ? "Se déconnecter" : "Se connecter / S'inscrire", link: jwtToken ? "/" : "/login", func: jwtToken ? logoutUser : undefined },
        { sectionName: "Tab 2", link: "/tab2" },
    ]
    // user.is_admin && sectionsArray.push({ sectionName: "Écrire / Modifier un article", link: "/redaction" })

    return (
        <Modal
            isVisible={menuVisible}
            style={styles.modal}
            backdropColor="transparent"
            animationIn="slideInLeft"
            animationOut="slideOutLeft"
            onBackButtonPress={() => setMenuVisible(!menuVisible)}
            onBackdropPress={() => setMenuVisible(!menuVisible)}
            deviceWidth={screenWidth}
            deviceHeight={screenHeight}
        >
            <View style={[styles.menu, { height: freeHeight, top: modalOffsetTop + 0.5 }]}>
                <FlatList
                    data={sectionsArray}
                    renderItem={({ item, index }) => {
                        return <LateralMenuItem {...item} setMenuVisible={setMenuVisible} />
                    }}
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                />
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modal: {
        alignItems: "flex-start",
        justifyContent: "flex-start",
        margin: 0,
    },
    menu: {
        width: phoneDevice ? "85%" : "73.5%",
        backgroundColor: appStyle.lightGrey2,
        position: "absolute",
    },
})