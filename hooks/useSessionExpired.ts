import { useEffect, useState} from "react";
import { useRouter } from "expo-router";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/reducers/user";
import * as SecureStore from 'expo-secure-store';

export const useSessionExpired = () => {

    const [sessionExpired, setSessionExpired] = useState(false)

    const router = useRouter()
    const dispatch = useAppDispatch()

    const logoutUser = async () => {
        setSessionExpired(false)
        router.replace("/")
        dispatch(logout())
        await SecureStore.deleteItemAsync('jwtToken')
    }

    useEffect(() => {
        if (sessionExpired) {
            logoutUser()
        }
    }, [sessionExpired])

    return setSessionExpired
}