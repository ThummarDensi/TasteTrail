import Notification from "../models/notification.model.js";

export const getAllNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const total = await Notification.countDocuments();
        const notifications = await Notification.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return res.status(200).json({ notifications, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        return res.status(500).json({ message: `Get notifications error: ${error.message}` });
    }
};

export const getNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.notificationId);
        if (!notification) return res.status(404).json({ message: "Notification not found" });
        return res.status(200).json(notification);
    } catch (error) {
        return res.status(500).json({ message: `Get notification error: ${error.message}` });
    }
};

export const sendNotification = async (req, res) => {
    try {
        const { title, message, type, targetRole, targetUserId } = req.body;

        const notification = await Notification.create({
            title,
            message,
            type: type || "info",
            targetRole: targetRole || "all",
            targetUserId: targetUserId || null,
            sentBy: req.adminId
        });

        return res.status(201).json({ message: "Notification sent", notification });
    } catch (error) {
        return res.status(500).json({ message: `Send notification error: ${error.message}` });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.notificationId);
        if (!notification) return res.status(404).json({ message: "Notification not found" });
        return res.status(200).json({ message: "Notification deleted" });
    } catch (error) {
        return res.status(500).json({ message: `Delete notification error: ${error.message}` });
    }
};

