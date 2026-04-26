import { Request, Response } from 'express';
import prisma from '../config/database';

export const getTaskCompletionTrend = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const periodParam = (req.query.period as string) || '30d';
        const periodDays = periodParam === '7d' ? 7 : periodParam === '90d' ? 90 : 42;
        const weeksCount = Math.max(1, Math.ceil(periodDays / 7));

        // Get tasks from the specified period
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - periodDays);

        const tasks = await prisma.task.findMany({
            where: {
                createdAt: { gte: startDate },
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

        for (let i = weeksCount - 1; i >= 0; i--) {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (i * 7) - 6);
            const weekEnd = new Date();
            weekEnd.setDate(weekEnd.getDate() - (i * 7));

            const weekLabel = `Week ${weeksCount - i}`;
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

export const getDashboardStats = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const isAdmin = req.user.role === 'ADMIN';

        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const memberFilter = isAdmin
            ? { deletedAt: null }
            : {
                  deletedAt: null,
                  OR: [
                      { ownerId: userId },
                      { members: { some: { userId } } },
                  ],
              };

        // Current projects count
        const currentProjects = await prisma.project.count({ where: memberFilter });

        // Projects created in last week
        const newProjectsThisWeek = await prisma.project.count({
            where: { ...memberFilter, createdAt: { gte: oneWeekAgo } },
        });
        const newProjectsLastWeek = await prisma.project.count({
            where: { ...memberFilter, createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo } },
        });

        // Task filters
        const taskMemberFilter = isAdmin
            ? { deletedAt: null as null }
            : {
                  deletedAt: null as null,
                  OR: [
                      { assigneeId: userId },
                      { project: { members: { some: { userId } } } },
                  ],
              };

        const allTasks = await prisma.task.findMany({
            where: taskMemberFilter,
            select: { status: true, createdAt: true, updatedAt: true },
        });

        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter((t) => t.status === 'DONE').length;
        const pendingTasks = totalTasks - completedTasks;

        // Tasks created this week vs last week
        const tasksCreatedThisWeek = allTasks.filter((t) => new Date(t.createdAt) >= oneWeekAgo).length;
        const tasksCreatedLastWeek = allTasks.filter(
            (t) => new Date(t.createdAt) >= twoWeeksAgo && new Date(t.createdAt) < oneWeekAgo
        ).length;

        // Tasks completed this week vs last week
        const tasksCompletedThisWeek = allTasks.filter(
            (t) => t.status === 'DONE' && new Date(t.updatedAt) >= oneWeekAgo
        ).length;
        const tasksCompletedLastWeek = allTasks.filter(
            (t) => t.status === 'DONE' && new Date(t.updatedAt) >= twoWeeksAgo && new Date(t.updatedAt) < oneWeekAgo
        ).length;

        const calcChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        res.json({
            projects: currentProjects,
            projectsChange: calcChange(newProjectsThisWeek, newProjectsLastWeek),
            tasks: totalTasks,
            tasksChange: calcChange(tasksCreatedThisWeek, tasksCreatedLastWeek),
            completed: completedTasks,
            completedChange: calcChange(tasksCompletedThisWeek, tasksCompletedLastWeek),
            pending: pendingTasks,
            pendingChange: calcChange(
                tasksCreatedThisWeek - tasksCompletedThisWeek,
                tasksCreatedLastWeek - tasksCompletedLastWeek
            ),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
