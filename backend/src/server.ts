import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit'; // Will enable later when configured
import authRoutes from './routes/auth.routes';
// Import other routes as they are created

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        process.env.FRONTEND_URL || 'http://localhost:3000'
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting (global)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Stricter rate limiting for auth routes (prevent brute-force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 auth attempts per 15 min
    message: { message: 'Too many authentication attempts. Please try again later.' }
});

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api', require('./routes/invite.routes').default);
app.use('/api/users', require('./routes/users.routes').default);
app.use('/api/projects', require('./routes/projects.routes').default);
app.use('/api', require('./routes/tasks.routes').default); // Has /projects/:id/tasks and /tasks direct routes
app.use('/api/tasks/:id/comments', require('./routes/comments.routes').default);
app.use('/api/activity', require('./routes/activity.routes').default);
app.use('/api/notifications', require('./routes/notifications.routes').default);
app.use('/api/analytics', require('./routes/analytics.routes').default);
app.use('/api/search', require('./routes/search.routes').default);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
