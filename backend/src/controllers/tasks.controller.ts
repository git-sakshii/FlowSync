import { Request, Response } from 'express';
import prisma from '../config/database';
import { z } from 'zod';
import { logActivity } from '../services/activity.service';
import { createNotification } from '../services/notification.service';

const createTaskSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    dueDate: z.string().optional(), // ISO date string
    assigneeId: z.string().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
});

const updateTaskSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    dueDate: z.string().optional().nullable(),
});

export const createTask = async (req: any, res: Response) => {
    try {
        const { projectId } = req.params;
        const { title, description, priority, dueDate, assigneeId, status } = createTaskSchema.parse(req.body);

        const task = await prisma.task.create({
            data: {
                title,
                description,
                priority: priority || 'MEDIUM',
                status: status || 'TODO',
                dueDate: dueDate ? new Date(dueDate) : null,
                projectId,
                assigneeId,
            },
            include: {
                assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } }
            }
        });

        await logActivity({
            type: 'task-create',
            action: 'created',
            target: task.title,
            userId: req.user.id,
            projectId,
            taskId: task.id
        });

        if (assigneeId && assigneeId !== req.user.id) {
            await createNotification({
                type: 'assignment',
                title: 'New Task Assignment',
                message: `You have been assigned to task: ${task.title}`,
                userId: assigneeId,
                data: { taskId: task.id, projectId }
            });
        }

        res.status(201).json(task);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

export const getTasks = async (req: any, res: Response) => {
    try {
        const { projectId } = req.params;

        const tasks = await prisma.task.findMany({
            where: { projectId, deletedAt: null },
            include: {
                assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } }
            },
            orderBy: { order: 'asc' }
        });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getTask = async (req: any, res: Response) => {
    try {
        const task = await prisma.task.findFirst({
            where: {
                id: req.params.id,
                deletedAt: null
            },
            include: {
                assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                project: { select: { id: true, name: true } }
            }
        });

        if (!task) return res.status(404).json({ message: 'Task not found' });

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateTask = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const data = updateTaskSchema.parse(req.body);

        const task = await prisma.task.update({
            where: { id },
            data: {
                ...data,
                dueDate: data.dueDate ? new Date(data.dueDate) : data.dueDate,
            },
        });

        await logActivity({
            type: 'task-update',
            action: 'updated',
            target: task.title,
            userId: req.user.id,
            projectId: task.projectId,
            taskId: task.id,
            details: 'Updated task details'
        });

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteTask = async (req: any, res: Response) => {
    try {
        const { id } = req.params;

        const task = await prisma.task.update({
            where: { id },
            data: { deletedAt: new Date() }
        });

        await logActivity({
            type: 'task-delete',
            action: 'deleted',
            target: task.title,
            userId: req.user.id,
            projectId: task.projectId,
            taskId: task.id
        });

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateTaskStatus = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { status, columnId } = req.body; // columnId might be passed from frontend dnd

        // Support both frontend column IDs (lowercase) and DB Enums (uppercase)
        const dbStatus = status || (columnId ? columnId.toUpperCase().replace('-', '_') : undefined);

        if (!['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].includes(dbStatus)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const oldTask = await prisma.task.findUnique({ where: { id } });

        const task = await prisma.task.update({
            where: { id },
            data: { status: dbStatus }
        });

        if (oldTask && oldTask.status !== dbStatus) {
            await logActivity({
                type: 'status-change',
                action: 'moved',
                target: task.title,
                userId: req.user.id,
                projectId: task.projectId,
                taskId: task.id,
                details: `${oldTask.status} → ${task.status}`
            });

            // Notify assignee if someone else moved it
            if (task.assigneeId && task.assigneeId !== req.user.id) {
                await createNotification({
                    type: 'status-change',
                    title: 'Task Status Updated',
                    message: `Task "${task.title}" was moved to ${task.status}`,
                    userId: task.assigneeId,
                    data: { taskId: task.id, projectId: task.projectId }
                });
            }
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateTaskOrder = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { newOrder } = req.body;

        const task = await prisma.task.update({
            where: { id },
            data: { order: newOrder }
        });

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const assignTask = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { assigneeId } = req.body;

        const task = await prisma.task.update({
            where: { id },
            data: { assigneeId },
            include: {
                assignee: { select: { id: true, firstName: true, lastName: true } }
            }
        });

        const assigneeName = task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned';

        await logActivity({
            type: 'assignment',
            action: 'assigned',
            target: task.title,
            userId: req.user.id,
            projectId: task.projectId,
            taskId: task.id,
            details: `to ${assigneeName}`
        });

        if (assigneeId && assigneeId !== req.user.id) {
            await createNotification({
                type: 'assignment',
                title: 'New Task Assignment',
                message: `You have been assigned to task: ${task.title}`,
                userId: assigneeId,
                data: { taskId: task.id, projectId: task.projectId }
            });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMyTasks = async (req: any, res: Response) => {
    try {
        const tasks = await prisma.task.findMany({
            where: {
                assigneeId: req.user.id,
                deletedAt: null,
            },
            include: {
                project: { select: { id: true, name: true } },
                assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } }
            },
            orderBy: { dueDate: 'asc' }
        });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
