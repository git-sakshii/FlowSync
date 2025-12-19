import prisma from '../config/database';

interface CreateNotificationParams {
    type: string;
    title: string;
    message: string;
    userId: string;
    data?: any;
}

export const createNotification = async (params: CreateNotificationParams) => {
    try {
        const { type, title, message, userId, data } = params;

        // Check user preferences before sending
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { emailNotif: true, pushNotif: true }
        });

        if (!user) return;

        // In a real app, you might check specific types (e.g. taskAssigned) against preferences
        // For now, we just create the database record

        await prisma.notification.create({
            data: {
                type,
                title,
                message,
                userId,
                data: data || {},
            },
        });

        // Here you would also trigger real-time updates (Socket.io) or push notifications
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};
