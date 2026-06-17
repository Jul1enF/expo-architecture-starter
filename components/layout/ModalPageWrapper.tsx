import { ScrollView } from "react-native"
import { Dispatch, ReactNode, SetStateAction } from "react"

import { appStyle } from "@/styles/appStyle"

import Modal from "react-native-modal"
import { useLayoutSpaces } from "@/hooks/useLayoutSpaces"
import GoingBackHeader from "@/components/ui/GoingBackHeader";
import { AutocompleteProvider } from "@/components/ui/Autocomplete/AutocompleteProvider";
// import { KeyboardProvider } from "react-native-keyboard-controller";


type ModalPageWrapperProps = {
    visible: boolean;
    setVisible?: Dispatch<SetStateAction<boolean>>;
    closeFunction: ()=>void;
    backHeaderText: string;
    noScrollView?: boolean;
    children: ReactNode;
}


export default function ModalPageWrapper({ visible, setVisible, closeFunction, backHeaderText, noScrollView, children } : ModalPageWrapperProps) {

    const { freeHeight, screenHeight, screenWidth } = useLayoutSpaces({tabBar : true})

    const close = () => {
        typeof setVisible === "function" && setVisible(false)
        typeof closeFunction === "function" && closeFunction()
    }

    return (
        <Modal
            isVisible={visible}
            style={{ maxHeight: freeHeight, top: 0, width: "100%", alignItems: "flex-start", justifyContent: "flex-start", margin: 0, zIndex: 999 }}
            coverScreen={false}
            backdropColor="transparent"
            animationIn="slideInRight"
            animationOut="slideOutRight"
            onBackButtonPress={close}
            onModalHide={close}
            deviceWidth={screenWidth}
            deviceHeight={screenHeight}
            useNativeDriverForBackdrop={true}
        >
            <AutocompleteProvider modalPageWrapper={true}>
                {/* <KeyboardProvider> */}

                    <GoingBackHeader previousPageName={backHeaderText} leftFunction={close} />

                    {noScrollView && [children]}


                    {!noScrollView && <ScrollView style={{ minWidth: "100%" }} contentContainerStyle={{ backgroundColor: appStyle.pageBody.backgroundColor, minHeight: freeHeight }} bounces={false} overScrollMode="never" keyboardShouldPersistTaps="handled" >

                        {[children]}

                    </ScrollView>}

                {/* </KeyboardProvider> */}
            </AutocompleteProvider>
        </Modal>
    )
}