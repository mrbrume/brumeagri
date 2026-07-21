const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  farm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
  },
  category: {
    type: String,
    enum: ['seeds', 'fertilizer', 'chemicals', 'equipment'],
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  unit: {
    type: String,
    default: 'units',
  },
  unitCost: {
    type: Number,
    default: 0, // cost per single unit, in your currency
  },
  minThreshold: {
    type: Number,
    default: 10,
  },
}, { timestamps: true });

inventorySchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.minThreshold;
});

// New virtual: total value of this item = quantity × cost per unit
inventorySchema.virtual('totalValue').get(function () {
  return this.quantity * this.unitCost;
});

inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Inventory', inventorySchema);