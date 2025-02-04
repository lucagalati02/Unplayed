import { createSlice } from '@reduxjs/toolkit';

export const themeSlice = createSlice({
    name: 'theme',
    initialState: {
        theme: 'dark'
    },
    reducers: {
        changeTheme: (state, action) => {
            if (state.theme == 'dark') {
                state.theme = 'light';
            } else {
                state.theme = 'dark';
            }
        }
    }
})

export const { changeTheme } = themeSlice.actions;
export default themeSlice.reducer;