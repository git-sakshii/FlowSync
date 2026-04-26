import { Request, Response } from 'express';
import prisma from '../config/database';

export const getProjectActivity = async (req: any, res: Response) => {
    try {
        const { projectId } = req.params;
        const { limit = 50 } = req.query;

        const activities = await prisma.activity.findMany({
            where: { projectId },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                task: { select: { id: true, title: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: Number(limit)
        });

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUserActivity = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
        const skip = (page - 1) * limit;

        const activities = await prisma.activity.findMany({
            where: { userId },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                project: { select: { id: true, name: true } },
                task: { select: { id: true, title: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        });

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
