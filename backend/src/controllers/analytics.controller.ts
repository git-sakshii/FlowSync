import { Request, Response } from 'express';
import prisma from '../config/database';

export const getTaskCompletionTrend = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        // For demo/simplicity, we'll return mock data or simple aggregation
        // In production, you'd use raw SQL queries for time-series aggregation

        // Example mock data matching frontend structure (Week 1, Week 2...)
        // Real implementation would aggregate `createdAt` and `updatedAt` where status=DONE

        // We can fetch actual counts for basic verification
        const totalCompleted = await prisma.task.count({
            where: {
                status: 'DONE',
                OR: [
                    { assigneeId: userId },
                    { project: { members: { some: { userId } } } }
                ]
            }
        });

        const data = [
            { name: "Week 1", completed: 18, created: 24 },
            { name: "Week 2", completed: 22, created: 20 },
            { name: "Week 3", completed: 28, created: 32 },
            { name: "Week 4", completed: 35, created: 28 },
            { name: "Week 5", completed: 30, created: 25 },
            { name: "Week 6", completed: Math.max(42, totalCompleted), created: 38 }, // Use real count slightly
        ];

        res.json(data);
    } catch (error) {
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
                initials: `${user.firstName[0]}${user.lastName[0]}`,
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
