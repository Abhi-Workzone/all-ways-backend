import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config/index.js';
import connectDB from './config/database.js';
import authRoutes from './modules/auth/auth.routes.js';
import serviceRoutes from './modules/services/service.routes.js';
import requestRoutes from './modules/requests/request.routes.js';
import userRoutes from './modules/users/user.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import path from 'path';
const app = express();

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'allWays API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
    console.log(`📋 Environment: ${config.nodeEnv}`);
  });
};
startServer().catch(console.error);
export default app;