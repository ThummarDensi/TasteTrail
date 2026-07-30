import User from "../models/user.model.js";

export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || "";
        const role = req.query.role || "";
        const status = req.query.status || "";

        const query = {};
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { mobile: { $regex: search, $options: "i" } }
            ];
        }
        if (role) query.role = role;
        if (status === "active") query.isActive = true;
        if (status === "blocked") query.isActive = false;

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select("-password -resetOtp -otpExpires");

        return res.status(200).json({ users, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        return res.status(500).json({ message: `Get users error: ${error.message}` });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select("-password -resetOtp -otpExpires");
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: `Get user error: ${error.message}` });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { fullName, email, mobile, isActive } = req.body;
        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (email) updateData.email = email;
        if (mobile) updateData.mobile = mobile;
        if (isActive !== undefined) updateData.isActive = isActive;

        const user = await User.findByIdAndUpdate(req.params.userId, updateData, { new: true })
            .select("-password -resetOtp -otpExpires");
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: `Update user error: ${error.message}` });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Delete user error: ${error.message}` });
    }
};

export const blockUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.userId, { isActive: false }, { new: true })
            .select("-password -resetOtp -otpExpires");
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json({ message: "User blocked successfully", user });
    } catch (error) {
        return res.status(500).json({ message: `Block user error: ${error.message}` });
    }
};

export const unblockUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.userId, { isActive: true }, { new: true })
            .select("-password -resetOtp -otpExpires");
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json({ message: "User unblocked successfully", user });
    } catch (error) {
        return res.status(500).json({ message: `Unblock user error: ${error.message}` });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.userId })
            .sort({ createdAt: -1 })
            .populate("shopOrders.shop", "name");
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ message: `Get user orders error: ${error.message}` });
    }
};

import Order from "../models/order.model.js";

