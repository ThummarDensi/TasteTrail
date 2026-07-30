import { configureStore } from "@reduxjs/toolkit";
import adminSlice from "./adminSlice";
import themeSlice from "./themeSlice";

export const store = configureStore({
    reducer: {
        admin: adminSlice,
        theme: themeSlice
    }
});

