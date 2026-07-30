// ===== NOTIFICATION CONTROLLER =====
// Handles fetching notifications and marking them as read (single or bulk).

import Notification from "../models/Notification.js";

// @desc    Get notifications for the current user
// @route   GET /api/notifications
// Supports ?unreadOnly=true filter. Returns latest 50 notifications + unread count.
export const getNotifications = async (req, res) => {
    try {
        const { unreadOnly } = req.query;
        const filter = { recipient: req.userId };
        if (unreadOnly === "true") filter.read = false;

        const notifications = await Notification.find(filter)
            .populate("actor", "name username avatar")
            .populate("poll", "question type")
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({ recipient: req.userId, read: false });

        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// Uses findOneAndUpdate with recipient check to ensure ownership
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.userId },
            { read: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ message: "Notification not found" });
        res.json({ notification });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// Bulk update — marks every unread notification for this user as read
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.userId, read: false },
            { read: true }
        );
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
