import { Request, Response } from 'express';
import prisma from '../config/database';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const updateProfileSchema = z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    email: z.string().email().optional(),
    avatar: z.string().optional(),
});

const updatePreferencesSchema = z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    emailNotif: z.boolean().optional(),
    pushNotif: z.boolean().optional(),
});

export const getProfile = async (req: any, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: true,
                theme: true,
                emailNotif: true,
                pushNotif: true,
                createdAt: true,
            },
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateProfile = async (req: any, res: Response) => {
    try {
        const data = updateProfileSchema.parse(req.body);

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: true,
            },
        });

        res.json(user);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

export const updatePreferences = async (req: any, res: Response) => {
    try {
        const data = updatePreferencesSchema.parse(req.body);

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data,
            select: {
                theme: true,
                emailNotif: true,
                pushNotif: true,
            },
        });

        res.json(user);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

const updatePasswordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8),
});

export const updatePassword = async (req: any, res: Response) => {
    try {
        const { currentPassword, newPassword } = updatePasswordSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashedPassword },
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateUserRole = async (req: any, res: Response) => {
    try {
        // Only admins can update roles
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { id } = req.params;
        const { role } = req.body;

        if (!['ADMIN', 'MEMBER'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const startUser = await prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, email: true, role: true }
        });

        res.json(startUser);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const searchUsers = async (req: any, res: Response) => {
    try {
        const { q } = req.query;

        const where: any = {};
        if (q && typeof q === 'string') {
            where.OR = [
                { firstName: { contains: q, mode: 'insensitive' } },
                { lastName: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
            ];
        }

        const users = await prisma.user.findMany({
            where,
            take: 10,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                email: true,
            },
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
