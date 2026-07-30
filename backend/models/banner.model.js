import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subtitle: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["home", "offer", "festival", "promotional"],
        default: "home"
    },
    link: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    }
}, { timestamps: true });

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;

