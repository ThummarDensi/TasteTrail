import Item from "../models/item.model.js";

export const getAllFoods = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || "";
        const category = req.query.category || "";
        const restaurant = req.query.restaurant || "";

        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }
        if (category) query.category = category;
        if (restaurant) query.shop = restaurant;

        const total = await Item.countDocuments(query);
        const foods = await Item.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("shop", "name image");

        return res.status(200).json({ foods, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        return res.status(500).json({ message: `Get foods error: ${error.message}` });
    }
};

export const getFoodById = async (req, res) => {
    try {
        const food = await Item.findById(req.params.foodId).populate("shop", "name image");
        if (!food) return res.status(404).json({ message: "Food not found" });
        return res.status(200).json(food);
    } catch (error) {
        return res.status(500).json({ message: `Get food error: ${error.message}` });
    }
};

export const createFood = async (req, res) => {
    try {
        const { name, description, price, category, shop, discount, isVeg, isPopular, isRecommended } = req.body;
        const image = req.file ? req.file.path : "";

        const food = await Item.create({
            name, description, price, category, shop, image,
            discount: discount || 0,
            isVeg: isVeg === "true",
            isPopular: isPopular === "true",
            isRecommended: isRecommended === "true"
        });

        return res.status(201).json(food);
    } catch (error) {
        return res.status(500).json({ message: `Create food error: ${error.message}` });
    }
};

export const updateFood = async (req, res) => {
    try {
        const updateData = req.body;
        if (req.file) updateData.image = req.file.path;

        const food = await Item.findByIdAndUpdate(req.params.foodId, updateData, { new: true });
        if (!food) return res.status(404).json({ message: "Food not found" });
        return res.status(200).json(food);
    } catch (error) {
        return res.status(500).json({ message: `Update food error: ${error.message}` });
    }
};

export const deleteFood = async (req, res) => {
    try {
        const food = await Item.findByIdAndDelete(req.params.foodId);
        if (!food) return res.status(404).json({ message: "Food not found" });
        return res.status(200).json({ message: "Food deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Delete food error: ${error.message}` });
    }
};

export const toggleFoodAvailability = async (req, res) => {
    try {
        const food = await Item.findById(req.params.foodId);
        if (!food) return res.status(404).json({ message: "Food not found" });
        food.isAvailable = !food.isAvailable;
        await food.save();
        return res.status(200).json({ message: `Food ${food.isAvailable ? "available" : "unavailable"}`, food });
    } catch (error) {
        return res.status(500).json({ message: `Toggle availability error: ${error.message}` });
    }
};

export const markPopular = async (req, res) => {
    try {
        const food = await Item.findByIdAndUpdate(
            req.params.foodId,
            { isPopular: true },
            { new: true }
        );
        if (!food) return res.status(404).json({ message: "Food not found" });
        return res.status(200).json({ message: "Marked as popular", food });
    } catch (error) {
        return res.status(500).json({ message: `Mark popular error: ${error.message}` });
    }
};

export const markRecommended = async (req, res) => {
    try {
        const food = await Item.findByIdAndUpdate(
            req.params.foodId,
            { isRecommended: true },
            { new: true }
        );
        if (!food) return res.status(404).json({ message: "Food not found" });
        return res.status(200).json({ message: "Marked as recommended", food });
    } catch (error) {
        return res.status(500).json({ message: `Mark recommended error: ${error.message}` });
    }
};

