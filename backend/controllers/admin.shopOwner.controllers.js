import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";
import Order from "../models/order.model.js";

export const getAllShopOwners = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = "", sort = "-createdAt", filter = "" } = req.query;
        const query = { role: "owner" };

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { mobile: { $regex: search, $options: "i" } }
            ];
        }

        if (filter === "active") query.isActive = true;
        else if (filter === "suspended") query.isActive = false;

        const total = await User.countDocuments(query);
        const owners = await User.find(query)
            .select("-password -resetOtp -otpExpires")
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        // Attach shop details
        const ownerIds = owners.map(o => o._id);
        const shops = await Shop.find({ owner: { $in: ownerIds } }).lean();
        const shopMap = {};
        shops.forEach(s => { shopMap[s.owner.toString()] = s; });

        const enriched = owners.map(o => ({
            ...o,
            shop: shopMap[o._id.toString()] || null
        }));

        return res.status(200).json({
            owners: enriched,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        return res.status(500).json({ message: `Get shop owners error: ${error.message}` });
    }
};

export const getShopOwnerById = async (req, res) => {
    try {
        const owner = await User.findById(req.params.ownerId)
            .select("-password -resetOtp -otpExpires")
            .lean();
        if (!owner) {
            return res.status(404).json({ message: "Shop owner not found" });
        }
        const shop = await Shop.findOne({ owner: owner._id })
            .populate("items")
            .lean();

        // Get order stats
        const orders = await Order.find({ "shopOrders.owner": owner._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        let totalRevenue = 0;
        orders.forEach(order => {
            if (order.payment) {
                const shopOrder = order.shopOrders?.find(so => so.owner?.toString() === owner._id.toString());
                if (shopOrder) totalRevenue += shopOrder.subtotal || 0;
            }
        });

        return res.status(200).json({
            owner,
            shop,
            totalOrders: orders.length,
            totalRevenue: Math.round(totalRevenue),
            recentOrders: orders.slice(0, 10)
        });
    } catch (error) {
        return res.status(500).json({ message: `Get shop owner error: ${error.message}` });
    }
};

export const approveShopOwner = async (req, res) => {
    try {
        const owner = await User.findByIdAndUpdate(
            req.params.ownerId,
            { isApproved: true },
            { new: true }
        ).select("-password -resetOtp -otpExpires");
        if (!owner) return res.status(404).json({ message: "Shop owner not found" });
        return res.status(200).json({ message: "Shop owner approved successfully", owner });
    } catch (error) {
        return res.status(500).json({ message: `Approve error: ${error.message}` });
    }
};

export const rejectShopOwner = async (req, res) => {
    try {
        const owner = await User.findByIdAndUpdate(
            req.params.ownerId,
            { isApproved: false },
            { new: true }
        ).select("-password -resetOtp -otpExpires");
        if (!owner) return res.status(404).json({ message: "Shop owner not found" });
        return res.status(200).json({ message: "Shop owner rejected", owner });
    } catch (error) {
        return res.status(500).json({ message: `Reject error: ${error.message}` });
    }
};

export const suspendShopOwner = async (req, res) => {
    try {
        const owner = await User.findByIdAndUpdate(
            req.params.ownerId,
            { isActive: false },
            { new: true }
        ).select("-password -resetOtp -otpExpires");
        if (!owner) return res.status(404).json({ message: "Shop owner not found" });
        return res.status(200).json({ message: "Shop owner suspended", owner });
    } catch (error) {
        return res.status(500).json({ message: `Suspend error: ${error.message}` });
    }
};

export const activateShopOwner = async (req, res) => {
    try {
        const owner = await User.findByIdAndUpdate(
            req.params.ownerId,
            { isActive: true },
            { new: true }
        ).select("-password -resetOtp -otpExpires");
        if (!owner) return res.status(404).json({ message: "Shop owner not found" });
        return res.status(200).json({ message: "Shop owner activated", owner });
    } catch (error) {
        return res.status(500).json({ message: `Activate error: ${error.message}` });
    }
};

export const deleteShopOwner = async (req, res) => {
    try {
        const owner = await User.findByIdAndDelete(req.params.ownerId);
        if (!owner) return res.status(404).json({ message: "Shop owner not found" });
        await Shop.deleteMany({ owner: owner._id });
        return res.status(200).json({ message: "Shop owner and their shops deleted" });
    } catch (error) {
        return res.status(500).json({ message: `Delete error: ${error.message}` });
    }
};

export const updateShopOwner = async (req, res) => {
    try {
        const { fullName, email, mobile } = req.body;
        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (email) updateData.email = email.toLowerCase();
        if (mobile) updateData.mobile = mobile;

        const owner = await User.findByIdAndUpdate(req.params.ownerId, updateData, { new: true })
            .select("-password -resetOtp -otpExpires");
        if (!owner) return res.status(404).json({ message: "Shop owner not found" });
        return res.status(200).json(owner);
    } catch (error) {
        return res.status(500).json({ message: `Update error: ${error.message}` });
    }
};

