import { createSlice } from '@reduxjs/toolkit';

export const musicSlice = createSlice({
  name: 'music',
  initialState: {
    availableArtists: [],         // start as empty arrays, not null
    tempAvailableArtists: [],
    following: [],                // store just the array of names
    unplayed: null,
    refresh: false,
    startDate: new Date(),
  },
  reducers: {
    setAvailableArtists: (state, action) => {
      // action.payload is your fetched array of artist objects
      const incoming = action.payload;
      // for each artist, set clicked = true if its name is in state.following
      const synced = incoming.map(artist => {
        const key = artist.name || artist.pin;
        return {
          ...artist,
          clicked: state.following.includes(key)
        };
      });

      state.availableArtists     = synced;
      state.tempAvailableArtists = synced;
    },

    setFollowing: (state, action) => {
      // action.payload is your fetched array of artist names
      state.following = action.payload;

      // re-sync tempAvailableArtists so their clicked flags match
      state.tempAvailableArtists = state.availableArtists.map(artist => {
        const key = artist.name || artist.pin;
        return { ...artist, clicked: state.following.includes(key) };
      });
    },

    toggleArtistClick: (state, action) => {
      // no change here; user toggles a single artist
      const id = action.payload;
      const idx = state.tempAvailableArtists.findIndex(a => a.id === id);
      if (idx >= 0) {
        state.tempAvailableArtists[idx].clicked = !state.tempAvailableArtists[idx].clicked;
      }
    },

    toggleSaveSelections: (state) => {
      // commit temp → main
      state.availableArtists = state.tempAvailableArtists;
    },

    toggleExit: (state) => {
      // rollback main → temp
      state.tempAvailableArtists = state.availableArtists;
    },

    toggleRefresh: (state) => {
      state.refresh = !state.refresh;
    },

    setUnplayed: (state, action) => {
      state.unplayed = action.payload;
    },
    
    setStartDate: (state, action) => {
      state.startDate = action.payload;
    },
  }
});

export const {
  setAvailableArtists,
  setFollowing,
  setUnplayed,
  toggleArtistClick,
  toggleSaveSelections,
  toggleExit,
  toggleRefresh,
  setStartDate,
} = musicSlice.actions;

export default musicSlice.reducer;
