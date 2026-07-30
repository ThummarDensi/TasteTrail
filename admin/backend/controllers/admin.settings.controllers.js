import Admin from "../models/admin.model.js";
import Settings from "../models/settings.model.js";
import bcrypt from "bcryptjs";

export const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({
                siteName: "Kos Food Delivery",
                siteDescription: "Food Delivery Admin Panel",
                supportEmail: "support@kosfood.com",
                supportPhone: "+1234567890",
                currency: "INR"
            });
        }
        const admin = await Admin.findById(req.adminId).select("-password -refreshToken -resetOtp -otpExpires");
        return res.status(200).json({ settings, admin });
    } catch (error) {
        return res.status(500).json({ message: `Get settings error: ${error.message}` });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const {
            siteName, siteDescription, supportEmail, supportPhone, address,
            currency, taxRate, deliveryCharge, minimumOrder, aboutUs,
            facebook, twitter, instagram, youtube
        } = req.body;

        const updateData = {};
        if (siteName) updateData.siteName = siteName;
        if (siteDescription) updateData.siteDescription = siteDescription;
        if (supportEmail) updateData.supportEmail = supportEmail;
        if (supportPhone) updateData.supportPhone = supportPhone;
        if (address) updateData.address = address;
        if (currency) updateData.currency = currency;
        if (taxRate !== undefined) updateData.taxRate = parseFloat(taxRate);
        if (deliveryCharge !== undefined) updateData.deliveryCharge = parseFloat(deliveryCharge);
        if (minimumOrder !== undefined) updateData.minimumOrder = parseFloat(minimumOrder);
        if (aboutUs) updateData.aboutUs = aboutUs;
        if (facebook) updateData.facebook = facebook;
        if (twitter) updateData.twitter = twitter;
        if (instagram) updateData.instagram = instagram;
        if (youtube) updateData.youtube = youtube;

        if (req.files) {
            if (req.files.logo) updateData.logo = req.files.logo[0].path;
            if (req.files.favicon) updateData.favicon = req.files.favicon[0].path;
        }

        let settings = await Settings.findOne();
        if (settings) {
            settings = await Settings.findOneAndUpdate({}, updateData, { new: true });
        } else {
            settings = await Settings.create(updateData);
        }

        return res.status(200).json(settings);
    } catch (error) {
        return res.status(500).json({ message: `Update settings error: ${error.message}` });
    }
};

export const updateAdminProfileSettings = async (req, res) => {
    try {
        const { fullName, email } = req.body;
        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (email) updateData.email = email;
        if (req.file) {
            const uploadOnCloudinary = (await import("../utils/cloudinary.js")).default;
            updateData.profileImage = await uploadOnCloudinary(req.file.path);
        }

        const admin = await Admin.findByIdAndUpdate(req.adminId, updateData, { new: true })
            .select("-password -refreshToken -resetOtp -otpExpires");
        return res.status(200).json(admin);
    } catch (error) {
        return res.status(500).json({ message: `Update admin profile error: ${error.message}` });
    }
};

export const updateAdminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new password are required" });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }

        const admin = await Admin.findById(req.adminId);
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        admin.password = await bcrypt.hash(newPassword, 10);
        await admin.save();
        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Update password error: ${error.message}` });
    }
};

