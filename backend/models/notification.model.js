import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["push", "email", "sms"],
        default: "push"
    },
    recipientType: {
        type: String,
        enum: ["all_users", "all_owners", "all_delivery_boys", "specific_users", "specific_restaurants"],
        default: "all_users"
    },
    recipients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    },
    isSent: {
        type: Boolean,
        default: false
    },
    sentAt: {
        type: Date,
        default: null
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;

