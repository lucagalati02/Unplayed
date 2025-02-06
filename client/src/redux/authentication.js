import { createSlice } from '@reduxjs/toolkit';

export const authenticationSlice = createSlice({
    name: 'authentication',
    initialState: {
        user: null,
        isAuthorized: false,
        isSignedIn: false,
    },
    reducers: {
        login: (state, action) => {
            state.user = action.payload.email;
            state.isSignedIn = action.payload.verified;
        },
        authorize: (state, action) => {
            state.isAuthorized = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isSignedIn = false;
            state.isAuthorized = false;
        },
    }
})

export const { login, logout, authorize } = authenticationSlice.actions;
export default authenticationSlice.reducer;