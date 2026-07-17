require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const { errorHandler, xssClean } = require('./middleware/errorHandler');
const { setupSocket } = require('./socket/socketHandler');

const authRoutes = require('./routes/auth');
const donorRoutes = require('./routes/donors');
const receiverRoutes = require('./routes/receivers');
const adminRoutes = require('./routes/admin');
const hospitalRoutes = require('./routes/hospitals');
const notificationRoutes = require('./routes/notifications');
const chatRoutes = require('./routes/chat');
const callRoutes = require('./routes/calls');
const searchRoutes = require('./routes/search');
const rewardRoutes = require('./routes/rewards');
const reportRoutes = require('./routes/reports');
const mapRoutes = require('./routes/maps');
const emergencyRoutes = require('./routes/emergency');
const aiRoutes = require('./routes/ai');
const compatibilityRoutes = require('./routes/compatibility');
const bloodBankRoutes = require('./routes/bloodbanks');
const campRoutes = require('./routes/camps');
const availabilityRoutes = require('./routes/availability');
const blogRoutes = require('./routes/blogs');
const { seedSampleCamps } = require('./controllers/campController');
const seedBlogs = require('./utils/seedBlogs');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());
app.use(xssClean);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later'
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LifeFlow API is running' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/receivers', receiverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/compatibility', compatibilityRoutes);
app.use('/api/bloodbanks', bloodBankRoutes);
app.use('/api/camps', campRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/blogs', blogRoutes);

app.use(errorHandler);

setupSocket(io);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  seedSampleCamps().catch(err => console.error('Seed camps error:', err.message));
  seedBlogs().catch(err => console.error('Seed blogs error:', err.message));
  server.listen(PORT, () => {
    console.log(`LifeFlow server running on port ${PORT}`);
  });
});

module.exports = { app, server, io };
