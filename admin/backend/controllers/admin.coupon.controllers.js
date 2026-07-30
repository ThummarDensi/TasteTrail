import Coupon from "../models/coupon.model.js";

export const getAllCoupons = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status || "";

        const query = {};
        if (status === "active") query.isActive = true;
        if (status === "inactive") query.isActive = false;
        if (status === "expired") query.expiryDate = { $lt: new Date() };

        const total = await Coupon.countDocuments(query);
        const coupons = await Coupon.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return res.status(200).json({ coupons, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        return res.status(500).json({ message: `Get coupons error: ${error.message}` });
    }
};

export const getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.couponId);
        if (!coupon) return res.status(404).json({ message: "Coupon not found" });
        return res.status(200).json(coupon);
    } catch (error) {
        return res.status(500).json({ message: `Get coupon error: ${error.message}` });
    }
};

export const createCoupon = async (req, res) => {
    try {
        const { code, description, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, expiryDate } = req.body;

        const existing = await Coupon.findOne({ code: code?.toUpperCase() });
        if (existing) return res.status(400).json({ message: "Coupon code already exists" });

        const coupon = await Coupon.create({
            code: code?.toUpperCase(),
            description,
            discountType: discountType || "percentage",
            discountValue,
            minOrderAmount: minOrderAmount || 0,
            maxDiscount: maxDiscount || 0,
            usageLimit: usageLimit || 0,
            expiryDate
        });

        return res.status(201).json(coupon);
    } catch (error) {
        return res.status(500).json({ message: `Create coupon error: ${error.message}` });
    }
};

export const updateCoupon = async (req, res) => {
    try {
        const updateData = req.body;
        if (updateData.code) updateData.code = updateData.code.toUpperCase();

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
        return res.status(200).json({ message: `Coupon ${coupon.isActive ? "activated" : "deactivated"}`, coupon });
    } catch (error) {
        return res.status(500).json({ message: `Toggle coupon status error: ${error.message}` });
    }
};

