import Banner from "../models/banner.model.js";

export const getAllBanners = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status || "";

        const query = {};
        if (status === "active") query.isActive = true;
        if (status === "inactive") query.isActive = false;

        const total = await Banner.countDocuments(query);
        const banners = await Banner.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return res.status(200).json({ banners, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        return res.status(500).json({ message: `Get banners error: ${error.message}` });
    }
};

export const getBannerById = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.bannerId);
        if (!banner) return res.status(404).json({ message: "Banner not found" });
        return res.status(200).json(banner);
    } catch (error) {
        return res.status(500).json({ message: `Get banner error: ${error.message}` });
    }
};

export const createBanner = async (req, res) => {
    try {
        const { title, description, link, isActive } = req.body;
        const image = req.file ? req.file.path : "";

        const banner = await Banner.create({
            title, description, link, image,
            isActive: isActive === "true"
        });

        return res.status(201).json(banner);
    } catch (error) {
        return res.status(500).json({ message: `Create banner error: ${error.message}` });
    }
};

export const updateBanner = async (req, res) => {
    try {
        const updateData = req.body;
        if (req.file) updateData.image = req.file.path;

        const banner = await Banner.findByIdAndUpdate(req.params.bannerId, updateData, { new: true });
        if (!banner) return res.status(404).json({ message: "Banner not found" });
        return res.status(200).json(banner);
    } catch (error) {
        return res.status(500).json({ message: `Update banner error: ${error.message}` });
    }
};

export const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndDelete(req.params.bannerId);
        if (!banner) return res.status(404).json({ message: "Banner not found" });
        return res.status(200).json({ message: "Banner deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Delete banner error: ${error.message}` });
    }
};

export const toggleBannerStatus = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.bannerId);
        if (!banner) return res.status(404).json({ message: "Banner not found" });
        banner.isActive = !banner.isActive;
        await banner.save();
        return res.status(200).json({ message: `Banner ${banner.isActive ? "activated" : "deactivated"}`, banner });
    } catch (error) {
        return res.status(500).json({ message: `Toggle banner status error: ${error.message}` });
    }
};

