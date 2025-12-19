import { Response, NextFunction } from 'express';
import prisma from '../config/database';

export const requireProjectAccess = async (req: any, res: Response, next: NextFunction) => {
    try {
        const projectId = req.params.id || req.params.projectId;
        const userId = req.user.id;

        if (!projectId) {
            return res.status(400).json({ message: 'Project ID required' });
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { members: true }
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.deletedAt) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const isMember = project.members.some(m => m.userId === userId);
        const isOwner = project.ownerId === userId;
        const isAdmin = req.user.role === 'ADMIN';

        if (!isMember && !isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        req.project = project; // Attach project to request for convenience
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error checking project access' });
    }
};

export const requireProjectOwner = async (req: any, res: Response, next: NextFunction) => {
    try {
        const projectId = req.params.id || req.params.projectId;
        const userId = req.user.id;

        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.deletedAt) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const isOwner = project.ownerId === userId;
        const isAdmin = req.user.role === 'ADMIN';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Project owner access required' });
        }

        req.project = project;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error checking project ownership' });
    }
};
