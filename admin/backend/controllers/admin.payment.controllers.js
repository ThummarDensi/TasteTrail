import Order from "../models/order.model.js";

export const getAllPayments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status || "";

        const query = { payment: true };
        if (status === "refunded") query.paymentRefunded = true;

        const total = await Order.countDocuments(query);
        const payments = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("user", "fullName email mobile")
            .select("totalAmount payment paymentRefunded createdAt user");

        return res.status(200).json({ payments, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        return res.status(500).json({ message: `Get payments error: ${error.message}` });
    }
};

export const getPaymentById = async (req, res) => {
    try {
        const payment = await Order.findOne({ _id: req.params.paymentId, payment: true })
            .populate("user", "fullName email mobile")
            .populate("shopOrders.shop", "name");
        if (!payment) return res.status(404).json({ message: "Payment not found" });
        return res.status(200).json(payment);
    } catch (error) {
        return res.status(500).json({ message: `Get payment error: ${error.message}` });
    }
};

export const getPaymentSummary = async (req, res) => {
    try {
        const totalRevenue = await Order.aggregate([
            { $match: { payment: true } },
            { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayRevenue = await Order.aggregate([
            { $match: { payment: true, createdAt: { $gte: today } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
        ]);

        const refunded = await Order.countDocuments({ paymentRefunded: true });

        return res.status(200).json({
            totalRevenue: totalRevenue[0]?.total || 0,
            totalTransactions: totalRevenue[0]?.count || 0,
            todayRevenue: todayRevenue[0]?.total || 0,
            todayTransactions: todayRevenue[0]?.count || 0,
            refundedTransactions: refunded
        });
    } catch (error) {
        return res.status(500).json({ message: `Payment summary error: ${error.message}` });
    }
};

