import Item from "../models/item.model.js";

export const getAllCategories = async (req, res) => {
    try {
        const categories = await Item.distinct("category");
        const categoriesWithCount = await Promise.all(
            categories.map(async (name) => {
                const count = await Item.countDocuments({ category: name });
                return { name, count };
            })
        );
        return res.status(200).json(categoriesWithCount.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
        return res.status(500).json({ message: `Get categories error: ${error.message}` });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: "Category name is required" });

        const existing = await Item.findOne({ category: name });
        if (existing) return res.status(400).json({ message: "Category already exists" });

        return res.status(201).json({ message: "Category created", name });
    } catch (error) {
        return res.status(500).json({ message: `Create category error: ${error.message}` });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { oldName, newName } = req.body;
        if (!oldName || !newName) return res.status(400).json({ message: "Old and new category names are required" });

        const result = await Item.updateMany(
            { category: oldName },
            { $set: { category: newName } }
        );

        return res.status(200).json({
            message: "Category updated",
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        return res.status(500).json({ message: `Update category error: ${error.message}` });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { name } = req.params;
        const result = await Item.updateMany(
            { category: name },
            { $set: { category: "Uncategorized" } }
        );

        return res.status(200).json({
            message: "Category deleted, items moved to Uncategorized",
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        return res.status(500).json({ message: `Delete category error: ${error.message}` });
    }
};

