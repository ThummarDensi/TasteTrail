import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const getAllFoods = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = "", sort = "-createdAt", filter = "", category = "", shop = "" } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } }
            ];
        }

        if (category) query.category = category;
        if (shop) query.shop = shop;
        if (filter === "veg") query.foodType = "veg";
        else if (filter === "nonveg") query.foodType = "non veg";
        else if (filter === "available") query.isAvailable = true;
        else if (filter === "unavailable") query.isAvailable = false;
        else if (filter === "popular") query.isPopular = true;
        else if (filter === "recommended") query.isRecommended = true;

        const total = await Item.countDocuments(query);
        const items = await Item.find(query)
            .populate("shop", "name city")
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        return res.status(200).json({
            foods: items,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        return res.status(500).json({ message: `Get foods error: ${error.message}` });
    }
};

export const getFoodById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.foodId)
            .populate("shop", "name city address image")
            .lean();
        if (!item) return res.status(404).json({ message: "Food not found" });
        return res.status(200).json(item);
    } catch (error) {
        return res.status(500).json({ message: `Get food error: ${error.message}` });
    }
};

export const createFood = async (req, res) => {
    try {
        const { name, category, foodType, price, offerPrice, description, preparationTime, shop } = req.body;
        if (!name || !category || !foodType || !price || !shop) {
            return res.status(400).json({ message: "name, category, foodType, price, and shop are required" });
        }

        let image = "";
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }

        const item = await Item.create({
            name, category, foodType, price, offerPrice, description, preparationTime, shop, image,
            isAvailable: true
        });

        // Push item to shop
        const shopDoc = await Shop.findById(shop);
        if (shopDoc) {
            shopDoc.items.push(item._id);
            await shopDoc.save();
        }

        await item.populate("shop", "name city");
        return res.status(201).json(item);
    } catch (error) {
        return res.status(500).json({ message: `Create food error: ${error.message}` });
    }
};

export const updateFood = async (req, res) => {
    try {
        const { name, category, foodType, price, offerPrice, description, preparationTime, isAvailable, isPopular, isRecommended } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (category) updateData.category = category;
        if (foodType) updateData.foodType = foodType;
        if (price) updateData.price = price;
        if (offerPrice !== undefined) updateData.offerPrice = offerPrice;
        if (description) updateData.description = description;
        if (preparationTime) updateData.preparationTime = preparationTime;
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
        if (isPopular !== undefined) updateData.isPopular = isPopular;
        if (isRecommended !== undefined) updateData.isRecommended = isRecommended;

        if (req.file) {
            updateData.image = await uploadOnCloudinary(req.file.path);
        }

        const item = await Item.findByIdAndUpdate(req.params.foodId, updateData, { new: true })
            .populate("shop", "name city");
        if (!item) return res.status(404).json({ message: "Food not found" });
        return res.status(200).json(item);
    } catch (error) {
        return res.status(500).json({ message: `Update food error: ${error.message}` });
    }
};

export const deleteFood = async (req, res) => {
    try {
        const item = await Item.findByIdAndDelete(req.params.foodId);
        if (!item) return res.status(404).json({ message: "Food not found" });

        // Remove from shop
        await Shop.findByIdAndUpdate(item.shop, { $pull: { items: item._id } });
        return res.status(200).json({ message: "Food deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Delete food error: ${error.message}` });
    }
};

export const toggleFoodAvailability = async (req, res) => {
    try {
        const item = await Item.findById(req.params.foodId);
        if (!item) return res.status(404).json({ message: "Food not found" });
        item.isAvailable = !item.isAvailable;
        await item.save();
        return res.status(200).json({ message: `Food ${item.isAvailable ? "enabled" : "disabled"}`, item });
    } catch (error) {
        return res.status(500).json({ message: `Toggle availability error: ${error.message}` });
    }
};

export const markPopular = async (req, res) => {
    try {
        const item = await Item.findByIdAndUpdate(
            req.params.foodId,
            { isPopular: true },
            { new: true }
        );
        if (!item) return res.status(404).json({ message: "Food not found" });
        return res.status(200).json({ message: "Food marked as popular", item });
    } catch (error) {
        return res.status(500).json({ message: `Mark popular error: ${error.message}` });
    }
};

export const markRecommended = async (req, res) => {
    try {
        const item = await Item.findByIdAndUpdate(
            req.params.foodId,
            { isRecommended: true },
            { new: true }
        );
        if (!item) return res.status(404).json({ message: "Food not found" });
        return res.status(200).json({ message: "Food marked as recommended", item });
    } catch (error) {
        return res.status(500).json({ message: `Mark recommended error: ${error.message}` });
    }
};

