import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";

export const getSalesReport = async (req, res) => {
    try {
        const { period = "daily", startDate, endDate } = req.query;
        let start, end;

        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
        } else {
            end = new Date();
            start = new Date();
            if (period === "daily") {
                start.setHours(0, 0, 0, 0);
            } else if (period === "weekly") {
                start.setDate(start.getDate() - 7);
            } else if (period === "monthly") {
                start.setMonth(start.getMonth() - 1);
            } else if (period === "yearly") {
                start.setFullYear(start.getFullYear() - 1);
            }
        }

        const orders = await Order.find({
            payment: true,
            createdAt: { $gte: start, $lte: end }
        }).populate("user", "fullName email").lean();

        let totalRevenue = 0;
        let totalOrders = orders.length;
        let codOrders = 0;
        let onlineOrders = 0;

        orders.forEach(order => {
            totalRevenue += order.totalAmount || 0;
            if (order.paymentMethod === "cod") codOrders++;
            else onlineOrders++;
        });

        return res.status(200).json({
            period,
            startDate: start,
            endDate: end,
            totalOrders,
            totalRevenue: Math.round(totalRevenue),
            averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
            codOrders,
            onlineOrders,
            orders: orders.slice(0, 100)
        });
    } catch (error) {
        return res.status(500).json({ message: `Sales report error: ${error.message}` });
    }
};

export const getUserReport = async (req, res) => {
    try {
        const { period = "all" } = req.query;
        const query = { role: "user" };

        if (period === "today") {
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            query.createdAt = { $gte: start };
        } else if (period === "week") {
            const start = new Date();
            start.setDate(start.getDate() - 7);
            query.createdAt = { $gte: start };
        } else if (period === "month") {
            const start = new Date();
            start.setMonth(start.getMonth() - 1);
            query.createdAt = { $gte: start };
        }

        const users = await User.find(query)
            .select("-password -resetOtp -otpExpires")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            totalUsers: users.length,
            period,
            users
        });
    } catch (error) {
        return res.status(500).json({ message: `User report error: ${error.message}` });
    }
};

export const getRestaurantReport = async (req, res) => {
    try {
        const shops = await Shop.find({})
            .populate("owner", "fullName email mobile")
            .populate("items")
            .lean();

        const enriched = await Promise.all(shops.map(async (shop) => {
            const orders = await Order.countDocuments({ "shopOrders.shop": shop._id });
            const revenueData = await Order.aggregate([
                { $unwind: "$shopOrders" },
                { $match: { "shopOrders.shop": shop._id, payment: true } },
                { $group: { _id: null, total: { $sum: "$shopOrders.subtotal" } } }
            ]);
            const revenue = revenueData.length > 0 ? revenueData[0].total : 0;

            return {
                ...shop,
                totalOrders: orders,
                totalRevenue: Math.round(revenue)
            };
        }));

        return res.status(200).json({
            totalRestaurants: enriched.length,
            restaurants: enriched
        });
    } catch (error) {
        return res.status(500).json({ message: `Restaurant report error: ${error.message}` });
    }
};

export const getDeliveryReport = async (req, res) => {
    try {
        const deliveryBoys = await User.find({ role: "deliveryBoy" })
            .select("-password -resetOtp -otpExpires")
            .lean();

        const enriched = await Promise.all(deliveryBoys.map(async (boy) => {
            const completed = await Order.countDocuments({
                "shopOrders.assignedDeliveryBoy": boy._id,
                "shopOrders.status": "delivered"
            });
            const pending = await Order.countDocuments({
                "shopOrders.assignedDeliveryBoy": boy._id,
                "shopOrders.status": { $nin: ["delivered", "cancelled"] }
            });
            return {
                ...boy,
                completedDeliveries: completed,
                pendingDeliveries: pending
            };
        }));

        return res.status(200).json({
            totalDeliveryBoys: enriched.length,
            deliveryBoys: enriched
        });
    } catch (error) {
        return res.status(500).json({ message: `Delivery report error: ${error.message}` });
    }
};

export const getPaymentReport = async (req, res) => {
    try {
        const payments = await Order.find({})
            .populate("user", "fullName email")
            .sort({ createdAt: -1 })
            .lean();

        let totalSuccessful = 0, totalFailed = 0;
        let successfulAmount = 0, failedAmount = 0;

        payments.forEach(p => {
            if (p.payment) {
                totalSuccessful++;
                successfulAmount += p.totalAmount || 0;
            } else {
                totalFailed++;
                failedAmount += p.totalAmount || 0;
            }
        });

        return res.status(200).json({
            totalTransactions: payments.length,
            totalSuccessful,
            totalFailed,
            successfulAmount: Math.round(successfulAmount),
            failedAmount: Math.round(failedAmount),
            payments: payments.slice(0, 100)
        });
    } catch (error) {
        return res.status(500).json({ message: `Payment report error: ${error.message}` });
    }
};

