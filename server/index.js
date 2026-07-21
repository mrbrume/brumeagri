const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const farmRoutes = require('./routes/farmRoutes');
const cropRoutes = require('./routes/cropRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const saleRoutes = require('./routes/saleRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const workerRoutes = require('./routes/workerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const activityRoutes = require('./routes/activityRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const investmentRoutes = require('./routes/investmentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { authLimiter, apiLimiter } = require('./middleware/rateLimiters');

const app = express();

connectDB();

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL, // set this in Render once you know your Vercel URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/farms', apiLimiter, farmRoutes);
app.use('/api/crops', apiLimiter, cropRoutes);
app.use('/api/inventory', apiLimiter, inventoryRoutes);
app.use('/api/sales', apiLimiter, saleRoutes);
app.use('/api/expenses', apiLimiter, expenseRoutes);
app.use('/api/workers', apiLimiter, workerRoutes);
app.use('/api/attendance', apiLimiter, attendanceRoutes);
app.use('/api/dashboard', apiLimiter, dashboardRoutes);
app.use('/api/activity', apiLimiter, activityRoutes);
app.use('/api/notifications', apiLimiter, notificationRoutes);
app.use('/api/weather', apiLimiter, weatherRoutes);
app.use('/api/investments', apiLimiter, investmentRoutes);
app.use('/api/reports', apiLimiter, reportRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'BrumeAgri API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});