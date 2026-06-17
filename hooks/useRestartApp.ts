import { Platform, Dimensions, AppState } from "react-native";
import { useEffect, useRef } from "react";
import { phoneDevice, RPW, RPH } from "@/utils/dimensions";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import Constants from 'expo-constants';

const env = Constants.executionEnvironment
const isBuild = env === "bare" || env === "standalone" ? true : false
const RNRestart = isBuild ? require("react-native-restart-newarch").default : null


export const useRestartApp = () => {
    const isRestartingRef = useRef(false);

    // Function to restart the app
    const tryRestart = () => {
        // if on expo go or already restarting we return
        if (!isBuild || isRestartingRef.current) return;
        isRestartingRef.current = true;
        RNRestart.restart();

        // if the restart failed, let the ref be false again to be able to try later a new restart
        setTimeout(() => {
            isRestartingRef.current = false;
        }, 1000);
    };


    
    /* ================= FONT SCALE RESTART LOGIC ================= */

    // Register the fontScale when app start
    const lastFontScaleRef = useRef(Dimensions.get("window").fontScale)

    // useEffect with a listener for android of focus state to see if the fontScale changed
    useEffect(() => {
        const subscription = Platform.OS !== "android" ? null : AppState.addEventListener("focus", () => {

            const { fontScale } = Dimensions.get("window");

            // console.log("lastFontScale :", lastFontScale, "fontScale :", fontScale)

            if (fontScale !== lastFontScaleRef.current) {
                tryRestart()
                return;
            }
        })

        return () => {
            subscription && subscription.remove()
        }
    }, [])




    /* ================= LAYOUT ZOOM RESTART LOGIC ================= */

    const { width: safeWidth, height : safeHeight } = useSafeAreaFrame()
    const firstAppLaunchRef = useRef(false)

    // useEffect to check if on android the current max screen measure is not the same as the one registered with RPW()/RPH() and Dimensions (because of an accessibility zoom) and restart completely the app
    useEffect(() => {
        if (Platform.OS !== "android" || !isBuild || !safeWidth || isRestartingRef.current) return

        // On android tablets, the app can first be launched in locked portrait mode even if the tablet is in landscape. So safeWidth is not accurate => return
        if ( RPW(100) > RPH(100) && safeWidth < safeHeight && !firstAppLaunchRef.current ){
            firstAppLaunchRef.current = true
            return
        }

        // Current max size of the screen from Dimension (registered at the app launch) and SafeArea
        const dimMaxMeasure = Math.round( Math.max(RPW(100), RPH(100)) );
        const safeMaxMeasure = Math.round( Math.max(safeWidth, safeHeight) );

        // console.log("dimMaxMeasure :", dimMaxMeasure, "safeMaxMeasure :", safeMaxMeasure)

        if (dimMaxMeasure !== safeMaxMeasure) {
            tryRestart()
            return;
        }
    }, [safeWidth])

}