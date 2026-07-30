import User from "../models/user.model.js";
import Order from "../models/order.model.js";

export const getAllDeliveryBoys = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || "";
        const status = req.query.status || "";

        const query = { role: "deliveryBoy" };
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { mobile: { $regex: search, $options: "i" } }
            ];
        }
        if (status === "pending") query.isApproved = false;
        if (status === "approved") query.isApproved = true;
        if (status === "suspended") query.isSuspended = true;

        const total = await User.countDocuments(query);
        const deliveryBoys = await User.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select("-password -resetOtp -otpExpires");

        const boysWithStats = await Promise.all(deliveryBoys.map(async (boy) => {
            const totalDeliveries = await Order.countDocuments({
                "shopOrders.assignedDeliveryBoy": boy._id,
                "shopOrders.status": "delivered"
            });
            return { ...boy.toObject(), totalDeliveries };
        }));

        return res.status(200).json({ deliveryBoys: boysWithStats, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        return res.status(500).json({ message: `Get delivery boys error: ${error.message}` });
    }
};

export const getDeliveryBoyById = async (req, res) => {
    try {
        const boy = await User.findOne({ _id: req.params.deliveryBoyId, role: "deliveryBoy" })
            .select("-password -resetOtp -otpExpires");
        if (!boy) return res.status(404).json({ message: "Delivery boy not found" });

        const totalDeliveries = await Order.countDocuments({
            "shopOrders.assignedDeliveryBoy": boy._id,
            "shopOrders.status": "delivered"
        });
        const assignedOrders = await Order.find({ "shopOrders.assignedDeliveryBoy": boy._id })
            .sort({ createdAt: -1 }).limit(20)
            .populate("user", "fullName mobile")
            .populate("shopOrders.shop", "name");

        return res.status(200).json({ ...boy.toObject(), totalDeliveries, assignedOrders });
    } catch (error) {
        return res.status(500).json({ message: `Get delivery boy error: ${error.message}` });
    }
};

export const updateDeliveryBoy = async (req, res) => {
    try {
        const { fullName, email, mobile } = req.body;
        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (email) updateData.email = email;
        if (mobile) updateData.mobile = mobile;

        const boy = await User.findOneAndUpdate(
            { _id: req.params.deliveryBoyId, role: "deliveryBoy" },
            updateData, { new: true }
        ).select("-password -resetOtp -otpExpires");
        if (!boy) return res.status(404).json({ message: "Delivery boy not found" });
        return res.status(200).json(boy);
    } catch (error) {
        return res.status(500).json({ message: `Update delivery boy error: ${error.message}` });
    }
};

export const approveDeliveryBoy = async (req, res) => {
    try {
        const boy = await User.findOneAndUpdate(
            { _id: req.params.deliveryBoyId, role: "deliveryBoy" },
            { isApproved: true, isSuspended: false, isActive: true },
            { new: true }
        ).select("-password -resetOtp -otpExpires");
        if (!boy) return res.status(404).json({ message: "Delivery boy not found" });
        return res.status(200).json({ message: "Delivery boy approved", boy });
    } catch (error) {
        return res.status(500).json({ message: `Approve delivery boy error: ${error.message}` });
    }
};

export const rejectDeliveryBoy = async (req, res) => {
    try {
        const boy = await User.findOneAndUpdate(
            { _id: req.params.deliveryBoyId, role: "deliveryBoy" },
            { isApproved: false, isActive: false },
            { new: true }
        ).select("-password -resetOtp -otpExpires");
        if (!boy) return res.status(404).json({ message: "Delivery boy not found" });
        return res.status(200).json({ message: "Delivery boy rejected", boy });
    } catch (error) {
        return res.status(500).json({ message: `Reject delivery boy error: ${error.message}` });
    }
};

export const suspendDeliveryBoy = async (req, res) => {
    try {
        const boy = await User.findOneAndUpdate(
            { _id: req.params.deliveryBoyId, role: "deliveryBoy" },
            { isSuspended: true, isActive: false },
            { new: true }
        ).select("-password -resetOtp -otpExpires");
        if (!boy) return res.status(404).json({ message: "Delivery boy not found" });
        return res.status(200).json({ message: "Delivery boy suspended", boy });
    } catch (error) {
        return res.status(500).json({ message: `Suspend delivery boy error: ${error.message}` });
    }
};

export const activateDeliveryBoy = async (req, res) => {
    try {
        const boy = await User.findOneAndUpdate(
            { _id: req.params.deliveryBoyId, role: "deliveryBoy" },
            { isSuspended: false, isActive: true },
            { new: true }
        ).select("-password -resetOtp -otpExpires");
        if (!boy) return res.status(404).json({ message: "Delivery boy not found" });
        return res.status(200).json({ message: "Delivery boy activated", boy });
    } catch (error) {
        return res.status(500).json({ message: `Activate delivery boy error: ${error.message}` });
    }
};

export const deleteDeliveryBoy = async (req, res) => {
    try {
        const boy = await User.findOneAndDelete({ _id: req.params.deliveryBoyId, role: "deliveryBoy" });
        if (!boy) return res.status(404).json({ message: "Delivery boy not found" });
        return res.status(200).json({ message: "Delivery boy deleted" });
    } catch (error) {
        return res.status(500).json({ message: `Delete delivery boy error: ${error.message}` });
    }
};

export const assignDeliveryBoyToOrder = async (req, res) => {
    try {
        const { orderId, shopOrderId, deliveryBoyId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        const shopOrder = order.shopOrders.id(shopOrderId);
        if (!shopOrder) return res.status(404).json({ message: "Shop order not found" });

        shopOrder.assignedDeliveryBoy = deliveryBoyId;
        shopOrder.status = "out of delivery";
        await order.save();

        return res.status(200).json({ message: "Delivery boy assigned", order });
    } catch (error) {
        return res.status(500).json({ message: `Assign delivery boy error: ${error.message}` });
    }
};

export const removeDeliveryBoyFromOrder = async (req, res) => {
    try {
        const { orderId, shopOrderId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        const shopOrder = order.shopOrders.id(shopOrderId);
        if (!shopOrder) return res.status(404).json({ message: "Shop order not found" });

        shopOrder.assignedDeliveryBoy = null;
        shopOrder.status = "preparing";
        await order.save();

        return res.status(200).json({ message: "Delivery boy removed", order });
    } catch (error) {
        return res.status(500).json({ message: `Remove delivery boy error: ${error.message}` });
    }
};

