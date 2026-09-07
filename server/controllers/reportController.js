// server/controllers/reportController.js
const puppeteer = require('puppeteer');
const Organization = require('../models/Organization');
const Chanda = require('../models/Chanda');
const Expense = require('../models/Expense');
const DailyEvent = require('../models/DailyEvent');
const buildReportHtml = require('../templates/reportTemplate');
const { displayValue } = require('../utils/otherField');

async function renderPdf(html) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const buffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px' } });
  await browser.close();
  return buffer;
}

function sendPdf(res, buffer, filename) {
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`,
  });
  res.send(buffer);
}

async function chandaReport(req, res) {
  try {
    const org = await Organization.findById(req.user.organization);
    const { year, month } = req.query;

    const start = new Date(Number(year), month ? Number(month) - 1 : 0, 1);
    const end = month ? new Date(Number(year), Number(month), 1) : new Date(Number(year) + 1, 0, 1);

    const chandas = await Chanda.find({
      organization: org._id,
      date: { $gte: start, $lt: end },
    }).sort({ date: 1 });

    const rows = chandas.map((c) => [
      new Date(c.date).toLocaleDateString('en-IN'),
      c.devoteeName,
      displayValue(c.chandaType),
      displayValue(c.paymentMode),
      `Rs. ${c.amount.toLocaleString('en-IN')}`,
    ]);

    const total = chandas.reduce((sum, c) => sum + c.amount, 0);
    const title = month
      ? `Chanda Report — ${start.toLocaleString('en-IN', { month: 'long' })} ${year}`
      : `Chanda Report — ${year}`;

    const html = buildReportHtml({
      org,
      reportTitle: title,
      columns: ['Date', 'Devotee', 'Type', 'Payment Mode', 'Amount'],
      rows,
      totalLabel: 'Total Chanda Received',
      totalValue: `Rs. ${total.toLocaleString('en-IN')}`,
    });

    const pdfBuffer = await renderPdf(html);
    sendPdf(res, pdfBuffer, `chanda-report-${year}${month ? '-' + month : ''}.pdf`);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate report', error: err.message });
  }
}

async function expenseReport(req, res) {
  try {
    const org = await Organization.findById(req.user.organization);
    const { year, month } = req.query;

    const start = new Date(Number(year), month ? Number(month) - 1 : 0, 1);
    const end = month ? new Date(Number(year), Number(month), 1) : new Date(Number(year) + 1, 0, 1);

    const expenses = await Expense.find({
      organization: org._id,
      date: { $gte: start, $lt: end },
    }).sort({ date: 1 });

    const rows = expenses.map((e) => [
      new Date(e.date).toLocaleDateString('en-IN'),
      displayValue(e.category),
      displayValue(e.purpose),
      displayValue(e.paymentMode),
      `Rs. ${e.amount.toLocaleString('en-IN')}`,
    ]);

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const title = month
      ? `Expense Report — ${start.toLocaleString('en-IN', { month: 'long' })} ${year}`
      : `Expense Report — ${year}`;

    const html = buildReportHtml({
      org,
      reportTitle: title,
      columns: ['Date', 'Category', 'Purpose', 'Payment Mode', 'Amount'],
      rows,
      totalLabel: 'Total Expenses',
      totalValue: `Rs. ${total.toLocaleString('en-IN')}`,
    });

    const pdfBuffer = await renderPdf(html);
    sendPdf(res, pdfBuffer, `expense-report-${year}${month ? '-' + month : ''}.pdf`);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate report', error: err.message });
  }
}

async function dailyEventReport(req, res) {
  try {
    const org = await Organization.findById(req.user.organization);
    const { year, month } = req.query;

    const start = new Date(Number(year), month ? Number(month) - 1 : 0, 1);
    const end = month ? new Date(Number(year), Number(month), 1) : new Date(Number(year) + 1, 0, 1);

    const events = await DailyEvent.find({
      organization: org._id,
      date: { $gte: start, $lt: end },
    }).sort({ date: 1 });

    const rows = events.map((ev) => [
      new Date(ev.date).toLocaleDateString('en-IN'),
      displayValue(ev.eventType),
      ev.budget ? `Rs. ${ev.budget.toLocaleString('en-IN')}` : '-',
      ev.description || '-',
    ]);

    const totalBudget = events.reduce((sum, ev) => sum + (ev.budget || 0), 0);
    const title = month
      ? `Daily Events Report — ${start.toLocaleString('en-IN', { month: 'long' })} ${year}`
      : `Daily Events Report — ${year}`;

    const html = buildReportHtml({
      org,
      reportTitle: title,
      columns: ['Date', 'Event Type', 'Budget', 'Description'],
      rows,
      totalLabel: 'Total Budget Spent',
      totalValue: `Rs. ${totalBudget.toLocaleString('en-IN')}`,
    });

    const pdfBuffer = await renderPdf(html);
    sendPdf(res, pdfBuffer, `events-report-${year}${month ? '-' + month : ''}.pdf`);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate report', error: err.message });
  }
}

module.exports = { chandaReport, expenseReport, dailyEventReport };