const PDFDocument = require('pdfkit');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const Inventory = require('../models/Inventory');
const checkFarmAccess = require('../utils/checkFarmAccess');

// Shared helper: draws the report header (logo text, title, farm name, date range)
const drawHeader = (doc, title, farmName) => {
  doc.fontSize(20).fillColor('#15803d').text('BrumeAgri', { align: 'left' });
  doc.moveDown(0.3);
  doc.fontSize(16).fillColor('#111111').text(title);
  doc.fontSize(10).fillColor('#666666').text(`Farm: ${farmName}`);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`);
  doc.moveDown(1.5);
};

// Shared helper: draws a simple table (array of row arrays, first row = header)
const drawTable = (doc, rows, columnWidths) => {
  const startX = doc.x;
  let y = doc.y;

  rows.forEach((row, rowIndex) => {
    let x = startX;
    const isHeader = rowIndex === 0;

    doc.fontSize(9).fillColor(isHeader ? '#15803d' : '#333333');
    if (isHeader) doc.font('Helvetica-Bold'); else doc.font('Helvetica');

    row.forEach((cell, colIndex) => {
      doc.text(String(cell), x, y, { width: columnWidths[colIndex], ellipsis: true });
      x += columnWidths[colIndex];
    });

    y += 20;
    if (isHeader) {
      doc.moveTo(startX, y - 5).lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), y - 5)
        .strokeColor('#e5e5e5').stroke();
    }

    // Start a new page if we're near the bottom
    if (y > 750) {
      doc.addPage();
      y = 50;
    }
  });

  doc.y = y;
};

// @route  GET /api/reports/farm/:farmId/sales
const generateSalesReport = async (req, res) => {
  try {
    const farmDoc = await checkFarmAccess(req.params.farmId, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to generate reports for this farm' });
    }

    const sales = await Sale.find({ farm: req.params.farmId }).sort({ date: -1 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="sales-report-${Date.now()}.pdf"`);

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    drawHeader(doc, 'Sales Report', farmDoc.name);

    const rows = [
      ['Date', 'Product', 'Quantity', 'Customer', 'Amount'],
      ...sales.map((s) => [
        new Date(s.date).toLocaleDateString(),
        s.product,
        `${s.quantity} ${s.unit || ''}`,
        s.customer,
        `N${s.amount.toLocaleString()}`,
      ]),
    ];
    drawTable(doc, rows, [80, 120, 100, 130, 90]);

    const total = sales.reduce((sum, s) => sum + s.amount, 0);
    doc.moveDown(1);
    doc.fontSize(11).fillColor('#111111').font('Helvetica-Bold')
      .text(`Total Revenue: N${total.toLocaleString()}`);

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  GET /api/reports/farm/:farmId/expenses
const generateExpenseReport = async (req, res) => {
  try {
    const farmDoc = await checkFarmAccess(req.params.farmId, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to generate reports for this farm' });
    }

    const expenses = await Expense.find({ farm: req.params.farmId }).sort({ date: -1 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="expense-report-${Date.now()}.pdf"`);

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    drawHeader(doc, 'Expense Report', farmDoc.name);

    const rows = [
      ['Date', 'Category', 'Description', 'Amount'],
      ...expenses.map((e) => [
        new Date(e.date).toLocaleDateString(),
        e.category,
        e.description || '—',
        `N${e.amount.toLocaleString()}`,
      ]),
    ];
    drawTable(doc, rows, [80, 120, 200, 120]);

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    doc.moveDown(1);
    doc.fontSize(11).fillColor('#111111').font('Helvetica-Bold')
      .text(`Total Expenses: N${total.toLocaleString()}`);

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// @route  GET /api/reports/farm/:farmId/inventory
const generateInventoryReport = async (req, res) => {
  try {
    const farmDoc = await checkFarmAccess(req.params.farmId, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to generate reports for this farm' });
    }

    const items = await Inventory.find({ farm: req.params.farmId }).sort({ category: 1 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="inventory-report-${Date.now()}.pdf"`);

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    drawHeader(doc, 'Inventory Report', farmDoc.name);

    const rows = [
      ['Item', 'Category', 'Quantity', 'Unit Cost', 'Total Value', 'Status'],
      ...items.map((i) => [
        i.itemName,
        i.category,
        `${i.quantity} ${i.unit || ''}`,
        `N${(i.unitCost || 0).toLocaleString()}`,
        `N${(i.quantity * (i.unitCost || 0)).toLocaleString()}`,
        i.quantity <= i.minThreshold ? 'Low Stock' : 'Healthy',
      ]),
    ];
    drawTable(doc, rows, [100, 80, 90, 90, 90, 80]);

    const totalValue = items.reduce((sum, i) => sum + (i.quantity * (i.unitCost || 0)), 0);
    doc.moveDown(1);
    doc.fontSize(11).fillColor('#111111').font('Helvetica-Bold')
      .text(`Total Inventory Value: N${totalValue.toLocaleString()}`);

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

module.exports = { generateSalesReport, generateExpenseReport, generateInventoryReport };