import Coupon from "../models/coupon.model.js";

export const getAllCoupons = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = "", sort = "-createdAt", filter = "" } = req.query;
        const query = {};

        if (search) {
            query.code = { $regex: search, $options: "i" };
        }

        if (filter === "active") query.isActive = true;
        else if (filter === "disabled") query.isActive = false;
        else if (filter === "expired") query.expiryDate = { $lt: new Date() };

        const total = await Coupon.countDocuments(query);
        const coupons = await Coupon.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        return res.status(200).json({
            coupons,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        return res.status(500).json({ message: `Get coupons error: ${error.message}` });
    }
};

export const getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.couponId).lean();
        if (!coupon) return res.status(404).json({ message: "Coupon not found" });
        return res.status(200).json(coupon);
    } catch (error) {
        return res.status(500).json({ message: `Get coupon error: ${error.message}` });
    }
};

export const createCoupon = async (req, res) => {
    try {
        const { code, discountPercentage, maxDiscount, minOrderAmount, expiryDate, usageLimit } = req.body;

        if (!code || !discountPercentage || !expiryDate) {
            return res.status(400).json({ message: "code, discountPercentage, and expiryDate are required" });
        }

        const existing = await Coupon.findOne({ code: code.toUpperCase() });
        if (existing) {
            return res.status(400).json({ message: "Coupon code already exists" });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountPercentage,
            maxDiscount: maxDiscount || 0,
            minOrderAmount: minOrderAmount || 0,
            expiryDate,
            usageLimit: usageLimit || 100,
            createdBy: req.adminId
        });

        return res.status(201).json(coupon);
    } catch (error) {
        return res.status(500).json({ message: `Create coupon error: ${error.message}` });
    }
};

export const updateCoupon = async (req, res) => {
    try {
        const { code, discountPercentage, maxDiscount, minOrderAmount, expiryDate, usageLimit, isActive } = req.body;
        const updateData = {};
        if (code) updateData.code = code.toUpperCase();
        if (discountPercentage) updateData.discountPercentage = discountPercentage;
        if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount;
        if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount;
        if (expiryDate) updateData.expiryDate = expiryDate;
        if (usageLimit) updateData.usageLimit = usageLimit;
        if (isActive !== undefined) updateData.isActive = isActive;

        const coupon = await Coupon.findByIdAndUpdate(req.params.couponId, updateData, { new: true });
        if (!coupon) return res.status(404).json({ message: "Coupon not found" });
        return res.status(200).json(coupon);
    } catch (error) {
        return res.status(500).json({ message: `Update coupon error: ${error.message}` });
    }
};

export const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.couponId);
        if (!coupon) return res.status(404).json({ message: "Coupon not found" });
        return res.status(200).json({ message: "Coupon deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Delete coupon error: ${error.message}` });
    }
};

export const toggleCouponStatus = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.couponId);
        if (!coupon) return res.status(404).json({ message: "Coupon not found" });
        coupon.isActive = !coupon.isActive;
        await coupon.save();
        return res.status(200).json({ message: `Coupon ${coupon.isActive ? "activated" : "disabled"}`, coupon });
    } catch (error) {
        return res.status(500).json({ message: `Toggle coupon error: ${error.message}` });
    }
};

