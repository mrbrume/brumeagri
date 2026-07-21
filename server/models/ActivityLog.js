const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  farm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['sale', 'expense', 'inventory', 'worker', 'crop'],
    required: true,
  },
  message: {
    type: String,
    required: true, // e.g. "Sale recorded: 50 bags of maize - ₦380,000"
  },
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);