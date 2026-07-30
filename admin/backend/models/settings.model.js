import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
    siteName: {
        type: String,
        default: "Kos Food Delivery"
    },
    siteDescription: {
        type: String,
        default: "Food Delivery Admin Panel"
    },
    logo: {
        type: String,
        default: ""
    },
    favicon: {
        type: String,
        default: ""
    },
    supportEmail: {
        type: String,
        default: ""
    },
    supportPhone: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    currency: {
        type: String,
        default: "INR"
    },
    taxRate: {
        type: Number,
        default: 0
    },
    deliveryCharge: {
        type: Number,
        default: 0
    },
    minimumOrder: {
        type: Number,
        default: 0
    },
    aboutUs: {
        type: String,
        default: ""
    },
    facebook: { type: String, default: "" },
    twitter: { type: String, default: "" },
    instagram: { type: String, default: "" },
    youtube: { type: String, default: "" }
}, { timestamps: true });

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;

