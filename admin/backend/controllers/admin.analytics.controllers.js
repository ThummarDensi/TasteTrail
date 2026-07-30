import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";

export const getRevenueAnalytics = async (req, res) => {
    try {
        const monthlyRevenue = await Order.aggregate([
            { $match: { payment: true } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 12 }
        ]);

        const total = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
        const growth = monthlyRevenue.length >= 2
            ? ((monthlyRevenue[monthlyRevenue.length - 1].revenue - monthlyRevenue[0].revenue) / monthlyRevenue[0].revenue * 100).toFixed(2)
            : 0;

        return res.status(200).json({ monthlyRevenue, totalRevenue: total, growthRate: parseFloat(growth) });
    } catch (error) {
        return res.status(500).json({ message: `Revenue analytics error: ${error.message}` });
    }
};

export const getOrdersAnalytics = async (req, res) => {
    try {
        const monthlyOrders = await Order.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    total: { $sum: 1 },
                    delivered: { $sum: { $cond: [{ $eq: ["$shopOrders.status", "delivered"] }, 1, 0] } },
                    cancelled: { $sum: { $cond: [{ $eq: ["$shopOrders.status", "cancelled"] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 12 }
        ]);

        const totalOrders = monthlyOrders.reduce((sum, m) => sum + m.total, 0);
        const totalDelivered = monthlyOrders.reduce((sum, m) => sum + m.delivered, 0);
        const totalCancelled = monthlyOrders.reduce((sum, m) => sum + m.cancelled, 0);

        return res.status(200).json({
            monthlyOrders, totalOrders, totalDelivered, totalCancelled,
            deliveryRate: totalOrders > 0 ? (totalDelivered / totalOrders * 100).toFixed(2) : 0
        });
    } catch (error) {
        return res.status(500).json({ message: `Orders analytics error: ${error.message}` });
    }
};

export const getRestaurantAnalytics = async (req, res) => {
    try {
        const totalRestaurants = await Shop.countDocuments();
        const activeRestaurants = await Shop.countDocuments({ isActive: true });
        const totalFoods = await Item.countDocuments();
        const avgRating = await Item.aggregate([
            { $match: { rating: { $exists: true } } },
            { $group: { _id: null, avg: { $avg: "$rating" } } }
        ]);

        return res.status(200).json({
            totalRestaurants, activeRestaurants, inactiveRestaurants: totalRestaurants - activeRestaurants,
            totalFoods, averageRating: avgRating[0]?.avg?.toFixed(1) || 0
        });
    } catch (error) {
        return res.status(500).json({ message: `Restaurant analytics error: ${error.message}` });
    }
};

export const getFoodAnalytics = async (req, res) => {
    try {
        const totalFoods = await Item.countDocuments();
        const availableFoods = await Item.countDocuments({ isAvailable: true });
        const categories = await Item.distinct("category");
        const popularFoods = await Item.countDocuments({ isPopular: true });

        return res.status(200).json({
            totalFoods, availableFoods, unavailableFoods: totalFoods - availableFoods,
            totalCategories: categories.length, popularFoods
        });
    } catch (error) {
        return res.status(500).json({ message: `Food analytics error: ${error.message}` });
    }
};

export const getUserGrowthAnalytics = async (req, res) => {
    try {
        const monthlyGrowth = await User.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    users: { $sum: { $cond: [{ $eq: ["$role", "user"] }, 1, 0] } },
                    owners: { $sum: { $cond: [{ $eq: ["$role", "owner"] }, 1, 0] } },
                    deliveryBoys: { $sum: { $cond: [{ $eq: ["$role", "deliveryBoy"] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 12 }
        ]);

        const total = await User.countDocuments();

        return res.status(200).json({ monthlyGrowth, totalUsers: total });
    } catch (error) {
        return res.status(500).json({ message: `User growth analytics error: ${error.message}` });
    }
};

export const getDeliveryPerformanceAnalytics = async (req, res) => {
    try {
        const performance = await Order.aggregate([
            { $unwind: "$shopOrders" },
            { $match: { "shopOrders.assignedDeliveryBoy": { $ne: null }, "shopOrders.deliveredAt": { $ne: null } } },
            {
                $project: {
                    deliveryBoy: "$shopOrders.assignedDeliveryBoy",
                    deliveryTime: { $subtract: ["$shopOrders.deliveredAt", "$shopOrders.updatedAt"] }
                }
            },
            {
                $group: {
                    _id: "$deliveryBoy",
                    totalDeliveries: { $sum: 1 },
                    avgDeliveryTime: { $avg: "$deliveryTime" }
                }
            },
            { $sort: { totalDeliveries: -1 } },
            { $limit: 10 }
        ]);

        const populated = await User.populate(performance, { path: "_id", select: "fullName" });

        return res.status(200).json(populated.map(p => ({
            ...p,
            avgDeliveryTimeMinutes: Math.round((p.avgDeliveryTime || 0) / 60000)
        })));
    } catch (error) {
        return res.status(500).json({ message: `Delivery performance analytics error: ${error.message}` });
    }
};

export const getPeakOrderingTimes = async (req, res) => {
    try {
        const peakTimes = await Order.aggregate([
            {
                $group: {
                    _id: { $hour: "$createdAt" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { orders: -1 } }
        ]);

        return res.status(200).json(peakTimes);
    } catch (error) {
        return res.status(500).json({ message: `Peak times error: ${error.message}` });
    }
};

export const getPaymentAnalytics = async (req, res) => {
    try {
        const paymentMethods = await Order.aggregate([
            { $match: { payment: true } },
            {
                $group: {
                    _id: "$paymentMethod",
                    total: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        return res.status(200).json(paymentMethods);
    } catch (error) {
        return res.status(500).json({ message: `Payment analytics error: ${error.message}` });
    }
};

