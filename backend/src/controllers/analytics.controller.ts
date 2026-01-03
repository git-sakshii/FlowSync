import { Request, Response } from 'express';
import prisma from '../config/database';

export const getTaskCompletionTrend = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;

        // Get tasks from the last 6 weeks
        const sixWeeksAgo = new Date();
        sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);

        const tasks = await prisma.task.findMany({
            where: {
                createdAt: { gte: sixWeeksAgo },
                OR: [
                    { assigneeId: userId },
                    { project: { members: { some: { userId } } } }
                ]
            },
            select: {
                createdAt: true,
                status: true,
                updatedAt: true
            }
        });

        // Group tasks by week
        const weekData: Record<string, { completed: number; created: number }> = {};

        for (let i = 5; i >= 0; i--) {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (i * 7) - 6);
            const weekEnd = new Date();
            weekEnd.setDate(weekEnd.getDate() - (i * 7));

            const weekLabel = `Week ${6 - i}`;
            weekData[weekLabel] = { completed: 0, created: 0 };

            tasks.forEach(task => {
                const createdDate = new Date(task.createdAt);
                if (createdDate >= weekStart && createdDate <= weekEnd) {
                    weekData[weekLabel].created++;
                }
                if (task.status === 'DONE') {
                    const updatedDate = new Date(task.updatedAt);
                    if (updatedDate >= weekStart && updatedDate <= weekEnd) {
                        weekData[weekLabel].completed++;
                    }
                }
            });
        }

        const data = Object.entries(weekData).map(([name, values]) => ({
            name,
            ...values
        }));

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getProjectProgressAnalytics = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const isAdmin = req.user.role === 'ADMIN';

        const where = isAdmin
            ? { deletedAt: null }
            : {
                deletedAt: null,
                OR: [
                    { ownerId: userId },
                    { members: { some: { userId } } }
                ]
            };

        const projects = await prisma.project.findMany({
            where,
            include: { tasks: { select: { status: true } } },
            take: 5 // Top 5
        });

        const data = projects.map(p => {
            const total = p.tasks.length;
            const completed = p.tasks.filter(t => t.status === 'DONE').length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            return {
                name: p.name,
                progress
            };
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getTaskDistribution = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;

        // Aggregate by status
        const distribution = await prisma.task.groupBy({
            by: ['status'],
            where: {
                deletedAt: null,
                OR: [
                    { assigneeId: userId },
                    { project: { members: { some: { userId } } } }
                ]
            },
            _count: { status: true }
        });

        const statusMap: Record<string, string> = {
            'TODO': 'To Do',
            'IN_PROGRESS': 'In Progress',
            'REVIEW': 'Review',
            'DONE': 'Done'
        };

        const colorMap: Record<string, string> = {
            'TODO': 'hsl(var(--muted-foreground))',
            'IN_PROGRESS': 'hsl(var(--primary))',
            'REVIEW': 'hsl(var(--warning))',
            'DONE': 'hsl(var(--success))'
        };

        const data = distribution.map(item => ({
            name: statusMap[item.status],
            value: item._count.status,
            color: colorMap[item.status]
        }));

        // Ensure all statuses are present even if count is 0 (optional but good for charts)
        Object.keys(statusMap).forEach(key => {
            if (!data.find(d => d.name === statusMap[key])) {
                data.push({
                    name: statusMap[key],
                    value: 0,
                    color: colorMap[key]
                });
            }
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getTeamWorkload = async (req: any, res: Response) => {
    try {
        // Get users in projects I'm in
        const userId = req.user.id;

        // Simplification: just get all users for now if admin, or related users
        const users = await prisma.user.findMany({
            take: 5,
            include: {
                assignedTasks: {
                    where: { deletedAt: null },
                    select: { status: true }
                }
            }
        });

        const data = users.map(user => {
            const tasks = user.assignedTasks.length;
            const completed = user.assignedTasks.filter(t => t.status === 'DONE').length;
            const pending = tasks - completed;

            // Calculate workload percentage (arbitrary logic: > 10 pending is 100%)
            const workload = Math.min(Math.round((pending / 10) * 100), 100);

            return {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                avatar: user.avatar,
                initials: `${(user.firstName?.[0] || '').toUpperCase()}${(user.lastName?.[0] || '').toUpperCase()}`,
                tasks: pending,
                completed,
                workload
            };
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
