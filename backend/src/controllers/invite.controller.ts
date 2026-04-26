import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/database';
import { sendProjectInviteEmail, sendProjectAddedEmail } from '../services/email.service';
import { logActivity } from '../services/activity.service';
import { createNotification } from '../services/notification.service';

// POST /projects/:id/invite — Invite a user to a project by email
export const inviteToProject = async (req: any, res: Response) => {
    try {
        const { id: projectId } = req.params;
        const { email } = req.body;
        const inviterId = req.user.id;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Fetch the project
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true, name: true, ownerId: true }
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Get inviter info
        const inviter = await prisma.user.findUnique({
            where: { id: inviterId },
            select: { firstName: true, lastName: true }
        });

        const inviterName = inviter ? `${inviter.firstName} ${inviter.lastName}` : 'A team member';

        // Check if the user already exists in the platform
        const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true, firstName: true, lastName: true, email: true }
        });

        if (existingUser) {
            // Check if already a member
            const existingMembership = await prisma.projectMember.findFirst({
                where: { projectId, userId: existingUser.id }
            });

            if (existingMembership) {
                return res.status(400).json({ message: 'User is already a member of this project' });
            }

            // Auto-add them to the project
            await prisma.projectMember.create({
                data: { projectId, userId: existingUser.id }
            });

            // Log activity
            await logActivity({
                type: 'member-add',
                action: 'added',
                target: `${existingUser.firstName} ${existingUser.lastName}`,
                userId: inviterId,
                projectId,
                details: 'Added to project'
            });

            // Send notification to the user
            await createNotification({
                type: 'project-invite',
                title: 'Added to Project',
                message: `${inviterName} added you to "${project.name}"`,
                userId: existingUser.id,
                data: { projectId }
            });

            // Try to send email notification
            if (process.env.BREVO_API_KEY) {
                await sendProjectAddedEmail(email, inviterName, project.name, projectId);
            }

            return res.json({
                status: 'added',
                message: `${existingUser.firstName} has been added to the project`,
                user: existingUser
            });
        }

        // User doesn't exist — create a pending invite
        // Check for existing pending invite
        const existingInvite = await prisma.projectInvite.findFirst({
            where: { email, projectId, status: 'pending' }
        });

        if (existingInvite) {
            return res.status(400).json({ message: 'An invitation has already been sent to this email' });
        }

        // Generate invite token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await prisma.projectInvite.create({
            data: {
                email,
                token,
                projectId,
                invitedBy: inviterId,
                expiresAt
            }
        });

        // Try to send invite email
        if (process.env.BREVO_API_KEY) {
            await sendProjectInviteEmail(email, inviterName, project.name, token);
        }

        res.json({
            status: 'invited',
            message: `Invitation sent to ${email}`,
            token // Return token for dev/testing (in production you'd omit this)
        });
    } catch (error: any) {
        console.error('Invite error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'An invitation has already been sent to this email for this project' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /invite/:token — Get invite details (public, no auth needed)
export const getInviteDetails = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;

        const invite = await prisma.projectInvite.findUnique({
            where: { token },
            include: {
                project: { select: { id: true, name: true, description: true } }
            }
        });

        if (!invite) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        if (invite.status !== 'pending') {
            return res.status(400).json({ message: 'This invitation has already been used', status: invite.status });
        }

        if (new Date() > invite.expiresAt) {
            await prisma.projectInvite.update({
                where: { id: invite.id },
                data: { status: 'expired' }
            });
            return res.status(400).json({ message: 'This invitation has expired' });
        }

        // Get inviter info
        const inviter = await prisma.user.findUnique({
            where: { id: invite.invitedBy },
            select: { firstName: true, lastName: true, avatar: true }
        });

        res.json({
            email: invite.email,
            project: invite.project,
            inviter: inviter ? {
                name: `${inviter.firstName} ${inviter.lastName}`,
                avatar: inviter.avatar
            } : null,
            expiresAt: invite.expiresAt
        });
    } catch (error) {
        console.error('Get invite error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /invite/:token/accept — Accept invite after auth (auth required)
export const acceptInvite = async (req: any, res: Response) => {
    try {
        const { token } = req.params;
        const userId = req.user.id;

        const invite = await prisma.projectInvite.findUnique({
            where: { token },
            include: {
                project: { select: { id: true, name: true } }
            }
        });

        if (!invite) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        if (invite.status !== 'pending') {
            return res.status(400).json({ message: 'This invitation has already been used' });
        }

        if (new Date() > invite.expiresAt) {
            await prisma.projectInvite.update({
                where: { id: invite.id },
                data: { status: 'expired' }
            });
            return res.status(400).json({ message: 'This invitation has expired' });
        }

        // Verify user email matches invite email
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, firstName: true, lastName: true }
        });

        if (!user || user.email.toLowerCase() !== invite.email.toLowerCase()) {
            return res.status(403).json({
                message: 'This invitation was sent to a different email address'
            });
        }

        // Check if already a member
        const existingMembership = await prisma.projectMember.findFirst({
            where: { projectId: invite.projectId, userId }
        });

        if (!existingMembership) {
            // Add user to project
            await prisma.projectMember.create({
                data: { projectId: invite.projectId, userId }
            });
        }

        // Mark invite as accepted
        await prisma.projectInvite.update({
            where: { id: invite.id },
            data: { status: 'accepted' }
        });

        // Log activity
        await logActivity({
            type: 'member-join',
            action: 'joined',
            target: invite.project.name,
            userId,
            projectId: invite.projectId,
            details: 'Accepted project invitation'
        });

        // Notify the inviter
        await createNotification({
            type: 'invite-accepted',
            title: 'Invitation Accepted',
            message: `${user.firstName} ${user.lastName} joined "${invite.project.name}"`,
            userId: invite.invitedBy,
            data: { projectId: invite.projectId }
        });

        res.json({
            message: 'Successfully joined the project',
            projectId: invite.projectId,
            projectName: invite.project.name
        });
    } catch (error) {
        console.error('Accept invite error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /projects/:id/invites — Get pending invites for a project
export const getProjectInvites = async (req: any, res: Response) => {
    try {
        const { id: projectId } = req.params;

        const invites = await prisma.projectInvite.findMany({
            where: { projectId, status: 'pending' },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                status: true,
                createdAt: true,
                expiresAt: true
            }
        });

        res.json(invites);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
