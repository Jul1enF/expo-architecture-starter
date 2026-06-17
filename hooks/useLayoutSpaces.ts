import { Platform } from "react-native";
import { useSafeAreaFrame, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigationState, NavigationState, PartialState } from "@react-navigation/native";
import Constants from 'expo-constants';
import { appStyle } from "@/styles/appStyle"

type UseLayoutSpacesOptions = {
    tabBar?: boolean | undefined;
    secondHeader?: boolean | undefined;
    header?: boolean | undefined;
}

export const useLayoutSpaces = ({ tabBar, secondHeader = false, header = true }: UseLayoutSpacesOptions = {}) => {

    const tabBarDetected = useNavigationState((state: NavigationState | PartialState<NavigationState> | undefined) => {
        if (!state) return false;

        function findTab(navState: NavigationState | PartialState<NavigationState>): boolean {
            if (!navState) return false;
            if (navState.type === "tab") return true;

            const routes = navState.routes ?? [];
            const routesToCheck = navState.stale ? routes : [routes[navState.index ?? 0]];

            for (const route of routesToCheck) {
                // If the route name includes "tabs", it means it's a tab layout
                if (route?.name?.includes("tabs")) return true;
                if (route?.state && findTab(route.state)) return true;
            }
            return false;
        }

        return findTab(state as NavigationState);
    });


    const tabBarDisplayed = tabBar ?? tabBarDetected



    const { height: screenHeight, width: screenWidth } = useSafeAreaFrame()

    const insets = useSafeAreaInsets();

    const tabbarPaddingBottom = Platform.OS === "ios" ? insets.bottom / 2 : insets.bottom



    const statusBarOffset = Platform.OS === "ios" ? Constants.statusBarHeight : insets.top

    const fullHeaderHeight = header ? (appStyle.headerHeight + statusBarOffset) : 0

    const topBlockedHeight = fullHeaderHeight + (secondHeader ? appStyle.secondHeaderHeight : 0)

    const env = Constants.executionEnvironment
    const isBuild = env === "bare" || env === "standalone"

    // On expo go Android, for modals (react-native-modal), top : 0 already include the statusBarOffset
    const modalOffsetTop = Platform.OS === "ios" || isBuild ? topBlockedHeight : topBlockedHeight - statusBarOffset

    // Height of the tabbar with the inset padding
    const fullTabBarHeight = tabBarDisplayed ? appStyle.tabBarHeight + tabbarPaddingBottom : 0

    const freeHeight = screenHeight - topBlockedHeight - fullTabBarHeight

    return { freeHeight, screenHeight, screenWidth, modalOffsetTop, statusBarOffset, topBlockedHeight, fullTabBarHeight, fullHeaderHeight }
}