import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export const sendInviteEmail = async (email: string, firstName: string = 'Team Member') => {
    try {
        const fromEmail = process.env.EMAIL_FROM || 'noreply@flowsync.app';

        const msg = {
            to: email,
            from: fromEmail, // Must be a verified sender in SendGrid
            subject: 'You have been invited to FlowSync',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Hello ${firstName},</h2>
                    <p>You have been invited to join a FlowSync team.</p>
                    <p>Click the button below to accept the invitation and get started.</p>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/signup" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
                        Join FlowSync
                    </a>
                </div>
            `,
            text: `Hello ${firstName}, You have been invited to join a FlowSync team. Visit ${process.env.FRONTEND_URL || 'http://localhost:3000'}/signup to get started.`
        };

        await sgMail.send(msg);
        console.log('[SendGrid] Email sent to:', email);
        return { success: true };
    } catch (error: any) {
        console.error('[SendGrid Error]', error?.response?.body || error);
        return { success: false, error };
    }
};

export const sendPasswordResetEmail = async (email: string, resetUrl: string) => {
    try {
        const fromEmail = process.env.EMAIL_FROM || 'noreply@flowsync.app';

        const msg = {
            to: email,
            from: fromEmail,
            subject: 'Reset your FlowSync password',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Password Reset Request</h2>
                    <p>We received a request to reset your password. Click the button below to create a new password.</p>
                    <a href="${resetUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
                        Reset Password
                    </a>
                    <p style="margin-top: 24px; color: #666; font-size: 14px;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
                </div>
            `,
            text: `Password Reset Request: Visit ${resetUrl} to reset your password. This link expires in 1 hour.`
        };

        await sgMail.send(msg);
        console.log('[SendGrid] Password reset email sent to:', email);
        return { success: true };
    } catch (error: any) {
        console.error('[SendGrid Error]', error?.response?.body || error);
        return { success: false, error };
    }
};

export const sendProjectInviteEmail = async (
    email: string,
    inviterName: string,
    projectName: string,
    inviteToken: string
) => {
    try {
        const fromEmail = process.env.EMAIL_FROM || 'noreply@flowsync.app';
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const inviteUrl = `${frontendUrl}/invite/${inviteToken}`;

        const msg = {
            to: email,
            from: fromEmail,
            subject: `${inviterName} invited you to join "${projectName}" on FlowSync`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
                    <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 40px 32px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">FlowSync</h1>
                        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Workflow Management Platform</p>
                    </div>
                    <div style="padding: 40px 32px; border: 1px solid #e5e7eb; border-top: 0; border-radius: 0 0 12px 12px;">
                        <h2 style="margin: 0 0 16px; color: #111827; font-size: 22px;">You've been invited! 🎉</h2>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 8px;">
                            <strong>${inviterName}</strong> has invited you to collaborate on the project:
                        </p>
                        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px 20px; margin: 16px 0 24px; border-left: 4px solid #4F46E5;">
                            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">${projectName}</p>
                        </div>
                        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">
                            Join the team to start collaborating on tasks, track progress, and stay in sync.
                        </p>
                        <div style="text-align: center;">
                            <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(79,70,229,0.4);">
                                Accept Invitation
                            </a>
                        </div>
                        <p style="color: #9ca3af; font-size: 13px; margin: 28px 0 0; text-align: center;">
                            This invitation expires in 7 days. If you didn't expect this email, you can safely ignore it.
                        </p>
                    </div>
                </div>
            `,
            text: `${inviterName} invited you to join "${projectName}" on FlowSync. Accept the invitation: ${inviteUrl}`
        };

        await sgMail.send(msg);
        console.log('[SendGrid] Project invite email sent to:', email);
        return { success: true };
    } catch (error: any) {
        console.error('[SendGrid Error]', error?.response?.body || error);
        return { success: false, error };
    }
};

export const sendProjectAddedEmail = async (
    email: string,
    adderName: string,
    projectName: string,
    projectId: string
) => {
    try {
        const fromEmail = process.env.EMAIL_FROM || 'noreply@flowsync.app';
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const projectUrl = `${frontendUrl}/dashboard/projects/${projectId}`;

        const msg = {
            to: email,
            from: fromEmail,
            subject: `You've been added to "${projectName}" on FlowSync`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 40px 32px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">FlowSync</h1>
                    </div>
                    <div style="padding: 40px 32px; border: 1px solid #e5e7eb; border-top: 0; border-radius: 0 0 12px 12px;">
                        <h2 style="margin: 0 0 16px; color: #111827;">You've been added to a project</h2>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                            <strong>${adderName}</strong> added you to <strong>${projectName}</strong>.
                        </p>
                        <div style="text-align: center; margin-top: 24px;">
                            <a href="${projectUrl}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                Open Project
                            </a>
                        </div>
                    </div>
                </div>
            `,
            text: `${adderName} added you to "${projectName}" on FlowSync. View the project: ${projectUrl}`
        };

        await sgMail.send(msg);
        return { success: true };
    } catch (error: any) {
        console.error('[SendGrid Error]', error?.response?.body || error);
        return { success: false, error };
    }
};
