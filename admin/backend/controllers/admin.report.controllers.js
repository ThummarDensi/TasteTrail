import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";

export const getSalesReport = async (req, res) => {
    try {
        const { startDate, endDate, period = "daily" } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
        const end = endDate ? new Date(endDate) : new Date();

        let groupFormat;
        if (period === "daily") groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        else if (period === "weekly") groupFormat = { $dateToString: { format: "%Y-W%V", date: "$createdAt" } };
        else groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };

        const salesData = await Order.aggregate([
            { $match: { payment: true, createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: groupFormat,
                    totalRevenue: { $sum: "$totalAmount" },
                    totalOrders: { $sum: 1 },
                    averageOrderValue: { $avg: "$totalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const totalRevenue = salesData.reduce((sum, d) => sum + d.totalRevenue, 0);
        const totalOrders = salesData.reduce((sum, d) => sum + d.totalOrders, 0);

        return res.status(200).json({
            salesData,
            summary: { totalRevenue, totalOrders, averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0 }
        });
    } catch (error) {
        return res.status(500).json({ message: `Sales report error: ${error.message}` });
    }
};

export const getUserReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();

        const totalUsers = await User.countDocuments({ role: "user", createdAt: { $gte: start, $lte: end } });
        const totalOwners = await User.countDocuments({ role: "owner", createdAt: { $gte: start, $lte: end } });
        const totalDeliveryBoys = await User.countDocuments({ role: "deliveryBoy", createdAt: { $gte: start, $lte: end } });

        const activeUsers = await User.countDocuments({ role: "user", isActive: true });
        const activeOwners = await User.countDocuments({ role: "owner", isActive: true });
        const activeDeliveryBoys = await User.countDocuments({ role: "deliveryBoy", isActive: true });

        return res.status(200).json({
            totalUsers, totalOwners, totalDeliveryBoys,
            activeUsers, activeOwners, activeDeliveryBoys,
            total: totalUsers + totalOwners + totalDeliveryBoys
        });
    } catch (error) {
        return res.status(500).json({ message: `User report error: ${error.message}` });
    }
};

export const getRestaurantReport = async (req, res) => {
    try {
        const totalRestaurants = await Shop.countDocuments();
        const activeRestaurants = await Shop.countDocuments({ isActive: true });

        const restaurantStats = await Shop.aggregate([
            {
                $lookup: {
                    from: "orders",
                    let: { shopId: "$_id" },
                    pipeline: [
                        { $unwind: "$shopOrders" },
                        { $match: { $expr: { $eq: ["$shopOrders.shop", "$$shopId"] } } }
                    ],
                    as: "orderData"
                }
            },
            {
                $project: {
                    name: 1,
                    totalOrders: { $size: "$orderData" },
                    totalRevenue: { $sum: "$orderData.shopOrders.subtotal" }
                }
            },
            { $sort: { totalOrders: -1 } }
        ]);

        return res.status(200).json({ totalRestaurants, activeRestaurants, restaurantStats });
    } catch (error) {
        return res.status(500).json({ message: `Restaurant report error: ${error.message}` });
    }
};

export const getDeliveryReport = async (req, res) => {
    try {
        const deliveryStats = await Order.aggregate([
            { $unwind: "$shopOrders" },
            { $match: { "shopOrders.assignedDeliveryBoy": { $ne: null } } },
            {
                $group: {
                    _id: "$shopOrders.assignedDeliveryBoy",
                    totalAssignments: { $sum: 1 },
                    delivered: { $sum: { $cond: [{ $eq: ["$shopOrders.status", "delivered"] }, 1, 0] } },
                    cancelled: { $sum: { $cond: [{ $eq: ["$shopOrders.status", "cancelled"] }, 1, 0] } }
                }
            },
            { $sort: { totalAssignments: -1 } }
        ]);

        const populated = await User.populate(deliveryStats, {
            path: "_id",
            select: "fullName email mobile"
        });

        return res.status(200).json(populated);
    } catch (error) {
        return res.status(500).json({ message: `Delivery report error: ${error.message}` });
    }
};

export const getPaymentReport = async (req, res) => {
    try {
        const paymentStats = await Order.aggregate([
            { $match: { payment: true } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                    totalTransactions: { $sum: 1 },
                    refunded: { $sum: { $cond: [{ $eq: ["$paymentRefunded", true] }, 1, 0] } },
                    refundedAmount: {
                        $sum: { $cond: [{ $eq: ["$paymentRefunded", true] }, "$totalAmount", 0] }
                    }
                }
            }
        ]);

        return res.status(200).json(paymentStats[0] || { totalRevenue: 0, totalTransactions: 0, refunded: 0, refundedAmount: 0 });
    } catch (error) {
        return res.status(500).json({ message: `Payment report error: ${error.message}` });
    }
};

