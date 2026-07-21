const logActivity = require('../utils/logActivity');
const Worker = require('../models/Worker');
const checkFarmAccess = require('../utils/checkFarmAccess');
const getFarmRole = require('../utils/getFarmRole');
const checkWriteAccess = require('../utils/checkWriteAccess');

// @route  POST /api/workers
const createWorker = async (req, res) => {
  try {
    const { farm, name, position, contact, status } = req.body;

    if (!farm || !name || !position) {
      return res.status(400).json({ message: 'Farm, name, and position are required' });
    }

    const farmDoc = await checkWriteAccess(farm, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Investors have read-only access and cannot add workers.' });
    }

    const worker = await Worker.create({ farm, name, position, contact, status });
    await logActivity(
  farm,
  req.user._id,
  'worker',
  `Worker added: ${name} - ${position}`
);
    res.status(201).json(worker);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  GET /api/workers/farm/:farmId
const getWorkersByFarm = async (req, res) => {
  try {
    const farmDoc = await checkFarmAccess(req.params.farmId, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to view workers for this farm' });
    }

    const workers = await Worker.find({ farm: req.params.farmId }).sort({ createdAt: -1 });
    res.json(workers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  PUT /api/workers/:id
const updateWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    const farmDoc = await checkWriteAccess(worker.farm, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Investors have read-only access and cannot update workers.' });
    }

    const { name, position, contact, status } = req.body;

    worker.name = name || worker.name;
    worker.position = position || worker.position;
    worker.contact = contact || worker.contact;
    worker.status = status || worker.status;

    const updatedWorker = await worker.save();
    res.json(updatedWorker);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  DELETE /api/workers/:id
const deleteWorker = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    const { farm, isAdmin, isOwner } = await getFarmRole(sale.farm, req.user._id);
    if (!farm || (!isOwner && !isAdmin)) {
      return res.status(403).json({ message: 'Only the farm owner or an admin can delete sales records' });
    }

    await sale.deleteOne();
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

module.exports = { createWorker, getWorkersByFarm, updateWorker, deleteWorker };