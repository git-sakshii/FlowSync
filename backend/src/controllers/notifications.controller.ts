import { Request, Response } from 'express';
import prisma from '../config/database';

export const getNotifications = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to recent 50
        });

        const unreadCount = await prisma.notification.count({
            where: { userId, read: false }
        });

        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const markAsRead = async (req: any, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.notification.update({
            where: { id, userId: req.user.id },
            data: { read: true }
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const markAllAsRead = async (req: any, res: Response) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user.id, read: false },
            data: { read: true }
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const clearNotifications = async (req: any, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.notification.delete({
            where: { id, userId: req.user.id }
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
