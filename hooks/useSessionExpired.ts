import { useEffect, Dispatch, SetStateAction } from "react";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { logout } from "@/reducers/user";
import * as SecureStore from 'expo-secure-store';

export default function useSessionExpired(sessionExpired: boolean, setSessionExpired: Dispatch<SetStateAction<boolean>>) {
    const router = useRouter()
    const dispatch = useDispatch()

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

}