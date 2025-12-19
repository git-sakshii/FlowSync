import { Request, Response } from 'express';
import prisma from '../config/database';

export const globalSearch = async (req: any, res: Response) => {
    try {
        const { q, type } = req.query;

        if (!q || typeof q !== 'string' || q.length < 2) {
            return res.json({ tasks: [], projects: [], users: [] });
        }

        const userId = req.user.id;
        const searchTasks = !type || type === 'tasks';
        const searchProjects = !type || type === 'projects';
        const searchUsers = !type || type === 'users';

        const results: any = {};

        if (searchTasks) {
            results.tasks = await prisma.task.findMany({
                where: {
                    title: { contains: q, mode: 'insensitive' },
                    deletedAt: null,
                    OR: [
                        { assigneeId: userId },
                        { project: { members: { some: { userId } } } }
                    ]
                },
                take: 5,
                select: { id: true, title: true, status: true, projectId: true }
            });
        }

        if (searchProjects) {
            results.projects = await prisma.project.findMany({
                where: {
                    name: { contains: q, mode: 'insensitive' },
                    deletedAt: null,
                    OR: [
                        { ownerId: userId },
                        { members: { some: { userId } } }
                    ]
                },
                take: 5,
                select: { id: true, name: true }
            });
        }

        if (searchUsers) {
            // Search users globally
            results.users = await prisma.user.findMany({
                where: {
                    OR: [
                        { firstName: { contains: q, mode: 'insensitive' } },
                        { lastName: { contains: q, mode: 'insensitive' } },
                        { email: { contains: q, mode: 'insensitive' } },
                    ]
                },
                take: 5,
                select: { id: true, firstName: true, lastName: true, avatar: true }
            });
        }

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
