import Order from "../models/order.model.js";

export const getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status || "";
        const search = req.query.search || "";

        const query = {};
        if (status) query["shopOrders.status"] = status;
        if (search) {
            query.$or = [
                { "deliveryAddress.fullName": { $regex: search, $options: "i" } },
                { "deliveryAddress.mobile": { $regex: search, $options: "i" } }
            ];
        }

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("user", "fullName email mobile")
            .populate("shopOrders.shop", "name")
            .populate("shopOrders.assignedDeliveryBoy", "fullName mobile");

        return res.status(200).json({ orders, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        return res.status(500).json({ message: `Get orders error: ${error.message}` });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate("user", "fullName email mobile")
            .populate("shopOrders.shop", "name image")
            .populate("shopOrders.assignedDeliveryBoy", "fullName mobile");
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
        if (status === "delivered") shopOrder.deliveredAt = new Date();

        await order.save();
        return res.status(200).json({ message: "Order status updated", order });
    } catch (error) {
        return res.status(500).json({ message: `Update order status error: ${error.message}` });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.shopOrders.forEach(so => { so.status = "cancelled"; });
        await order.save();

        return res.status(200).json({ message: "Order cancelled", order });
    } catch (error) {
        return res.status(500).json({ message: `Cancel order error: ${error.message}` });
    }
};

export const refundOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.paymentRefunded = true;
        order.shopOrders.forEach(so => { so.status = "refunded"; });
        await order.save();

        return res.status(200).json({ message: "Order refunded", order });
    } catch (error) {
        return res.status(500).json({ message: `Refund order error: ${error.message}` });
    }
};

