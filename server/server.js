// server/server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import passport from './middleware/passport.js';

// Import routes
import authRoutes from './routes/auth.js';
// import adminRoutes from './routes/admin.js';
import adminRoutes from './routes/admin.js'; // ✅ now default export exists
import jobRoutes from './routes/jobs.js';
import companyRoutes from './routes/companies.js';
import applicationRoutes from './routes/applications.js';
import profileRoutes from './routes/profiles.js';
import notificationRoutes from './routes/notifications.js';
import blogRoutes from './routes/blog.js';
import savedJobsRoutes from './routes/savedJobs.js'; // ✅ check folder name!
import contactsRoutes from './routes/conatact.js';
import likedRoutes from './routes/likedJobs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['https://bahathjobz.com', 'https://www.bahathjobz.com', 'http://localhost:5173', 'http://localhost:4173'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session required for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'super-secret-key',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());


// Serve uploaded files
// Use process.cwd() to match where upload.js saves files
// This ensures files are served from the same directory they are saved to
const uploadsPath = path.join(process.cwd(), 'uploads');
console.log('📁 Serving uploads from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/saved-jobs', savedJobsRoutes); // ✅ saved jobs mounted correctly
app.use('/api/contacts', contactsRoutes);
app.use('/api/liked-jobs', likedRoutes);


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Handle 404 - must be last, after all routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error.message);
});

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

// Keep process alive
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});
