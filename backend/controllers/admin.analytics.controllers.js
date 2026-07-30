import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";

export const getRevenueAnalytics = async (req, res) => {
    try {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        const monthlyRevenue = await Order.aggregate([
            { $match: { payment: true, createdAt: { $gte: startOfYear } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return res.status(200).json(monthlyRevenue);
    } catch (error) {
        return res.status(500).json({ message: `Revenue analytics error: ${error.message}` });
    }
};

export const getOrdersAnalytics = async (req, res) => {
    try {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        const analytics = await Order.aggregate([
            { $match: { createdAt: { $gte: startOfYear } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    total: { $sum: 1 },
                    cod: {
                        $sum: { $cond: [{ $eq: ["$paymentMethod", "cod"] }, 1, 0] }
                    },
                    online: {
                        $sum: { $cond: [{ $eq: ["$paymentMethod", "online"] }, 1, 0] }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return res.status(200).json(analytics);
    } catch (error) {
        return res.status(500).json({ message: `Orders analytics error: ${error.message}` });
    }
};

export const getRestaurantAnalytics = async (req, res) => {
    try {
        const analytics = await Shop.aggregate([
            {
                $lookup: {
                    from: "orders",
                    let: { shopId: "$_id" },
                    pipeline: [
                        { $unwind: "$shopOrders" },
                        { $match: { $expr: { $eq: ["$shopOrders.shop", "$$shopId"] } } },
                        { $group: { _id: null, orders: { $sum: 1 }, revenue: { $sum: "$shopOrders.subtotal" } } }
                    ],
                    as: "orderData"
                }
            },
            {
                $project: {
                    name: 1,
                    image: 1,
                    city: 1,
                    totalOrders: { $ifNull: [{ $arrayElemAt: ["$orderData.orders", 0] }, 0] },
                    totalRevenue: { $ifNull: [{ $arrayElemAt: ["$orderData.revenue", 0] }, 0] },
                    itemCount: { $size: "$items" }
                }
            },
            { $sort: { totalOrders: -1 } },
            { $limit: 20 }
        ]);

        return res.status(200).json(analytics);
    } catch (error) {
        return res.status(500).json({ message: `Restaurant analytics error: ${error.message}` });
    }
};

export const getFoodAnalytics = async (req, res) => {
    try {
        const topFoods = await Order.aggregate([
            { $unwind: "$shopOrders" },
            { $unwind: "$shopOrders.shopOrderItems" },
            {
                $group: {
                    _id: "$shopOrders.shopOrderItems.item",
                    name: { $first: "$shopOrders.shopOrderItems.name" },
                    totalSold: { $sum: "$shopOrders.shopOrderItems.quantity" },
                    totalRevenue: {
                        $sum: {
                            $multiply: ["$shopOrders.shopOrderItems.price", "$shopOrders.shopOrderItems.quantity"]
                        }
                    },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 20 }
        ]);

        // Get category distribution
        const categoryDistribution = await Item.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        return res.status(200).json({
            topFoods,
            categoryDistribution
        });
    } catch (error) {
        return res.status(500).json({ message: `Food analytics error: ${error.message}` });
    }
};

export const getUserGrowthAnalytics = async (req, res) => {
    try {
        const now = new Date();
        const startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);

        const growth = await User.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    total: { $sum: 1 },
                    users: { $sum: { $cond: [{ $eq: ["$role", "user"] }, 1, 0] } },
                    owners: { $sum: { $cond: [{ $eq: ["$role", "owner"] }, 1, 0] } },
                    deliveryBoys: { $sum: { $cond: [{ $eq: ["$role", "deliveryBoy"] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return res.status(200).json(growth);
    } catch (error) {
        return res.status(500).json({ message: `User growth analytics error: ${error.message}` });
    }
};

export const getDeliveryPerformanceAnalytics = async (req, res) => {
    try {
        const performance = await Order.aggregate([
            { $unwind: "$shopOrders" },
            { $match: { "shopOrders.status": "delivered", "shopOrders.deliveredAt": { $ne: null } } },
            {
                $group: {
                    _id: null,
                    averageDeliveryTime: {
                        $avg: {
                            $divide: [
                                { $subtract: ["$shopOrders.deliveredAt", "$shopOrders.createdAt"] },
                                60000 // Convert to minutes
                            ]
                        }
                    },
                    totalDelivered: { $sum: 1 }
                }
            }
        ]);

        return res.status(200).json({
            averageDeliveryMinutes: performance.length > 0
                ? Math.round(performance[0].averageDeliveryTime)
                : 0,
            totalDelivered: performance.length > 0 ? performance[0].totalDelivered : 0
        });
    } catch (error) {
        return res.status(500).json({ message: `Delivery performance error: ${error.message}` });
    }
};

export const getPeakOrderingTimes = async (req, res) => {
    try {
        const peakTimes = await Order.aggregate([
            {
                $group: {
                    _id: { $hour: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 24 }
        ]);

        return res.status(200).json(peakTimes);
    } catch (error) {
        return res.status(500).json({ message: `Peak times error: ${error.message}` });
    }
};

export const getPaymentAnalytics = async (req, res) => {
    try {
        const analytics = await Order.aggregate([
            {
                $group: {
                    _id: "$paymentMethod",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$totalAmount" },
                    successful: {
                        $sum: { $cond: [{ $eq: ["$payment", true] }, 1, 0] }
                    },
                    failed: {
                        $sum: { $cond: [{ $eq: ["$payment", false] }, 1, 0] }
                    }
                }
            }
        ]);

        return res.status(200).json(analytics);
    } catch (error) {
        return res.status(500).json({ message: `Payment analytics error: ${error.message}` });
    }
};

