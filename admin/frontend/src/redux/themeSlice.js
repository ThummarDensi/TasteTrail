import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
    name: "theme",
    initialState: {
        darkMode: localStorage.getItem("adminDarkMode") === "true",
    },
    reducers: {
        toggleDarkMode: (state) => {
            state.darkMode = !state.darkMode;
            localStorage.setItem("adminDarkMode", state.darkMode);
        },
        setDarkMode: (state, action) => {
            state.darkMode = action.payload;
            localStorage.setItem("adminDarkMode", action.payload);
        }
    }
});

export const { toggleDarkMode, setDarkMode } = themeSlice.actions;
export default themeSlice.reducer;

