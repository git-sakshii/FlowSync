import prisma from '../config/database';

interface LogActivityParams {
    type: string;
    action: string;
    target: string;
    userId: string;
    projectId?: string;
    taskId?: string;
    details?: string;
}

export const logActivity = async (params: LogActivityParams) => {
    try {
        const { type, action, target, userId, projectId, taskId, details } = params;

        await prisma.activity.create({
            data: {
                type,
                action,
                target,
                userId,
                projectId,
                taskId,
                details,
            },
        });
    } catch (error) {
        console.error('Error logging activity:', error);
        // Don't throw - activity logging shouldn't block the main action
    }
};
