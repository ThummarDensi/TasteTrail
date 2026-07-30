import Settings from "../models/settings.model.js";
import Admin from "../models/admin.model.js";
import bcrypt from "bcryptjs";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne().lean();
        if (!settings) {
            settings = await Settings.create({});
        }
        return res.status(200).json(settings);
    } catch (error) {
        return res.status(500).json({ message: `Get settings error: ${error.message}` });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const {
            websiteName, logo, favicon, currency, currencySymbol,
            deliveryCharge, gstPercentage, contactEmail, contactPhone,
            address, socialMedia, aboutUs, termsAndConditions, privacyPolicy
        } = req.body;

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        if (websiteName) settings.websiteName = websiteName;
        if (currency) settings.currency = currency;
        if (currencySymbol) settings.currencySymbol = currencySymbol;
        if (deliveryCharge !== undefined) settings.deliveryCharge = deliveryCharge;
        if (gstPercentage !== undefined) settings.gstPercentage = gstPercentage;
        if (contactEmail) settings.contactEmail = contactEmail;
        if (contactPhone) settings.contactPhone = contactPhone;
        if (address) settings.address = address;
        if (aboutUs) settings.aboutUs = aboutUs;
        if (termsAndConditions) settings.termsAndConditions = termsAndConditions;
        if (privacyPolicy) settings.privacyPolicy = privacyPolicy;

        if (socialMedia) {
            settings.socialMedia = {
                ...settings.socialMedia,
                ...socialMedia
            };
        }

        if (req.files) {
            if (req.files.logo) {
                settings.logo = await uploadOnCloudinary(req.files.logo[0].path);
            }
            if (req.files.favicon) {
                settings.favicon = await uploadOnCloudinary(req.files.favicon[0].path);
            }
        }

        settings.updatedBy = req.adminId;
        await settings.save();

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
        if (email) updateData.email = email.toLowerCase();

        if (req.file) {
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

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Update password error: ${error.message}` });
    }
};

