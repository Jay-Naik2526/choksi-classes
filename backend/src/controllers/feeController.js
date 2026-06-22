const Fee = require('../models/Fee');
const User = require('../models/User');
const { generateFeeInvoice } = require('../utils/generateInvoice');
const { uploadToDrive } = require('../utils/driveUpload');
const sendEmail = require('../utils/sendEmail');

// GET /api/fees — Sir: all fees; Student/Parent: own fees
exports.getFees = async (req, res) => {
    try {
        const { role, _id } = req.user;
        const { status, studentId, month, year } = req.query;

        let filter = {};
        if (role === 'student') filter.studentId = _id;
        else if (role === 'parent') {
            const studentId = req.query.studentId;
            const parent = await User.findById(_id).lean();
            if (studentId) {
                const isChild = parent.childIds?.some(cid => cid.toString() === studentId);
                if (!isChild) {
                    return res.status(403).json({ message: 'Access denied: student is not linked to this parent' });
                }
                filter.studentId = studentId;
            } else {
                filter.studentId = { $in: parent.childIds || [] };
            }
        } else {
            if (studentId) filter.studentId = studentId;
            if (status) filter.status = status;
        }
        if (month) filter.month = parseInt(month);
        if (year) filter.year = parseInt(year);

        const fees = await Fee.find(filter)
            .sort({ year: -1, month: -1 })
            .populate('studentId', 'name email rollNumber');

        res.json({ fees });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/fees — Sir: create fee entry
exports.createFee = async (req, res) => {
    try {
        const { studentId, amount, month, year, dueDate, notes } = req.body;
        if (!studentId || !amount || !month || !year)
            return res.status(400).json({ message: 'Student, amount, month, year required' });

        const fee = await Fee.create({
            studentId, amount, month, year,
            dueDate: dueDate || new Date(year, month - 1, 10),
            notes, createdBy: req.user._id,
        });
        res.status(201).json({ fee });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Fee already exists for this month' });
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/fees/:id/pay — Sir: mark as paid
exports.markPaid = async (req, res) => {
    try {
        const fee = await Fee.findById(req.params.id);
        if (!fee) return res.status(404).json({ message: 'Fee not found' });
        fee.status = 'paid';
        fee.paidAt = new Date();
        await fee.save();
        res.json({ fee });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/fees/update-overdue — auto-update overdue
exports.updateOverdue = async (req, res) => {
    try {
        const result = await Fee.updateMany(
            { status: 'pending', dueDate: { $lt: new Date() } },
            { $set: { status: 'overdue' } }
        );
        res.json({ updated: result.modifiedCount });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/fees/:id/invoice — generate PDF invoice
exports.generateInvoice = async (req, res) => {
    try {
        const fee = await Fee.findById(req.params.id).populate('studentId');
        if (!fee) return res.status(404).json({ message: 'Fee not found' });

        const { role, _id } = req.user;
        if (role === 'parent') {
            const parent = await User.findById(_id);
            const isChild = parent.childIds.map(c => c.toString()).includes(fee.studentId._id.toString());
            if (!isChild) return res.status(403).json({ message: 'Access denied' });
        } else if (role === 'student' && fee.studentId._id.toString() !== _id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const pdfBuffer = await generateFeeInvoice(fee, fee.studentId);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${fee._id}.pdf`);
        res.send(pdfBuffer);
    } catch (err) {
        res.status(500).json({ message: 'Error generating invoice' });
    }
};

// POST /api/fees/bulk — Sir: create fees for all students or a batch
exports.bulkCreateFees = async (req, res) => {
    try {
        const { amount, month, year, batchId, dueDate } = req.body;
        if (!amount || !month || !year) return res.status(400).json({ message: 'Amount, month, year required' });
        const filter = { role: 'student', isActive: true };
        if (batchId) filter.batchIds = batchId;
        const students = await User.find(filter).select('_id');
        let created = 0, skipped = 0;
        for (const s of students) {
            try {
                await Fee.create({
                    studentId: s._id, amount, month: parseInt(month), year: parseInt(year),
                    dueDate: dueDate || new Date(year, month - 1, 10),
                    createdBy: req.user._id,
                });
                created++;
            } catch (e) {
                if (e.code === 11000) skipped++; // already exists
                else throw e;
            }
        }
        res.json({ message: `Created ${created} fees, skipped ${skipped} (already existed)`, created, skipped });
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

// POST /api/fees/send-reminders — send email reminders for due/overdue fees
exports.sendReminders = async (req, res) => {
    try {
        const threeDaysFromNow = new Date(Date.now() + 3 * 86400000);
        const dueSoon = await Fee.find({
            status: 'pending',
            dueDate: { $lte: threeDaysFromNow, $gte: new Date() },
        }).populate('studentId', 'name email');

        const overdue = await Fee.find({ status: 'overdue' })
            .populate('studentId', 'name email');

        const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        let sent = 0;
        for (const fee of dueSoon) {
            if (!fee.studentId?.email) continue;
            try {
                await sendEmail({
                    to: fee.studentId.email,
                    subject: `Choksi Classes — Fee due on ${new Date(fee.dueDate).toLocaleDateString('en-IN')}`,
                    html: `<div style="font-family:sans-serif;max-width:500px;margin:auto">
                        <div style="background:#2C1810;padding:20px;border-radius:12px 12px 0 0;text-align:center">
                            <h2 style="color:#F5F0E8;margin:0;font-family:Georgia">Choksi Classes</h2>
                        </div>
                        <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;border:1px solid #eee">
                            <p>Hi <strong>${fee.studentId.name}</strong>,</p>
                            <p>Your fee for <strong>${MONTHS[fee.month]} ${fee.year}</strong> of <strong>₹${fee.amount}</strong> is due on <strong>${new Date(fee.dueDate).toLocaleDateString('en-IN')}</strong>.</p>
                            <p style="color:#888;font-size:12px">Please pay before the due date to avoid overdue status.</p>
                        </div>
                    </div>`,
                });
                sent++;
            } catch (_) {}
        }
        for (const fee of overdue) {
            if (!fee.studentId?.email) continue;
            try {
                await sendEmail({
                    to: fee.studentId.email,
                    subject: `Choksi Classes — Fee OVERDUE for ${MONTHS[fee.month]} ${fee.year}`,
                    html: `<div style="font-family:sans-serif;max-width:500px;margin:auto">
                        <div style="background:#C1440E;padding:20px;border-radius:12px 12px 0 0;text-align:center">
                            <h2 style="color:#fff;margin:0;font-family:Georgia">Fee Overdue</h2>
                        </div>
                        <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;border:1px solid #eee">
                            <p>Hi <strong>${fee.studentId.name}</strong>,</p>
                            <p>Your fee of <strong>₹${fee.amount}</strong> for <strong>${MONTHS[fee.month]} ${fee.year}</strong> is <strong style="color:#C1440E">overdue</strong>. Please pay immediately.</p>
                        </div>
                    </div>`,
                });
                sent++;
            } catch (_) {}
        }
        res.json({ message: `Sent ${sent} reminder emails`, dueSoon: dueSoon.length, overdue: overdue.length });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/fees/analytics — Sir: summary
exports.getAnalytics = async (req, res) => {
    try {
        const { year } = req.query;
        const y = parseInt(year) || new Date().getFullYear();

        const agg = await Fee.aggregate([
            { $match: { year: y } },
            { $group: {
                _id: '$status',
                total: { $sum: '$amount' },
                count: { $sum: 1 },
            }},
        ]);

        const result = { paid: { total: 0, count: 0 }, pending: { total: 0, count: 0 }, overdue: { total: 0, count: 0 } };
        agg.forEach(({ _id, total, count }) => { result[_id] = { total, count }; });

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
