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
