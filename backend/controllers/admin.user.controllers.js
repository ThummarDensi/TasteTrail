import User from "../models/user.model.js";
import Order from "../models/order.model.js";

export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = "", sort = "-createdAt", filter = "" } = req.query;
        const query = { role: "user" };

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { mobile: { $regex: search, $options: "i" } }
            ];
        }

        // Apply isBlocked filter if provided
        if (filter === "blocked") query.isBlocked = true;
        else if (filter === "active") query.isBlocked = { $ne: true };

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select("-password -resetOtp -otpExpires")
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        return res.status(200).json({
            users,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        return res.status(500).json({ message: `Get users error: ${error.message}` });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select("-password -resetOtp -otpExpires")
            .lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get user order history
        const orders = await Order.find({ user: user._id })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate("shopOrders.shop", "name")
            .lean();

        return res.status(200).json({ user, orders });
    } catch (error) {
        return res.status(500).json({ message: `Get user error: ${error.message}` });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { fullName, email, mobile } = req.body;
        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (email) updateData.email = email.toLowerCase();
        if (mobile) updateData.mobile = mobile;

        const user = await User.findByIdAndUpdate(req.params.userId, updateData, { new: true })
            .select("-password -resetOtp -otpExpires");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: `Update user error: ${error.message}` });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Delete user error: ${error.message}` });
    }
};

export const blockUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { isBlocked: true },
            { new: true }
        ).select("-password -resetOtp -otpExpires");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message: "User blocked successfully", user });
    } catch (error) {
        return res.status(500).json({ message: `Block user error: ${error.message}` });
    }
};

export const unblockUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { isBlocked: false },
            { new: true }
        ).select("-password -resetOtp -otpExpires");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message: "User unblocked successfully", user });
    } catch (error) {
        return res.status(500).json({ message: `Unblock user error: ${error.message}` });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.userId })
            .sort({ createdAt: -1 })
            .populate("shopOrders.shop", "name")
            .lean();
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ message: `Get user orders error: ${error.message}` });
    }
};

