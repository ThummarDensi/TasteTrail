import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import DeliveryAssignment from "../models/deliveryAssignment.model.js";

export const getAllDeliveryBoys = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = "", sort = "-createdAt", filter = "" } = req.query;
        const query = { role: "deliveryBoy" };

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { mobile: { $regex: search, $options: "i" } }
            ];
        }

        if (filter === "online") query.isOnline = true;
        else if (filter === "offline") query.isOnline = false;
        else if (filter === "active") query.isActive = true;
        else if (filter === "suspended") query.isActive = false;

        const total = await User.countDocuments(query);
        const deliveryBoys = await User.find(query)
            .select("-password -resetOtp -otpExpires")
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        return res.status(200).json({
            deliveryBoys,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        return res.status(500).json({ message: `Get delivery boys error: ${error.message}` });
    }
};

export const getDeliveryBoyById = async (req, res) => {
    try {
        const deliveryBoy = await User.findById(req.params.deliveryBoyId)
            .select("-password -resetOtp -otpExpires")
            .lean();
        if (!deliveryBoy) {
            return res.status(404).json({ message: "Delivery boy not found" });
        }

        // Get delivery history
        const assignments = await DeliveryAssignment.find({ assignedTo: deliveryBoy._id })
            .populate("order")
            .populate("shop", "name")
            .sort({ createdAt: -1 })
            .lean();

        const deliveredCount = assignments.filter(a => a.status === "completed").length;
        const totalEarnings = deliveredCount * 50; // Example: ₹50 per delivery

        // Current active order
        const currentOrder = await Order.findOne({
            "shopOrders.assignedDeliveryBoy": deliveryBoy._id,
            "shopOrders.status": { $nin: ["delivered", "cancelled"] }
        }).populate("shopOrders.shop", "name").lean();

        return res.status(200).json({
            deliveryBoy,
            totalDeliveries: deliveredCount,
            totalEarnings,
            currentOrder,
            deliveryHistory: assignments.slice(0, 20)
        });
    } catch (error) {
        return res.status(500).json({ message: `Get delivery boy error: ${error.message}` });
    }
};

export const approveDeliveryBoy = async (req, res) => {
    try {
        const boy = await User.findByIdAndUpdate(
            req.params.deliveryBoyId,
            { isApproved: true },
            { new: true }
        ).select("-password -resetOtp -otpExpires");
        if (!boy) return res.status(404).json({ message: "Delivery boy not found" });
        return res.status(200).json({ message: "Delivery boy approved", deliveryBoy: boy });
    } catch (error) {
        return res.status(500).json({ message: `Approve error: ${error.message}` });
    }
};

export const rejectDeliveryBoy = async (req, res) => {
    try {
        const boy = await User.findByIdAndUpdate(
            req.params.deliveryBoyId,
            { isApproved: false },
            { new: true }
        ).select("-password -resetOtp -otpExpires");
        if (!boy) return res.status(404).json({ message: "Delivery boy not found" });
        return res.status(200).json({ message: "Delivery boy rejected", deliveryBoy: boy });
    } catch (error) {
        return res.status(500).json({ message: `Reject error: ${error.message}` });
    }
};

export const suspendDeliveryBoy = async (req, res) => {
    try {
        const boy = await User.findByIdAndUpdate(
            req.params.deliveryBoyId,
            { isActive: false },
            { new: true }
        ).select("-password -resetOtp -otpExpires");
        if (!boy) return res.status(404).json({ message: "Delivery boy not found" });
        return res.status(200).json({ message: "Delivery boy suspended", deliveryBoy: boy });
    } catch (error) {
        return res.status(500).json({ message: `Suspend error: ${error.message}` });
    }
};

export const activateDeliveryBoy = async (req, res) => {
    try {
        const boy = await User.findByIdAndUpdate(
            req.params.deliveryBoyId,
            { isActive: true },
            { new: true }
        ).select("-password -resetOtp -otpExpires");
        if (!boy) return res.status(404).json({ message: "Delivery boy not found" });
        return res.status(200).json({ message: "Delivery boy activated", deliveryBoy: boy });
    } catch (error) {
        return res.status(500).json({ message: `Activate error: ${error.message}` });
    }
};

export const deleteDeliveryBoy = async (req, res) => {
    try {
        const boy = await User.findByIdAndDelete(req.params.deliveryBoyId);
        if (!boy) return res.status(404).json({ message: "Delivery boy not found" });
        await DeliveryAssignment.deleteMany({ assignedTo: boy._id });
        return res.status(200).json({ message: "Delivery boy deleted" });
    } catch (error) {
        return res.status(500).json({ message: `Delete error: ${error.message}` });
    }
};

export const updateDeliveryBoy = async (req, res) => {
    try {
        const { fullName, email, mobile } = req.body;
        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (email) updateData.email = email.toLowerCase();
        if (mobile) updateData.mobile = mobile;

        const boy = await User.findByIdAndUpdate(req.params.deliveryBoyId, updateData, { new: true })
            .select("-password -resetOtp -otpExpires");
        if (!boy) return res.status(404).json({ message: "Delivery boy not found" });
        return res.status(200).json(boy);
    } catch (error) {
        return res.status(500).json({ message: `Update error: ${error.message}` });
    }
};

export const assignDeliveryBoyToOrder = async (req, res) => {
    try {
        const { orderId, shopOrderId, deliveryBoyId } = req.body;
        if (!orderId || !shopOrderId || !deliveryBoyId) {
            return res.status(400).json({ message: "orderId, shopOrderId, and deliveryBoyId are required" });
        }

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        const shopOrder = order.shopOrders.id(shopOrderId);
        if (!shopOrder) return res.status(404).json({ message: "Shop order not found" });

        shopOrder.assignedDeliveryBoy = deliveryBoyId;
        await order.save();

        // Create or update assignment
        let assignment = await DeliveryAssignment.findOne({ order: orderId, shopOrderId });
        if (assignment) {
            assignment.assignedTo = deliveryBoyId;
            assignment.status = "assigned";
            assignment.acceptedAt = new Date();
        } else {
            assignment = await DeliveryAssignment.create({
                order: orderId,
                shop: shopOrder.shop,
                shopOrderId,
                assignedTo: deliveryBoyId,
                status: "assigned",
                acceptedAt: new Date()
            });
        }
        await assignment.save();

        return res.status(200).json({ message: "Delivery boy assigned successfully", assignment });
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
        await order.save();

        await DeliveryAssignment.findOneAndUpdate(
            { order: orderId, shopOrderId },
            { assignedTo: null, status: "brodcasted" }
        );

        return res.status(200).json({ message: "Delivery boy removed from order" });
    } catch (error) {
        return res.status(500).json({ message: `Remove delivery boy error: ${error.message}` });
    }
};

