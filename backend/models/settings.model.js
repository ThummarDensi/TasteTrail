import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
    websiteName: {
        type: String,
        default: "Kos Food Delivery"
    },
    logo: {
        type: String,
        default: ""
    },
    favicon: {
        type: String,
        default: ""
    },
    currency: {
        type: String,
        default: "INR"
    },
    currencySymbol: {
        type: String,
        default: "₹"
    },
    deliveryCharge: {
        type: Number,
        default: 40
    },
    gstPercentage: {
        type: Number,
        default: 5
    },
    contactEmail: {
        type: String,
        default: ""
    },
    contactPhone: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    socialMedia: {
        facebook: { type: String, default: "" },
        instagram: { type: String, default: "" },
        twitter: { type: String, default: "" },
        youtube: { type: String, default: "" }
    },
    emailConfig: {
        host: { type: String, default: "" },
        port: { type: Number, default: 587 },
        user: { type: String, default: "" },
        pass: { type: String, default: "" }
    },
    aboutUs: {
        type: String,
        default: ""
    },
    termsAndConditions: {
        type: String,
        default: ""
    },
    privacyPolicy: {
        type: String,
        default: ""
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    }
}, { timestamps: true });

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;

