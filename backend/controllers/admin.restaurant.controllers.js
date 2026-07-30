import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const getAllRestaurants = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = "", sort = "-createdAt", filter = "", city = "" } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { address: { $regex: search, $options: "i" } }
            ];
        }

        if (city) {
            query.city = { $regex: new RegExp(`^${city}$`, "i") };
        }

        const total = await Shop.countDocuments(query);
        const shops = await Shop.find(query)
            .populate("owner", "fullName email mobile")
            .populate("items")
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        // Get order counts and revenue
        const shopIds = shops.map(s => s._id);
        const orderStats = await Order.aggregate([
            { $unwind: "$shopOrders" },
            { $match: { "shopOrders.shop": { $in: shopIds } } },
            {
                $group: {
                    _id: "$shopOrders.shop",
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$shopOrders.subtotal" }
                }
            }
        ]);

        const statsMap = {};
        orderStats.forEach(s => { statsMap[s._id.toString()] = s; });

        const enriched = shops.map(shop => ({
            ...shop,
            totalOrders: statsMap[shop._id.toString()]?.totalOrders || 0,
            totalRevenue: Math.round(statsMap[shop._id.toString()]?.totalRevenue || 0)
        }));

        return res.status(200).json({
            restaurants: enriched,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        return res.status(500).json({ message: `Get restaurants error: ${error.message}` });
    }
};

export const getRestaurantById = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.restaurantId)
            .populate("owner", "fullName email mobile")
            .populate("items")
            .lean();
        if (!shop) return res.status(404).json({ message: "Restaurant not found" });

        // Get order stats
        const orders = await Order.find({ "shopOrders.shop": shop._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("user", "fullName")
            .lean();

        let totalRevenue = 0;
        orders.forEach(order => {
            if (order.payment) {
                const so = order.shopOrders?.find(o => o.shop?.toString() === shop._id.toString());
                if (so) totalRevenue += so.subtotal || 0;
            }
        });

        return res.status(200).json({
            restaurant: shop,
            totalOrders: orders.length,
            totalRevenue: Math.round(totalRevenue),
            recentOrders: orders.slice(0, 10)
        });
    } catch (error) {
        return res.status(500).json({ message: `Get restaurant error: ${error.message}` });
    }
};

export const createRestaurant = async (req, res) => {
    try {
        const { name, city, state, address, ownerId } = req.body;
        if (!name || !city || !state || !address) {
            return res.status(400).json({ message: "name, city, state, and address are required" });
        }

        let image = "";
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }

        const shopData = { name, city, state, address, image };
        if (ownerId) shopData.owner = ownerId;

        const shop = await Shop.create(shopData);
        await shop.populate("owner", "fullName email mobile");
        return res.status(201).json(shop);
    } catch (error) {
        return res.status(500).json({ message: `Create restaurant error: ${error.message}` });
    }
};

export const updateRestaurant = async (req, res) => {
    try {
        const { name, city, state, address, ownerId } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (city) updateData.city = city;
        if (state) updateData.state = state;
        if (address) updateData.address = address;
        if (ownerId) updateData.owner = ownerId;

        if (req.file) {
            updateData.image = await uploadOnCloudinary(req.file.path);
        }

        const shop = await Shop.findByIdAndUpdate(req.params.restaurantId, updateData, { new: true })
            .populate("owner", "fullName email mobile")
            .populate("items");
        if (!shop) return res.status(404).json({ message: "Restaurant not found" });
        return res.status(200).json(shop);
    } catch (error) {
        return res.status(500).json({ message: `Update restaurant error: ${error.message}` });
    }
};

export const deleteRestaurant = async (req, res) => {
    try {
        const shop = await Shop.findByIdAndDelete(req.params.restaurantId);
        if (!shop) return res.status(404).json({ message: "Restaurant not found" });
        await Item.deleteMany({ shop: shop._id });
        return res.status(200).json({ message: "Restaurant and its items deleted" });
    } catch (error) {
        return res.status(500).json({ message: `Delete restaurant error: ${error.message}` });
    }
};

export const approveRestaurant = async (req, res) => {
    try {
        const shop = await Shop.findByIdAndUpdate(
            req.params.restaurantId,
            { isApproved: true },
            { new: true }
        ).populate("owner", "fullName email mobile");
        if (!shop) return res.status(404).json({ message: "Restaurant not found" });
        return res.status(200).json({ message: "Restaurant approved", restaurant: shop });
    } catch (error) {
        return res.status(500).json({ message: `Approve error: ${error.message}` });
    }
};

export const rejectRestaurant = async (req, res) => {
    try {
        const shop = await Shop.findByIdAndUpdate(
            req.params.restaurantId,
            { isApproved: false },
            { new: true }
        ).populate("owner", "fullName email mobile");
        if (!shop) return res.status(404).json({ message: "Restaurant not found" });
        return res.status(200).json({ message: "Restaurant rejected", restaurant: shop });
    } catch (error) {
        return res.status(500).json({ message: `Reject error: ${error.message}` });
    }
};

