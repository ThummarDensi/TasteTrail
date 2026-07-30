import mongoose from "mongoose"

const shopOrderItemSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    },
    name: String,
    price: Number,
    quantity: Number,
    image: String
})

const shopOrderSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },
    shopOrderItems: [shopOrderItemSchema],
    subtotal: {
        type: Number,
        default: 0
    },
    deliveryCharge: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "preparing", "out of delivery", "delivered", "cancelled", "refunded"],
        default: "pending"
    },
    assignedDeliveryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    deliveredAt: {
        type: Date,
        default: null
    },
    deliveryOtp: {
        type: String,
        default: null
    }
})

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    shopOrders: [shopOrderSchema],
    totalAmount: {
        type: Number,
        default: 0
    },
    totalDeliveryCharge: {
        type: Number,
        default: 0
    },
    coupon: {
        type: String,
        default: null
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    payment: {
        type: Boolean,
        default: false
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "Card", "UPI", "NetBanking", "Wallet"],
        default: "COD"
    },
    paymentRefunded: {
        type: Boolean,
        default: false
    },
    deliveryAddress: {
        fullName: { type: String, default: "" },
        mobile: { type: String, default: "" },
        address: { type: String, default: "" },
        city: { type: String, default: "" },
        latitude: { type: Number, default: 0 },
        longitude: { type: Number, default: 0 }
    },
    orderNote: {
        type: String,
        default: ""
    }
}, { timestamps: true })

const Order = mongoose.model("Order", orderSchema)
export default Order

