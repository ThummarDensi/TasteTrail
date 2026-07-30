import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Full Name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        trim: true
    },
    mobile: {
        type: String,
        required: [true, "Mobile number is required"],
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    image: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ["user", "owner", "deliveryBoy"],
        default: "user"
    },
    address: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: ""
    },
    latitude: {
        type: Number,
        default: 0
    },
    longitude: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isSuspended: {
        type: Boolean,
        default: false
    },
    fcmToken: {
        type: String,
        default: ""
    },
    resetOtp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    },
    refreshToken: {
        type: String,
        default: null
    }
}, { timestamps: true })

const User = mongoose.model("User", userSchema)
export default User

