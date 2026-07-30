import Admin from "../models/admin.model.js";
import bcrypt from "bcryptjs";

export const seedAdmin = async (req, res) => {
    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: "admin@kosfood.com" });
        if (existingAdmin) {
            return res.status(200).json({ 
                message: "Admin already exists", 
                email: "admin@kosfood.com",
                password: "admin123",
                hint: "You can login with these credentials"
            });
        }

        // Create default admin
        const hashedPassword = await bcrypt.hash("admin123", 10);
        const admin = await Admin.create({
            fullName: "Super Admin",
            email: "admin@kosfood.com",
            password: hashedPassword,
            role: "superadmin",
            isActive: true
        });

        return res.status(201).json({
            message: "Default admin created successfully",
            email: "admin@kosfood.com",
            password: "admin123",
            admin: {
                _id: admin._id,
                fullName: admin.fullName,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        return res.status(500).json({ message: `Seed admin error: ${error.message}` });
    }
};

