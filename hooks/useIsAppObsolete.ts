import { useState, useEffect } from 'react'
import { AppState } from 'react-native'
import * as Application from 'expo-application'
import request from '@/utils/request'


const isRunningVersionObsolete = (runningVersion : string | null, minimumVersion : string) => {
    let obsoleteBuild = false

    if (!!(!runningVersion || !minimumVersion)) return obsoleteBuild

    const runningVersionNumbers = runningVersion.split('.').map(e => Number(e))
    const minimumVersionNumbers = minimumVersion.split('.').map(e => Number(e))

    if (minimumVersionNumbers[0] && runningVersionNumbers[0] && 
        minimumVersionNumbers[0] > runningVersionNumbers[0]) {
        obsoleteBuild = true
    }
    else if (minimumVersionNumbers[0] == runningVersionNumbers[0]) {
        if (minimumVersionNumbers[1] && runningVersionNumbers[1] &&
            minimumVersionNumbers[1] > runningVersionNumbers[1]) {
            obsoleteBuild = true
        } else if (minimumVersionNumbers[1] == runningVersionNumbers[1]) {
            if (minimumVersionNumbers[2] && runningVersionNumbers[2] &&
                minimumVersionNumbers[2] > runningVersionNumbers[2]) {
                obsoleteBuild = true
            }
        }
    }
    return obsoleteBuild
}



export default function useIsAppObsolete() {

    const [appObsolete, setAppObsolete] = useState(false)

    const updateAppVersionStatus = async () => {
        const data = await request<{ appMinimumVersion : string }>({ path: '/users/getAppMinimumVersion' })
        if (data?.result) {
            const appRunningVersion = Application.nativeApplicationVersion
            
            const { appMinimumVersion } = data

           setAppObsolete(isRunningVersionObsolete(appRunningVersion, appMinimumVersion))
        }
    }

    useEffect(() => {
        updateAppVersionStatus()

        const subscription = AppState.addEventListener("change", (state) => {
            if (state === "active") {
                updateAppVersionStatus()
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    return appObsolete
}