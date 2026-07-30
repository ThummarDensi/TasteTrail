import Order from "../models/order.model.js";
import User from "../models/user.model.js";

export const getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = "", sort = "-createdAt", status = "", paymentMethod = "", startDate = "", endDate = "" } = req.query;
        const query = {};

        if (status) {
            query["shopOrders.status"] = status;
        }
        if (paymentMethod) {
            query.paymentMethod = paymentMethod;
        }
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Search by order ID or user name
        if (search) {
            const users = await User.find({
                $or: [
                    { fullName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } }
                ]
            }).select("_id");
            const userIds = users.map(u => u._id);
            query.$or = [
                { _id: mongoose.isValidObjectId(search) ? search : null },
                { user: { $in: userIds } }
            ].filter(Boolean);
        }

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .sort(sort)
            .populate("user", "fullName email mobile")
            .populate("shopOrders.shop", "name")
            .populate("shopOrders.assignedDeliveryBoy", "fullName mobile")
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        return res.status(200).json({
            orders,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        return res.status(500).json({ message: `Get orders error: ${error.message}` });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate("user", "fullName email mobile")
            .populate("shopOrders.shop", "name image city address")
            .populate("shopOrders.owner", "fullName email mobile")
            .populate("shopOrders.assignedDeliveryBoy", "fullName email mobile")
            .populate("shopOrders.shopOrderItems.item", "name image price")
            .lean();
        if (!order) return res.status(404).json({ message: "Order not found" });
        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({ message: `Get order error: ${error.message}` });
    }
};

export const updateOrderStatusAdmin = async (req, res) => {
    try {
        const { orderId, shopOrderId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        const shopOrder = order.shopOrders.id(shopOrderId);
        if (!shopOrder) return res.status(404).json({ message: "Shop order not found" });

        shopOrder.status = status;

        if (status === "delivered") {
            shopOrder.deliveredAt = new Date();
        }

        await order.save();
        return res.status(200).json({ message: "Order status updated", order });
    } catch (error) {
        return res.status(500).json({ message: `Update status error: ${error.message}` });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.shopOrders.forEach(so => {
            so.status = "cancelled";
        });
        await order.save();
        return res.status(200).json({ message: "Order cancelled successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Cancel order error: ${error.message}` });
    }
};

export const refundOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.shopOrders.forEach(so => {
            so.status = "refunded";
        });
        order.payment = false;
        await order.save();
        return res.status(200).json({ message: "Order refunded successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Refund order error: ${error.message}` });
    }
};

