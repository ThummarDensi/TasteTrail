import Shop from "../models/shop.model.js";

export const getAllRestaurants = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || "";
        const status = req.query.status || "";

        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { city: { $regex: search, $options: "i" } },
                { address: { $regex: search, $options: "i" } }
            ];
        }
        if (status === "active") query.isActive = true;
        if (status === "inactive") query.isActive = false;

        const total = await Shop.countDocuments(query);
        const restaurants = await Shop.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("owner", "fullName email mobile");

        return res.status(200).json({ restaurants, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        return res.status(500).json({ message: `Get restaurants error: ${error.message}` });
    }
};

export const getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Shop.findById(req.params.restaurantId)
            .populate("owner", "fullName email mobile");
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
        return res.status(200).json(restaurant);
    } catch (error) {
        return res.status(500).json({ message: `Get restaurant error: ${error.message}` });
    }
};

export const createRestaurant = async (req, res) => {
    try {
        const { name, description, city, address, phone, owner, deliveryCharge, latitude, longitude } = req.body;
        const image = req.file ? req.file.path : "";

        const shop = await Shop.create({
            name, description, city, address, phone, owner,
            deliveryCharge: deliveryCharge || 0,
            latitude: latitude || 0,
            longitude: longitude || 0,
            image
        });

        return res.status(201).json(shop);
    } catch (error) {
        return res.status(500).json({ message: `Create restaurant error: ${error.message}` });
    }
};

export const updateRestaurant = async (req, res) => {
    try {
        const updateData = req.body;
        if (req.file) updateData.image = req.file.path;

        const restaurant = await Shop.findByIdAndUpdate(req.params.restaurantId, updateData, { new: true });
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
        return res.status(200).json(restaurant);
    } catch (error) {
        return res.status(500).json({ message: `Update restaurant error: ${error.message}` });
    }
};

export const deleteRestaurant = async (req, res) => {
    try {
        const restaurant = await Shop.findByIdAndDelete(req.params.restaurantId);
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
        return res.status(200).json({ message: "Restaurant deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Delete restaurant error: ${error.message}` });
    }
};

export const approveRestaurant = async (req, res) => {
    try {
        const restaurant = await Shop.findByIdAndUpdate(
            req.params.restaurantId,
            { isActive: true },
            { new: true }
        );
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
        return res.status(200).json({ message: "Restaurant approved", restaurant });
    } catch (error) {
        return res.status(500).json({ message: `Approve restaurant error: ${error.message}` });
    }
};

export const rejectRestaurant = async (req, res) => {
    try {
        const restaurant = await Shop.findByIdAndUpdate(
            req.params.restaurantId,
            { isActive: false },
            { new: true }
        );
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
        return res.status(200).json({ message: "Restaurant rejected", restaurant });
    } catch (error) {
        return res.status(500).json({ message: `Reject restaurant error: ${error.message}` });
    }
};

