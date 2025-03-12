import { createSlice } from '@reduxjs/toolkit';

export const musicSlice = createSlice({
    name: 'music',
    initialState: {
        availableArtists: null,
        tempAvailableArtists: null,
        following: {'following': []},
        unplayed: null,
    },
    reducers: {
        setAvailableArtists: (state, action) => {
            state.availableArtists = action.payload;
            state.tempAvailableArtists = action.payload;
        },
        setFollowing: (state, action) => {
            state.following = action.payload;
        },
        setUnplayed: (state, action) => {
            state.unplayed = action.payload;
        },
        toggleArtistClick: (state, action) => {
            state.tempAvailableArtists[action.payload - 1].clicked = !state.tempAvailableArtists[action.payload - 1].clicked;
        },
        toggleSaveSelections: (state, action) => {
            state.availableArtists = state.tempAvailableArtists;
        },
        toggleExit: (state, action) => {
            state.tempAvailableArtists = state.availableArtists;
        }
    }
})

export const { setAvailableArtists, setFollowing, setUnplayed, toggleArtistClick, toggleSaveSelections, toggleExit } = musicSlice.actions;
export default musicSlice.reducer;