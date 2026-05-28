import { Platform } from "react-native";
import { useSafeAreaFrame, useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from 'expo-constants';
import { appStyle } from "@/styles/appStyle"

type UseLayoutSpacesOptions = {
    tabBar?: boolean | undefined;
    secondHeader?: boolean | undefined;
    header?: boolean | undefined;
}

export default function useLayoutSpaces({ tabBar = true, secondHeader = false, header = true }: UseLayoutSpacesOptions = {}) {

    const { height: screenHeight, width: screenWidth } = useSafeAreaFrame()

    const insets = useSafeAreaInsets();

    const tabbarPaddingBottom = Platform.OS === "ios" ? insets.bottom / 2 : insets.bottom

    const statusBarOffset = Platform.OS === "ios" ? Constants.statusBarHeight : insets.top

    const fullHeaderHeight = header ? (appStyle.headerHeight + statusBarOffset) : 0

    const topBlockedHeight = fullHeaderHeight + (secondHeader ? appStyle.secondHeaderHeight : 0)

    const env = Constants.executionEnvironment
    const isBuild = env === "bare" || env === "standalone" ? true : false

    // On expo go Android, for modals (react-native-modal), top : 0 already include the statusBarOffset
    const modalOffsetTop = Platform.OS === "ios" || isBuild ? topBlockedHeight : topBlockedHeight - statusBarOffset

    // Height of the tabbar with the inset padding
    const fullTabBarHeight = tabBar ? appStyle.tabBarHeight + tabbarPaddingBottom : 0

    const freeHeight = screenHeight - topBlockedHeight - fullTabBarHeight

    return { freeHeight, screenHeight, screenWidth, modalOffsetTop, statusBarOffset, topBlockedHeight, fullTabBarHeight, fullHeaderHeight }
}