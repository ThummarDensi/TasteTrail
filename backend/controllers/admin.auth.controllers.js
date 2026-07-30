import Admin from "../models/admin.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOtpMail } from "../utils/mail.js";

const isProduction = process.env.NODE_ENV === "production";

const genAdminToken = async (adminId) => {
    return jwt.sign({ adminId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        if (!admin.isActive) {
            return res.status(403).json({ message: "Account is deactivated. Contact super admin." });
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = await genAdminToken(admin._id);
        res.cookie("adminToken", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "None" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json({
            _id: admin._id,
            fullName: admin.fullName,
            email: admin.email,
            role: admin.role,
            profileImage: admin.profileImage
        });
    } catch (error) {
        return res.status(500).json({ message: `Admin login error: ${error.message}` });
    }
};

export const adminLogout = async (req, res) => {
    try {
        res.clearCookie("adminToken", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "None" : "Lax"
        });
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Logout error: ${error.message}` });
    }
};

export const getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.adminId).select("-password -refreshToken -resetOtp -otpExpires");
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        return res.status(200).json(admin);
    } catch (error) {
        return res.status(500).json({ message: `Profile error: ${error.message}` });
    }
};

export const updateAdminProfile = async (req, res) => {
    try {
        const { fullName, email } = req.body;
        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (email) updateData.email = email.toLowerCase();
        if (req.file) {
            const uploadOnCloudinary = (await import("../utils/cloudinary.js")).default;
            updateData.profileImage = await uploadOnCloudinary(req.file.path);
        }
        const admin = await Admin.findByIdAndUpdate(req.adminId, updateData, { new: true }).select("-password -refreshToken -resetOtp -otpExpires");
        return res.status(200).json(admin);
    } catch (error) {
        return res.status(500).json({ message: `Update profile error: ${error.message}` });
    }
};

export const adminChangePassword = async (req, res) => {
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
        return res.status(500).json({ message: `Change password error: ${error.message}` });
    }
};

export const adminSendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.status(400).json({ message: "Admin not found with this email" });
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        admin.resetOtp = otp;
        admin.otpExpires = Date.now() + 5 * 60 * 1000;
        admin.isOtpVerified = false;
        await admin.save();
        await sendOtpMail(email, otp);
        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Send OTP error: ${error.message}` });
    }
};

export const adminVerifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin || admin.resetOtp !== otp || admin.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        admin.isOtpVerified = true;
        admin.resetOtp = undefined;
        admin.otpExpires = undefined;
        await admin.save();
        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Verify OTP error: ${error.message}` });
    }
};

export const adminResetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin || !admin.isOtpVerified) {
            return res.status(400).json({ message: "OTP verification required" });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        admin.password = await bcrypt.hash(newPassword, 10);
        admin.isOtpVerified = false;
        await admin.save();
        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Reset password error: ${error.message}` });
    }
};

