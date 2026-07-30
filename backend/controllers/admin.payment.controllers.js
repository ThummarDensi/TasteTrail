import Order from "../models/order.model.js";

export const getAllPayments = async (req, res) => {
    try {
        const { page = 1, limit = 20, status = "", search = "", startDate = "", endDate = "" } = req.query;
        const query = {};

        if (status === "successful") query.payment = true;
        else if (status === "failed") query.payment = false;
        else if (status === "pending") {
            query.payment = false;
            query.paymentMethod = "online";
        }

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const total = await Order.countDocuments(query);
        const payments = await Order.find(query)
            .sort({ createdAt: -1 })
            .populate("user", "fullName email mobile")
            .select("totalAmount paymentMethod payment razorpayOrderId razorpayPaymentId createdAt")
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        return res.status(200).json({
            payments,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        return res.status(500).json({ message: `Get payments error: ${error.message}` });
    }
};

export const getPaymentById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.paymentId)
            .populate("user", "fullName email mobile")
            .lean();
        if (!order) return res.status(404).json({ message: "Payment not found" });
        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({ message: `Get payment error: ${error.message}` });
    }
};

export const getPaymentSummary = async (req, res) => {
    try {
        const allOrders = await Order.find({}).lean();

        let successful = 0, failed = 0, pending = 0, totalRefunded = 0;
        let successfulAmount = 0, failedAmount = 0, pendingAmount = 0;

        allOrders.forEach(order => {
            const amount = order.totalAmount || 0;
            if (order.payment && order.shopOrders.every(so => so.status !== "refunded")) {
                successful++;
                successfulAmount += amount;
            } else if (order.shopOrders.some(so => so.status === "refunded")) {
                totalRefunded++;
            } else if (order.paymentMethod === "online" && !order.payment) {
                pending++;
                pendingAmount += amount;
            } else {
                failed++;
                failedAmount += amount;
            }
        });

        return res.status(200).json({
            successful,
            failed,
            pending,
            totalRefunded,
            successfulAmount: Math.round(successfulAmount),
            failedAmount: Math.round(failedAmount),
            pendingAmount: Math.round(pendingAmount)
        });
    } catch (error) {
        return res.status(500).json({ message: `Payment summary error: ${error.message}` });
    }
};

