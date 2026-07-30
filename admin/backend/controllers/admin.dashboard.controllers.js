import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";
import Order from "../models/order.model.js";

export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "user" });
        const totalOwners = await User.countDocuments({ role: "owner" });
        const totalDeliveryBoys = await User.countDocuments({ role: "deliveryBoy" });
        const totalRestaurants = await Shop.countDocuments();
        const totalFoods = await Item.countDocuments();
        const categories = await Item.distinct("category");
        const totalCategories = categories.length;
        const totalOrders = await Order.countDocuments();
        
        const pendingOrders = await Order.countDocuments({ "shopOrders.status": "pending" });
        const preparingOrders = await Order.countDocuments({ "shopOrders.status": "preparing" });
        const outForDeliveryOrders = await Order.countDocuments({ "shopOrders.status": "out of delivery" });
        const deliveredOrders = await Order.countDocuments({ "shopOrders.status": "delivered" });
        const cancelledOrders = await Order.countDocuments({ "shopOrders.status": "cancelled" });

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayOrders = await Order.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        const allOrders = await Order.find({}).lean();
        let totalRevenue = 0;
        let todayRevenue = 0;
        let weeklyRevenue = 0;
        let monthlyRevenue = 0;

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        allOrders.forEach(order => {
            if (order.payment) {
                const amount = order.totalAmount || 0;
                totalRevenue += amount;
                const orderDate = new Date(order.createdAt);
                if (orderDate >= startOfDay && orderDate <= endOfDay) todayRevenue += amount;
                if (orderDate >= startOfWeek) weeklyRevenue += amount;
                if (orderDate >= startOfMonth) monthlyRevenue += amount;
            }
        });

        return res.status(200).json({
            totalUsers, totalOwners, totalDeliveryBoys, totalRestaurants,
            totalFoods, totalCategories, totalOrders, pendingOrders,
            preparingOrders, outForDeliveryOrders, deliveredOrders,
            cancelledOrders, todayOrders,
            todayRevenue: Math.round(todayRevenue),
            weeklyRevenue: Math.round(weeklyRevenue),
            monthlyRevenue: Math.round(monthlyRevenue),
            totalRevenue: Math.round(totalRevenue)
        });
    } catch (error) {
        return res.status(500).json({ message: `Dashboard stats error: ${error.message}` });
    }
};

export const getRevenueGraph = async (req, res) => {
    try {
        const { period = "monthly" } = req.query;
        const now = new Date();
        let startDate, groupFormat;

        if (period === "weekly") {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        } else if (period === "yearly") {
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
            groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        } else {
            startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
            groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        }

        const revenueData = await Order.aggregate([
            { $match: { payment: true, createdAt: { $gte: startDate } } },
            { $group: { _id: groupFormat, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        return res.status(200).json(revenueData);
    } catch (error) {
        return res.status(500).json({ message: `Revenue graph error: ${error.message}` });
    }
};

export const getOrderGraph = async (req, res) => {
    try {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

        const orderData = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    total: { $sum: 1 },
                    delivered: { $sum: { $cond: [{ $eq: ["$shopOrders.status", "delivered"] }, 1, 0] } },
                    cancelled: { $sum: { $cond: [{ $eq: ["$shopOrders.status", "cancelled"] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return res.status(200).json(orderData);
    } catch (error) {
        return res.status(500).json({ message: `Order graph error: ${error.message}` });
    }
};

export const getUserGrowthChart = async (req, res) => {
    try {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    users: { $sum: { $cond: [{ $eq: ["$role", "user"] }, 1, 0] } },
                    owners: { $sum: { $cond: [{ $eq: ["$role", "owner"] }, 1, 0] } },
                    deliveryBoys: { $sum: { $cond: [{ $eq: ["$role", "deliveryBoy"] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return res.status(200).json(userGrowth);
    } catch (error) {
        return res.status(500).json({ message: `User growth error: ${error.message}` });
    }
};

export const getRestaurantGrowthChart = async (req, res) => {
    try {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

        const growth = await Shop.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        return res.status(200).json(growth);
    } catch (error) {
        return res.status(500).json({ message: `Restaurant growth error: ${error.message}` });
    }
};

export const getTopSellingFoods = async (req, res) => {
    try {
        const topFoods = await Order.aggregate([
            { $unwind: "$shopOrders" },
            { $unwind: "$shopOrders.shopOrderItems" },
            {
                $group: {
                    _id: "$shopOrders.shopOrderItems.item",
                    name: { $first: "$shopOrders.shopOrderItems.name" },
                    totalSold: { $sum: "$shopOrders.shopOrderItems.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$shopOrders.shopOrderItems.price", "$shopOrders.shopOrderItems.quantity"] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 10 }
        ]);

        const populated = await Item.populate(topFoods, { path: "_id", select: "name image price" });
        return res.status(200).json(populated.map(f => ({ ...f, item: f._id, _id: f._id?._id || f._id })));
    } catch (error) {
        return res.status(500).json({ message: `Top foods error: ${error.message}` });
    }
};

export const getTopRestaurants = async (req, res) => {
    try {
        const topRestaurants = await Order.aggregate([
            { $unwind: "$shopOrders" },
            { $group: { _id: "$shopOrders.shop", totalOrders: { $sum: 1 }, totalRevenue: { $sum: "$shopOrders.subtotal" } } },
            { $sort: { totalOrders: -1 } },
            { $limit: 10 }
        ]);

        const populated = await Shop.populate(topRestaurants, { path: "_id", select: "name image" });
        return res.status(200).json(populated);
    } catch (error) {
        return res.status(500).json({ message: `Top restaurants error: ${error.message}` });
    }
};

export const getTopCustomers = async (req, res) => {
    try {
        const topCustomers = await Order.aggregate([
            { $group: { _id: "$user", totalOrders: { $sum: 1 }, totalSpent: { $sum: "$totalAmount" } } },
            { $sort: { totalOrders: -1 } },
            { $limit: 10 }
        ]);

        const populated = await User.populate(topCustomers, { path: "_id", select: "fullName email mobile" });
        return res.status(200).json(populated);
    } catch (error) {
        return res.status(500).json({ message: `Top customers error: ${error.message}` });
    }
};

export const getBestDeliveryBoys = async (req, res) => {
    try {
        const bestBoys = await Order.aggregate([
            { $unwind: "$shopOrders" },
            { $match: { "shopOrders.assignedDeliveryBoy": { $ne: null } } },
            {
                $group: {
                    _id: "$shopOrders.assignedDeliveryBoy",
                    totalDeliveries: { $sum: { $cond: [{ $eq: ["$shopOrders.status", "delivered"] }, 1, 0] } }
                }
            },
            { $sort: { totalDeliveries: -1 } },
            { $limit: 10 }
        ]);

        const populated = await User.populate(bestBoys, { path: "_id", select: "fullName email mobile" });
        return res.status(200).json(populated);
    } catch (error) {
        return res.status(500).json({ message: `Best delivery boys error: ${error.message}` });
    }
};

export const getRecentOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 }).limit(10)
            .populate("user", "fullName email mobile")
            .populate("shopOrders.shop", "name").lean();
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ message: `Recent orders error: ${error.message}` });
    }
};

export const getRecentUsers = async (req, res) => {
    try {
        const users = await User.find()
            .sort({ createdAt: -1 }).limit(10)
            .select("-password -resetOtp -otpExpires");
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: `Recent users error: ${error.message}` });
    }
};

export const getRecentRestaurants = async (req, res) => {
    try {
        const shops = await Shop.find()
            .sort({ createdAt: -1 }).limit(10)
            .populate("owner", "fullName email mobile");
        return res.status(200).json(shops);
    } catch (error) {
        return res.status(500).json({ message: `Recent restaurants error: ${error.message}` });
    }
};

