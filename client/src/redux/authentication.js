import { createSlice } from '@reduxjs/toolkit';

export const authenticationSlice = createSlice({
    name: 'authentication',
    initialState: {
        user: null,
        isAuthenticated: false,
    },
    reducers: {
        login: (state, action) => {
            state.user = action.payload.email;
            state.isAuthenticated = action.payload.verified;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
    }
})

export const { login, logout } = authenticationSlice.actions;
export default authenticationSlice.reducer;