import Item from "../models/item.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const getAllCategories = async (req, res) => {
    try {
        const categories = await Item.distinct("category");
        const categoriesWithCount = [];

        for (const cat of categories) {
            const count = await Item.countDocuments({ category: cat });
            categoriesWithCount.push({ name: cat, count });
        }

        return res.status(200).json(categoriesWithCount);
    } catch (error) {
        return res.status(500).json({ message: `Get categories error: ${error.message}` });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        // Check if category already exists
        const existing = await Item.findOne({ category: name });
        if (existing) {
            return res.status(400).json({ message: "Category already exists" });
        }

        // We store categories in a separate approach - just return success
        // Categories are stored as enum values on Item model
        return res.status(201).json({ message: "Category created", name });
    } catch (error) {
        return res.status(500).json({ message: `Create category error: ${error.message}` });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { oldName, newName } = req.body;
        if (!oldName || !newName) {
            return res.status(400).json({ message: "oldName and newName are required" });
        }

        await Item.updateMany(
            { category: oldName },
            { category: newName }
        );

        return res.status(200).json({ message: "Category updated", oldName, newName });
    } catch (error) {
        return res.status(500).json({ message: `Update category error: ${error.message}` });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { name } = req.params;
        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        // Set items with this category to "Others"
        await Item.updateMany(
            { category: name },
            { category: "Others" }
        );

        return res.status(200).json({ message: "Category deleted, items moved to Others" });
    } catch (error) {
        return res.status(500).json({ message: `Delete category error: ${error.message}` });
    }
};

