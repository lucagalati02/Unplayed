import { createSlice } from '@reduxjs/toolkit';

export const musicSlice = createSlice({
    name: 'music',
    initialState: {
        availableArtists: null,
        following: {'following': []},
        unplayed: null,
    },
    reducers: {
        setAvailableArtists: (state, action) => {
            state.availableArtists = action.payload;
        },
        setFollowing: (state, action) => {
            state.following = action.payload;
        },
        setUnplayed: (state, action) => {
            state.unplayed = action.payload;
        },
        toggleArtistClick: (state, action) => {
            const artist = state.availableArtists.find(artist => artist.id == action.payload);
            if (artist) {
                artist.clicked = !artist.clicked;
            }
        }
    }
})

export const { setAvailableArtists, setFollowing, setUnplayed, toggleArtistClick } = musicSlice.actions;
export default musicSlice.reducer;