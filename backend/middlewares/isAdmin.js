import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

const isAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.adminToken;
        if (!token) {
            return res.status(401).json({ message: "Admin token not found" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid admin token" });
        }
        const admin = await Admin.findById(decoded.adminId);
        if (!admin) {
            return res.status(401).json({ message: "Admin not found" });
        }
        if (!admin.isActive) {
            return res.status(403).json({ message: "Admin account is deactivated" });
        }
        req.adminId = admin._id;
        req.admin = admin;
        next();
    } catch (error) {
        return res.status(500).json({ message: `Admin auth error: ${error.message}` });
    }
};

export default isAdmin;

