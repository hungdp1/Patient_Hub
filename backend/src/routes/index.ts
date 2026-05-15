import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import dataRoutes from './dataRoutes';

const app = express();

// Main routes setup
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/data', dataRoutes);

export default app;
