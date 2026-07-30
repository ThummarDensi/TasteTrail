import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";

export const getAllShopOwners = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || "";
        const status = req.query.status || "";

        const query = { role: "owner" };
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
        const owners = await User.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select("-password -resetOtp -otpExpires");

        const ownersWithShops = await Promise.all(owners.map(async (owner) => {
            const shops = await Shop.find({ owner: owner._id }).select("name image isActive");
            return { ...owner.toObject(), shops };
        }));

        return res.status(200).json({ owners: ownersWithShops, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        return res.status(500).json({ message: `Get shop owners error: ${error.message}` });
    }
};

export const getShopOwnerById = async (req, res) => {
    try {
        const owner = await User.findOne({ _id: req.params.ownerId, role: "owner" })
            .select("-password -resetOtp -otpExpires");
        if (!owner) return res.status(404).json({ message: "Shop owner not found" });
        const shops = await Shop.find({ owner: owner._id });
        return res.status(200).json({ ...owner.toObject(), shops });
    } catch (error) {
        return res.status(500).json({ message: `Get shop owner error: ${error.message}` });
    }
};

export const updateShopOwner = async (req, res) => {
    try {
        const { fullName, email, mobile } = req.body;
        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (email) updateData.email = email;
        if (mobile) updateData.mobile = mobile;

        const owner = await User.findOneAndUpdate(
            { _id: req.params.ownerId, role: "owner" },
            updateData,
            { new: true }
        ).select("-password -resetOtp -otpExpires");
        if (!owner) return res.status(404).json({ message: "Shop owner not found" });
        return res.status(200).json(owner);
    } catch (error) {
        return res.status(500).json({ message: `Update shop owner error: ${error.message}` });
    }
};

export const approveShopOwner = async (req, res) => {
    try {
        const owner = await User.findOneAndUpdate(
            { _id: req.params.ownerId, role: "owner" },
            { isApproved: true, isSuspended: false, isActive: true },
            { new: true }
        ).select("-password -resetOtp -otpExpires");
        if (!owner) return res.status(404).json({ message: "Shop owner not found" });
        return res.status(200).json({ message: "Shop owner approved successfully", owner });
    } catch (error) {
        return res.status(500).json({ message: `Approve shop owner error: ${error.message}` });
    }
};

export const rejectShopOwner = async (req, res) => {
    try {
        const owner = await User.findOneAndUpdate(
            { _id: req.params.ownerId, role: "owner" },
            { isApproved: false, isActive: false },
            { new: true }
        ).select("-password -resetOtp -otpExpires");
        if (!owner) return res.status(404).json({ message: "Shop owner not found" });
        return res.status(200).json({ message: "Shop owner rejected", owner });
    } catch (error) {
        return res.status(500).json({ message: `Reject shop owner error: ${error.message}` });
    }
};

export const suspendShopOwner = async (req, res) => {
    try {
        const owner = await User.findOneAndUpdate(
            { _id: req.params.ownerId, role: "owner" },
            { isSuspended: true, isActive: false },
            { new: true }
        ).select("-password -resetOtp -otpExpires");
        if (!owner) return res.status(404).json({ message: "Shop owner not found" });
        return res.status(200).json({ message: "Shop owner suspended", owner });
    } catch (error) {
        return res.status(500).json({ message: `Suspend shop owner error: ${error.message}` });
    }
};

export const activateShopOwner = async (req, res) => {
    try {
        const owner = await User.findOneAndUpdate(
            { _id: req.params.ownerId, role: "owner" },
            { isSuspended: false, isActive: true },
            { new: true }
        ).select("-password -resetOtp -otpExpires");
        if (!owner) return res.status(404).json({ message: "Shop owner not found" });
        return res.status(200).json({ message: "Shop owner activated", owner });
    } catch (error) {
        return res.status(500).json({ message: `Activate shop owner error: ${error.message}` });
    }
};

export const deleteShopOwner = async (req, res) => {
    try {
        const owner = await User.findOneAndDelete({ _id: req.params.ownerId, role: "owner" });
        if (!owner) return res.status(404).json({ message: "Shop owner not found" });
        await Shop.deleteMany({ owner: owner._id });
        return res.status(200).json({ message: "Shop owner deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Delete shop owner error: ${error.message}` });
    }
};

