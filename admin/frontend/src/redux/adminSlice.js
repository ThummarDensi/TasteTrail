import { createSlice } from "@reduxjs/toolkit";

const adminSlice = createSlice({
    name: "admin",
    initialState: {
        adminData: null,
        isAuthenticated: false,
        sidebarOpen: true,
    },
    reducers: {
        setAdminData: (state, action) => {
            state.adminData = action.payload;
            state.isAuthenticated = true;
        },
        clearAdminData: (state) => {
            state.adminData = null;
            state.isAuthenticated = false;
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        }
    }
});

export const { setAdminData, clearAdminData, toggleSidebar } = adminSlice.actions;
export default adminSlice.reducer;

