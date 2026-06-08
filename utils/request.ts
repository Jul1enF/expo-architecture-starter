import { Dispatch, SetStateAction, RefObject } from "react"
import { hasId } from "./typeGuards"
import * as SecureStore from 'expo-secure-store';

// FUNCTION TO COUNT THE NUMBER OF DOCS (ARRAYS OR OBJECTS) REGISTERED IN STORED DATA

// Same way of counting than in sendIfUpdated middleware in the back end
const getDocsCount = (storedData: unknown) => {

    // Deserialize data if they have been serialized (by redux)
    const deserializedData: unknown = JSON.parse(JSON.stringify(storedData))

    let docsCount = 0
    const visitedDocs = new WeakSet<object>()

    const extractDocsCount = (doc: unknown) => {
        if (!doc || typeof doc !== "object" || visitedDocs.has(doc)) return
        visitedDocs.add(doc)

        // Add a doc to the count
        if (hasId(doc)) docsCount += 1

        if (Array.isArray(doc)) {
            doc.forEach(e => extractDocsCount(e))
        }
        else {
            // Searching inside an object for other docs
            const recordDoc = doc as Record<string, unknown>

            for (const key in recordDoc) {
                const val = recordDoc[key];

                // If it is an array
                if (Array.isArray(val) && val.length) {
                    val.forEach(e => extractDocsCount(e))
                }
                // If it is an object
                else if (val && typeof val === "object") {
                    extractDocsCount(val);
                }
            }
        }
    }

    extractDocsCount(deserializedData)

    return docsCount
}


// TYPES

type RequestProps = {
    path: string;
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: object;
    params?: string | object;
    sendToken?: boolean;
    setSessionExpired?: Dispatch<SetStateAction<boolean>>;
    functionRef?: RefObject<boolean>;
    setWarning?: Dispatch<SetStateAction<{ text?: string, success?: boolean }>>;
    setModalVisible?: Dispatch<SetStateAction<boolean>>;
    setUploading?: Dispatch<SetStateAction<boolean>>;
    clearEtag?: boolean;
    storedData?: unknown
}

type CustomHeaders = Partial<Record<"Authorization" | "If-None-Match" | "X-Docs-Count" | "Content-Type",
    string
>>

type ApiBaseResponse = {
    result: boolean
    errorText?: string
    successText?: string
    sessionExpired?: boolean
    notModified?: boolean
    delay?: number
    jwtToken?: string
}

type ApiResponse<SpecificApiData = unknown> = ApiBaseResponse & SpecificApiData



// FETCH + ERROR HANDLER

export default async function request<SpecificApiData = unknown>(props: RequestProps): Promise<ApiResponse<SpecificApiData> | void> {
    const { path, method = "GET", body, params, sendToken, setSessionExpired, functionRef, setWarning, setModalVisible, setUploading, clearEtag, storedData } = props

    const warning = !!setWarning
    const modal = !!setModalVisible
    const uploading = !!setUploading
    const session = !!setSessionExpired

    let warningText = ""
    let sessionExpired = false

    const readingTime = (text: string | undefined) => text ? Math.round(text.length * 53) : 0

    const displayWarning = (message?: string, success?: boolean) => {
        if (warning) {
            warningText = message ?? "Erreur : Problème de connexion"
            setWarning({ text: warningText, success: success ?? false })
        }
    }

    if (functionRef) {
        if (!functionRef.current) return;
        functionRef.current = false;
    }
    try {
        warning && setWarning({})
        uploading && setUploading(true)

        const url: string = process.env.EXPO_PUBLIC_BACK_ADDRESS;

        // Headers
        const headers: CustomHeaders = {}
        if (sendToken) {
            const jwtToken = await SecureStore.getItemAsync('jwtToken')
            if (jwtToken) headers["Authorization"] = `Bearer ${jwtToken}`
        }

        if (clearEtag) headers["If-None-Match"] = ""
        if (storedData !== undefined) headers["X-Docs-Count"] = getDocsCount(storedData).toString()


        // Options
        const options: RequestInit = { method, headers };


        // Body
        if (body) {
            if (body instanceof FormData) {
                options.body = body;
            } else {
                headers["Content-Type"] = "application/json";
                options.body = JSON.stringify(body);
            }
        }

        // Params
        const urlParams = params
            ? "/" + (Array.isArray(params) ? params.join("/") : params)
            : "";

        // Fetch
        const response = await fetch(`${url}${path}${urlParams}`, options);
        const data = await response.json() as ApiResponse<SpecificApiData>

        if (!data.result) {
            displayWarning(data.errorText)
            sessionExpired = data.sessionExpired ?? false
            // If the session has not expired (wich mean automatic expulsion of the user), we return the delay during wich the error message will be displayed (in case of an action needed after) and the data in case a check inside is needed
            if (!sessionExpired) return {
                delay: readingTime(warningText) + 400,
                ...data,
            }
        }
        else if (data.notModified) {
            return
        }
        // Successfull fetch with new data
        else {
            if (data.jwtToken && typeof data.jwtToken === "string") {
                await SecureStore.setItemAsync('jwtToken', data.jwtToken)
                delete data.jwtToken
            }
            data.successText && displayWarning(data.successText, true)
            data.delay = readingTime(data.successText) + 400
            return data
        }
    }
    catch (fetchError) {
        console.log(`${path.toUpperCase()} FETCH ERROR :`, fetchError)
        displayWarning()
    }
    finally {
        if (functionRef) functionRef.current = true;
        uploading && setUploading(false)

        if (modal || warningText) setTimeout(() => {
            modal && setModalVisible(false)
            warningText && setWarning?.({})
        }, readingTime(warningText))

        if (session && sessionExpired) {
            const delay = readingTime(warningText) + (modal ? 400 : 0)
            setTimeout(() => setSessionExpired(true), delay)
        }
    }
}