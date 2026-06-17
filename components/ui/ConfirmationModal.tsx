import { View, Text, StyleSheet } from "react-native";
import { useLayoutSpaces } from "@/hooks/useLayoutSpaces";
import Modal from "react-native-modal"
import Button from "@/components/ui/Button";

import { RPH, RPW, phoneDevice } from '@/utils/dimensions'
import { appStyle } from '@/styles/appStyle';

// TYPES

type ConfirmationModalProps = {
    visible: boolean;
    closeModal: () => void;
    confirmationText: string;
    confirmationBtnText: string;
    confirmationFunc: () => void;
    warning?: { text?: string, success?: boolean },
    cancelBtnText: string;
}

export default function ConfirmationModal({ visible, closeModal, confirmationText, confirmationBtnText, confirmationFunc, warning, cancelBtnText }: ConfirmationModalProps) {

    const { screenHeight, screenWidth } = useLayoutSpaces()

    return (
        <Modal
            isVisible={visible}
            backdropColor="black"
            backdropOpacity={0.85}
            deviceWidth={screenWidth}
            deviceHeight={screenHeight}
            statusBarTranslucent={true}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            supportedOrientations={['portrait', 'landscape']}
            onBackButtonPress={() => closeModal()}
            onBackdropPress={() => closeModal()}
            style={{ alignItems: "center", justifyContent: "center", margin: 0 }}
            useNativeDriverForBackdrop={false}
        >
            <View style={styles.modalBody}>
                <Text style={styles.confirmationText}>
                    {confirmationText}
                </Text>
                <View style={styles.line} />

                <Button func={closeModal} text={cancelBtnText} style={{ marginTop: 0 }} />
                <Button func={confirmationFunc} text={confirmationBtnText} />

                <Text style={[appStyle.warning, warning?.success && appStyle.success, !warning?.text && { height: 0, marginTop: 0 }]}>
                    {warning?.text}
                </Text>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalBody: {
        ...appStyle.card,
    },
    confirmationText: {
        ...appStyle.largeText,
        textAlign: "center",
        color: appStyle.fontColorDarkBg,
        lineHeight: phoneDevice ? RPW(7.3) : 44,
    },
    line: {
        width: "40%",
        ...appStyle.horizontalLine,
        marginVertical: appStyle.largeMarginTop,
    },
})