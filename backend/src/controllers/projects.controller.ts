import { Request, Response } from 'express';
import prisma from '../config/database';
import { z } from 'zod';

const createProjectSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
});

const updateProjectSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
});

export const createProject = async (req: any, res: Response) => {
    try {
        const { name, description } = createProjectSchema.parse(req.body);

        const project = await prisma.project.create({
            data: {
                name,
                description,
                ownerId: req.user.id,
                members: {
                    create: {
                        userId: req.user.id
                    }
                }
            },
            include: {
                members: {
                    include: {
                        user: { select: { id: true, firstName: true, lastName: true, avatar: true } }
                    }
                }
            }
        });

        res.status(201).json(project);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

export const getProjects = async (req: any, res: Response) => {
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
            include: {
                owner: { select: { id: true, firstName: true, lastName: true } },
                members: {
                    include: {
                        user: { select: { id: true, firstName: true, lastName: true, avatar: true } }
                    }
                },
                tasks: {
                    where: { deletedAt: null },
                    select: { status: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Calculate progress for each project on the fly (or can be done via database query)
        const projectsWithProgress = projects.map(p => {
            const totalTasks = p.tasks.length;
            const completedTasks = p.tasks.filter(t => t.status === 'DONE').length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            const { tasks, ...projectData } = p;
            return { ...projectData, progress, taskCount: totalTasks, completedTasks };
        });

        res.json(projectsWithProgress);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getProject = async (req: any, res: Response) => {
    try {
        // Project is already attached by middleware, but we might want to fetch more details
        const project = await prisma.project.findUnique({
            where: { id: req.params.id },
            include: {
                owner: { select: { id: true, firstName: true, lastName: true } },
                members: {
                    include: {
                        user: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true } }
                    }
                },
                _count: {
                    select: { tasks: true }
                }
            }
        });

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateProject = async (req: any, res: Response) => {
    try {
        const { name, description } = updateProjectSchema.parse(req.body);

        const project = await prisma.project.update({
            where: { id: req.params.id },
            data: { name, description },
        });

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteProject = async (req: any, res: Response) => {
    try {
        // Soft delete
        await prisma.project.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date() }
        });

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const addTeamMember = async (req: any, res: Response) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'User ID required' });
        }

        const { id: projectId } = req.params;

        // Check if membership already exists
        const existing = await prisma.projectMember.findFirst({
            where: { projectId, userId }
        });

        if (existing) {
            return res.status(400).json({ message: 'User is already a member' });
        }

        const member = await prisma.projectMember.create({
            data: { projectId, userId },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, avatar: true } }
            }
        });

        res.status(201).json(member);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const removeTeamMember = async (req: any, res: Response) => {
    try {
        const { id: projectId, userId } = req.params;

        // Prevent removing owner
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (project?.ownerId === userId) {
            return res.status(400).json({ message: 'Cannot remove project owner' });
        }

        await prisma.projectMember.deleteMany({
            where: { projectId, userId }
        });

        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getProjectProgress = async (req: any, res: Response) => {
    try {
        const projectId = req.params.id;

        const tasks = await prisma.task.findMany({
            where: { projectId, deletedAt: null },
            select: { status: true }
        });

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'DONE').length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        res.json({
            totalTasks,
            completedTasks,
            progress
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
