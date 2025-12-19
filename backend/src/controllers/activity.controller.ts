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
        const { limit = 50 } = req.query;

        const activities = await prisma.activity.findMany({
            where: { userId },
            include: {
                project: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: Number(limit)
        });

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
