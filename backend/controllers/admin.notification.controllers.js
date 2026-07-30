import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { sendOtpMail } from "../utils/mail.js";

export const getAllNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, type = "" } = req.query;
        const query = {};
        if (type) query.type = type;

        const total = await Notification.countDocuments(query);
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .populate("sentBy", "fullName email")
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        return res.status(200).json({
            notifications,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        return res.status(500).json({ message: `Get notifications error: ${error.message}` });
    }
};

export const getNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.notificationId)
            .populate("sentBy", "fullName email")
            .populate("recipients", "fullName email")
            .lean();
        if (!notification) return res.status(404).json({ message: "Notification not found" });
        return res.status(200).json(notification);
    } catch (error) {
        return res.status(500).json({ message: `Get notification error: ${error.message}` });
    }
};

export const sendNotification = async (req, res) => {
    try {
        const { title, message, type, recipientType, recipientIds } = req.body;

        if (!title || !message) {
            return res.status(400).json({ message: "Title and message are required" });
        }

        let recipients = [];

        if (recipientType === "all_users") {
            const users = await User.find({ role: "user" }).select("_id");
            recipients = users.map(u => u._id);
        } else if (recipientType === "all_owners") {
            const owners = await User.find({ role: "owner" }).select("_id");
            recipients = owners.map(u => u._id);
        } else if (recipientType === "all_delivery_boys") {
            const boys = await User.find({ role: "deliveryBoy" }).select("_id");
            recipients = boys.map(u => u._id);
        } else if (recipientType === "specific_users" && recipientIds) {
            recipients = Array.isArray(recipientIds) ? recipientIds : [recipientIds];
        } else if (recipientType === "specific_restaurants" && recipientIds) {
            recipients = Array.isArray(recipientIds) ? recipientIds : [recipientIds];
        }

        const notification = await Notification.create({
            title,
            message,
            type: type || "push",
            recipientType: recipientType || "all_users",
            recipients,
            sentBy: req.adminId,
            isSent: true,
            sentAt: new Date()
        });

        // Send email notifications if type is email
        if (type === "email") {
            const recipientUsers = await User.find({ _id: { $in: recipients } }).select("email");
            for (const user of recipientUsers) {
                try {
                    await sendOtpMail(user.email, message);
                } catch (err) {
                    console.log(`Failed to send email to ${user.email}: ${err.message}`);
                }
            }
        }

        // TODO: Implement push notifications via Socket.io if needed
        if (type === "push") {
            const io = req.app.get('io');
            if (io) {
                const recipientUsers = await User.find({ _id: { $in: recipients } }).select("socketId");
                recipientUsers.forEach(user => {
                    if (user.socketId) {
                        io.to(user.socketId).emit('adminNotification', {
                            title,
                            message,
                            notificationId: notification._id
                        });
                    }
                });
            }
        }

        return res.status(201).json(notification);
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

