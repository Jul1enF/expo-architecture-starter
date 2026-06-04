import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type User = {
    isConnected : boolean;
    first_name: string,
    last_name: string,
    email: string,
    is_admin : boolean,
    push_token: string,
    bookmarks: string[],
    _id: string
}

export type UserState = {
    value: User
}

type UpdateUserInfosPayload = {
    first_name: string
    last_name: string
    email: string
}

const initialState: UserState = {
    value: {
        isConnected : false,
        first_name: "",
        last_name: "",
        email: "",
        is_admin : false,
        push_token: "",
        bookmarks: [],
        _id: "",
    },
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state: UserState, action: PayloadAction<User>) => {
            state.value = action.payload
        },
        logout: (state: UserState) => {
            state.value = { ...initialState.value }
        },
        changePushToken: (state, action: PayloadAction<string>) => {
            state.value.push_token = action.payload
        },
        addBookmark: (state, action: PayloadAction<string>) => {
            state.value.bookmarks.push(action.payload)
        },
        removeBookmark: (state, action: PayloadAction<string>) => {
            state.value.bookmarks = state.value.bookmarks.filter(e => e !== action.payload)
        },
        changeUserInfos: (state, action: PayloadAction<UpdateUserInfosPayload>) => {
            Object.assign(state.value, action.payload)
        },
    }
})

export const { login, changePushToken, logout, addBookmark, removeBookmark, changeUserInfos } = userSlice.actions
export default userSlice.reducer