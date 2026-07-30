import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        default: null
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        default: null
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        default: ""
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    isHidden: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;

