const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  farm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
  },
  name: {
    type: String,
    required: true, // e.g. "Maize", "Tomatoes"
  },
  plantingDate: {
    type: Date,
    required: true,
  },
  expectedHarvestDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['planted', 'growing', 'ready_for_harvest', 'harvested'],
    default: 'planted',
  },
  expectedYield: {
    type: Number, // in kg, bags, or your chosen unit
  },
  actualYield: {
    type: Number,
    default: null, // stays null until harvest is recorded
  },
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100, // manually assessed crop health, 0-100
  },
}, { timestamps: true });

module.exports = mongoose.model('Crop', cropSchema);