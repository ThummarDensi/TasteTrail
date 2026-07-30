import Banner from "../models/banner.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const getAllBanners = async (req, res) => {
    try {
        const { type = "", isActive = "" } = req.query;
        const query = {};
        if (type) query.type = type;
        if (isActive === "true") query.isActive = true;
        else if (isActive === "false") query.isActive = false;

        const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 }).lean();
        return res.status(200).json(banners);
    } catch (error) {
        return res.status(500).json({ message: `Get banners error: ${error.message}` });
    }
};

export const getBannerById = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.bannerId).lean();
        if (!banner) return res.status(404).json({ message: "Banner not found" });
        return res.status(200).json(banner);
    } catch (error) {
        return res.status(500).json({ message: `Get banner error: ${error.message}` });
    }
};

export const createBanner = async (req, res) => {
    try {
        const { title, subtitle, type, link, order } = req.body;
        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        let image = "";
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        } else {
            return res.status(400).json({ message: "Banner image is required" });
        }

        const banner = await Banner.create({
            title,
            subtitle: subtitle || "",
            image,
            type: type || "home",
            link: link || "",
            order: order || 0,
            createdBy: req.adminId
        });

        return res.status(201).json(banner);
    } catch (error) {
        return res.status(500).json({ message: `Create banner error: ${error.message}` });
    }
};

export const updateBanner = async (req, res) => {
    try {
        const { title, subtitle, type, link, order, isActive } = req.body;
        const updateData = {};
        if (title) updateData.title = title;
        if (subtitle !== undefined) updateData.subtitle = subtitle;
        if (type) updateData.type = type;
        if (link !== undefined) updateData.link = link;
        if (order !== undefined) updateData.order = order;
        if (isActive !== undefined) updateData.isActive = isActive;

        if (req.file) {
            updateData.image = await uploadOnCloudinary(req.file.path);
        }

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
        return res.status(500).json({ message: `Toggle banner error: ${error.message}` });
    }
};

