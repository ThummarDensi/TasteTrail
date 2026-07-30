import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ["superadmin", "admin", "moderator"],
        default: "admin"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    refreshToken: {
        type: String,
        default: null
    },
    resetOtp: {
        type: String,
        default: null
    },
    isOtpVerified: {
        type: Boolean,
        default: false
    },
    otpExpires: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;

