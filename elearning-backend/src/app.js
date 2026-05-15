const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express'); 
const swaggerSpec = require('./config/swagger'); 

const globalErrorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

// Import Routes
const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const contentRoutes = require('./routes/content.routes');
const progressRoutes = require('./routes/progress.routes');
const submissionRoutes = require('./routes/submission.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const uploadRoutes = require('./routes/upload.routes');
const userRoutes = require('./routes/user.routes'); // 🔥 PASTIKAN IMPORT INI ADA

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: false, 
})); 
app.use(cors());
app.use(express.json({ limit: '10kb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ==============================================
// 🚨 DAFTAR RUTE (HARUS DI ATAS ERROR HANDLER)
// ==============================================
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes); 
app.use('/api/users', userRoutes); // 🔥 INI POSISINYA HARUS DI SINI

// ==============================================
// 🚨 404 ERROR HANDLER (HARUS DI PALING BAWAH)
// ==============================================
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;