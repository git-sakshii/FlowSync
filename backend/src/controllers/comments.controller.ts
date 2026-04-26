import { Request, Response } from 'express';
import prisma from '../config/database';
import { logActivity } from '../services/activity.service';
import { createNotification } from '../services/notification.service';

// POST /tasks/:id/comments
export const addComment = async (req: any, res: Response) => {
    try {
        const { id: taskId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        const task = await prisma.task.findUnique({
            where: { id: taskId },
            select: { id: true, title: true, projectId: true, assigneeId: true }
        });

        if (!task) return res.status(404).json({ message: 'Task not found' });

        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                taskId,
                userId,
            },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, avatar: true } }
            }
        });

        await logActivity({
            type: 'comment',
            action: 'commented',
            target: task.title,
            userId,
            projectId: task.projectId,
            taskId,
            details: content.length > 50 ? content.substring(0, 50) + '...' : content
        });

        // Notify task assignee if someone else commented
        if (task.assigneeId && task.assigneeId !== userId) {
            const commenter = await prisma.user.findUnique({
                where: { id: userId },
                select: { firstName: true, lastName: true }
            });
            await createNotification({
                type: 'comment',
                title: 'New Comment',
                message: `${commenter?.firstName} ${commenter?.lastName} commented on "${task.title}"`,
                userId: task.assigneeId,
                data: { taskId, projectId: task.projectId }
            });
        }

        res.status(201).json(comment);
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /tasks/:id/comments
export const getComments = async (req: any, res: Response) => {
    try {
        const { id: taskId } = req.params;

        const comments = await prisma.comment.findMany({
            where: { taskId },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, avatar: true } }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /comments/:id
export const deleteComment = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const comment = await prisma.comment.findUnique({ where: { id } });

        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        // Only the comment author or admin can delete
        if (comment.userId !== userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await prisma.comment.delete({ where: { id } });

        res.json({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
