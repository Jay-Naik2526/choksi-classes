const User = require('../models/User');
const Batch = require('../models/Batch');
const Test = require('../models/Test');
const Attempt = require('../models/Attempt');
const Fee = require('../models/Fee');
const Doubt = require('../models/Doubt');
const { uploadToDrive, deleteFromDrive } = require('../utils/driveUpload');
const sendEmail = require('../utils/sendEmail');

const welcomeEmail = ({ name, email, password, role }) => `
<div style="font-family:sans-serif;max-width:500px;margin:auto">
  <div style="background:#2C1810;padding:24px;text-align:center;border-radius:12px 12px 0 0">
    <h2 style="color:#F5F0E8;margin:0;font-family:Georgia,serif">Choksi Classes</h2>
    <p style="color:#E8A020;margin:4px 0 0;font-size:13px">Navsari, Gujarat</p>
  </div>
  <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;border:1px solid #eee">
    <h3 style="color:#2C1810;margin-top:0">Welcome, ${name}!</h3>
    <p style="color:#555">Your <strong>${role}</strong> account has been created on Choksi Classes. Here are your login details:</p>
    <div style="background:#F5F0E8;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #C1440E">
      <p style="margin:4px 0"><strong>Email:</strong> ${email}</p>
      <p style="margin:4px 0"><strong>Password:</strong> ${password}</p>
    </div>
    <p style="color:#888;font-size:12px">Please log in and change your password at the earliest.</p>
  </div>
</div>`;

// GET /api/users/stats — Sir dashboard stats
exports.getSirStats = async (req, res) => {
    try {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        const [totalStudents, testsThisMonth, doubtsPending] = await Promise.all([
            User.countDocuments({ role: 'student', isActive: true }),
            Test.countDocuments({ createdAt: { $gte: startOfMonth } }),
            Doubt.countDocuments({ status: 'pending' }),
        ]);

        const feeAgg = await Fee.aggregate([
            { $match: { status: { $in: ['pending', 'overdue'] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const feesPending = feeAgg[0]?.total || 0;

        const upcomingTests = await Test.find({
            date: { $gte: new Date() },
            status: { $in: ['published', 'active'] },
        }).sort({ date: 1 }).limit(5).populate('batchId', 'name subject');

        const recentDoubts = await Doubt.find({ status: 'pending' })
            .sort({ createdAt: -1 }).limit(5)
            .populate('studentId', 'name');

        const overdueStudents = await Fee.find({ status: 'overdue' })
            .sort({ createdAt: -1 }).limit(5)
            .populate('studentId', 'name email phone');

        const topScorer = await Attempt.aggregate([
            { $match: { status: { $in: ['submitted', 'graded'] }, submittedAt: { $gte: startOfMonth } } },
            { $group: { _id: '$studentId', totalScore: { $sum: '$score' }, count: { $sum: 1 } } },
            { $sort: { totalScore: -1 } },
            { $limit: 1 },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'student' } },
            { $unwind: '$student' },
        ]);

        res.json({
            totalStudents,
            testsThisMonth,
            feesPending,
            doubtsPending,
            upcomingTests,
            recentDoubts,
            overdueStudents,
            topScorer: topScorer[0] || null,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/users/my-stats — Student dashboard stats
exports.getStudentStats = async (req, res) => {
    try {
        const studentId = req.user._id;

        const attempts = await Attempt.find({
            studentId,
            status: { $in: ['submitted', 'graded'] },
        }).sort({ submittedAt: -1 });

        const testsTaken = attempts.length;
        const avgScore = testsTaken
            ? Math.round(attempts.reduce((s, a) => s + (a.percentage || 0), 0) / testsTaken)
            : 0;

        const [doubtsAsked, doubtsAnswered, materialsAvailable] = await Promise.all([
            Doubt.countDocuments({ studentId }),
            Doubt.countDocuments({ studentId, status: 'answered' }),
            require('../models/Material').countDocuments({ isActive: true }),
        ]);
        const doubtsAnsweredPct = doubtsAsked > 0 ? Math.round((doubtsAnswered / doubtsAsked) * 100) : 0;

        const last5 = attempts.slice(0, 5).reverse();
        const performanceHistory = await Promise.all(
            last5.map(async (a) => {
                const test = await Test.findById(a.testId).select('name subject');
                return {
                    name: test?.name || 'Test',
                    subject: test?.subject || '',
                    score: a.score,
                    percentage: a.percentage,
                    date: a.submittedAt,
                };
            })
        );

        res.json({ testsTaken, avgScore, doubtsAsked, doubtsAnswered: doubtsAnsweredPct, materialsAvailable, performanceHistory });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/users/my-children — Parent: get children with stats
exports.getMyChildren = async (req, res) => {
    try {
        const parent = await User.findById(req.user._id).populate('childIds', 'name email rollNumber batchIds');
        const children = parent.childIds || [];

        const childrenData = await Promise.all(
            children.map(async (child) => {
                const attempts = await Attempt.find({
                    studentId: child._id,
                    status: { $in: ['submitted', 'graded'] },
                });
                const avgScore = attempts.length
                    ? Math.round(attempts.reduce((s, a) => s + (a.percentage || 0), 0) / attempts.length)
                    : 0;
                const pendingFees = await Fee.find({ studentId: child._id, status: { $in: ['pending', 'overdue'] } });
                const totalDue = pendingFees.reduce((s, f) => s + f.amount, 0);
                return {
                    ...child.toObject(),
                    avgScore,
                    testsTaken: attempts.length,
                    totalDue,
                };
            })
        );

        res.json({ children: childrenData });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/users/students — Sir: list all students
exports.getStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('-password -otp -otpExpiry')
            .populate('batchIds', 'name subject')
            .sort({ name: 1 });
        res.json({ students });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/users/students — Sir: create student
exports.createStudent = async (req, res) => {
    try {
        const { name, email, password, phone, rollNumber, batchIds, address, referredBy } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already registered' });

        const student = await User.create({
            name, email, password, phone, rollNumber, batchIds, address,
            referredBy: referredBy || null,
            role: 'student',
        });

        if (batchIds?.length) {
            await Batch.updateMany(
                { _id: { $in: batchIds } },
                { $addToSet: { students: student._id } }
            );
        }

        try {
            await sendEmail({
                to: email,
                subject: 'Choksi Classes — Your student account is ready',
                html: welcomeEmail({ name, email, password, role: 'Student' }),
            });
        } catch (_) {}

        res.status(201).json({ message: 'Student created', student: { id: student._id, name: student.name, email: student.email } });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Email already registered' });
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/users/students/:id — Sir: update student
exports.updateStudent = async (req, res) => {
    try {
        const { isActive, batchIds, name, phone, rollNumber, address } = req.body;
        const student = await User.findById(req.params.id);
        if (!student || student.role !== 'student') return res.status(404).json({ message: 'Student not found' });

        if (name !== undefined) student.name = name;
        if (phone !== undefined) student.phone = phone;
        if (rollNumber !== undefined) student.rollNumber = rollNumber;
        if (address !== undefined) student.address = address;
        if (isActive !== undefined) student.isActive = isActive;
        if (batchIds !== undefined) student.batchIds = batchIds;
        await student.save();

        res.json({ message: 'Student updated' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/users/batches — list batches
exports.getBatches = async (req, res) => {
    try {
        const batches = await Batch.find({ isActive: true }).populate('students', 'name').sort({ name: 1 });
        res.json({ batches });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/users/batches — Sir: create batch
exports.createBatch = async (req, res) => {
    try {
        const { name, subject, schedule, capacity } = req.body;
        const batch = await Batch.create({ name, subject, schedule, capacity, createdBy: req.user._id });
        res.status(201).json({ batch });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/users/batches/:id — Sir: delete batch
exports.deleteBatch = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);
        if (!batch) return res.status(404).json({ message: 'Batch not found' });
        await User.updateMany({ batchIds: batch._id }, { $pull: { batchIds: batch._id } });
        await batch.deleteOne();
        res.json({ message: 'Batch deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/users/parents — Sir: list all parents
exports.getParents = async (req, res) => {
    try {
        const parents = await User.find({ role: 'parent' })
            .select('-password -otp -otpExpiry')
            .populate('childIds', 'name rollNumber')
            .sort({ name: 1 });
        res.json({ parents });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/users/parents — Sir: create parent
exports.createParent = async (req, res) => {
    try {
        const { name, email, password, phone, childIds } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already registered' });

        const parent = await User.create({ name, email, password, phone, childIds: childIds || [], role: 'parent' });

        try {
            await sendEmail({
                to: email,
                subject: 'Choksi Classes — Your parent account is ready',
                html: welcomeEmail({ name, email, password, role: 'Parent' }),
            });
        } catch (_) {}

        res.status(201).json({ parent: { id: parent._id, name: parent.name, email: parent.email } });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Email already registered' });
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/users/parents/:id — Sir: update parent info + linked children
exports.updateParent = async (req, res) => {
    try {
        const { name, phone, childIds, isActive } = req.body;
        const parent = await User.findOne({ _id: req.params.id, role: 'parent' });
        if (!parent) return res.status(404).json({ message: 'Parent not found' });
        if (name !== undefined) parent.name = name;
        if (phone !== undefined) parent.phone = phone;
        if (childIds !== undefined) parent.childIds = childIds;
        if (isActive !== undefined) parent.isActive = isActive;
        await parent.save();
        res.json({ message: 'Parent updated' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/users/profile — get own profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password -otp -otpExpiry')
            .populate('batchIds', 'name subject schedule')
            .populate('childIds', 'name email rollNumber');
        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/users/profile — update own profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address, dateOfBirth } = req.body;
        const user = await User.findById(req.user._id);
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (dateOfBirth) user.dateOfBirth = dateOfBirth;
        await user.save();
        res.json({ message: 'Profile updated' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/users/students/:id/progress-report — generate PDF
exports.generateProgressReport = async (req, res) => {
    try {
        const student = await User.findById(req.params.id)
            .select('-password')
            .populate('batchIds', 'name subject');
        if (!student || student.role !== 'student')
            return res.status(404).json({ message: 'Student not found' });

        // Security check
        const { role, _id } = req.user;
        if (role === 'student' && String(_id) !== String(student._id)) {
            return res.status(403).json({ message: 'Access denied: You can only generate your own report' });
        }
        if (role === 'parent') {
            const parent = await User.findById(_id);
            const isChild = parent.childIds?.some(cid => String(cid) === String(student._id));
            if (!isChild) {
                return res.status(403).json({ message: 'Access denied: Student is not linked to this parent' });
            }
        }

                const [attempts, fees, doubts] = await Promise.all([
            Attempt.find({ studentId: student._id, status: { $in: ['submitted', 'graded'] } })
                .populate('testId', 'name subject totalMarks')
                .sort({ submittedAt: -1 }).limit(8),
            Fee.find({ studentId: student._id }).sort({ year: -1, month: -1 }).limit(6),
            Doubt.countDocuments({ studentId: student._id }),
        ]);

        const avgScore = attempts.length
            ? Math.round(attempts.reduce((s, a) => s + (a.percentage || 0), 0) / attempts.length) : 0;

        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ margin: 0, size: 'A4', autoFirstPage: true });

        const bufs = [];
        doc.on('data', d => bufs.push(d));
        doc.on('end', () => {
            const buf = Buffer.concat(bufs);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=progress-${student.name.replace(/ /g, '_')}.pdf`);
            res.send(buf);
        });

        const MG = 40; // left/right margin
        const W = 595 - MG * 2; // usable width
        const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const INK = '#2C1810';
        const TERRA = '#C1440E';
        const GOLD = '#E8A020';
        const CHALK = '#F5F0E8';

        // ── Helper: section heading ──────────────────────────────────────────
        const sectionHeading = (title) => {
            doc.moveDown(0.8);
            doc.fontSize(12).font('Times-Bold').fillColor(TERRA).text(title, MG);
            const lineY = doc.y + 2;
            doc.moveTo(MG, lineY).lineTo(595 - MG, lineY).lineWidth(1).stroke(TERRA);
            doc.moveDown(0.4);
        };

        // ── Helper: table row (draws rect + text at fixed Y, then moves doc.y) ──
        const tableRow = (cells, widths, y, bg, textColor = INK, fontSize = 8) => {
            doc.rect(MG, y, W, 17).fill(bg).stroke(bg);
            doc.fillColor(textColor).fontSize(fontSize).font('Helvetica');
            let x = MG;
            cells.forEach((cell, i) => {
                doc.text(String(cell), x + 3, y + 4, { width: widths[i] - 6, lineBreak: false });
                x += widths[i];
            });
        };

        // ═══════════════════════════════════════════════════════════════════
        // HEADER BAND
        // ═══════════════════════════════════════════════════════════════════
        doc.rect(0, 0, 595, 80).fill(INK);
        doc.fillColor(CHALK).fontSize(22).font('Times-Bold').text('Choksi Classes', MG, 18);
        doc.fillColor(CHALK).fontSize(10).font('Helvetica').text('Progress Report  ·  Navsari, Gujarat', MG, 48);
        doc.fillColor(GOLD).fontSize(9).font('Helvetica')
            .text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 0, 52, { align: 'right', width: 595 - MG });

        // ═══════════════════════════════════════════════════════════════════
        // STUDENT INFO BOX
        // ═══════════════════════════════════════════════════════════════════
        const infoY = 92;
        doc.rect(MG, infoY, W, 70).lineWidth(1).stroke(TERRA);
        doc.fontSize(15).font('Times-Bold').fillColor(TERRA).text(student.name, MG + 10, infoY + 10);
        doc.fontSize(9).font('Helvetica').fillColor(INK);
        const rollStr = student.rollNumber ? `Roll No: ${student.rollNumber}` : 'Roll No: —';
        doc.text(`${rollStr}   |   ${student.email}`, MG + 10, infoY + 32);
        const batchNames = (student.batchIds && student.batchIds.length > 0)
            ? student.batchIds.map(b => b.name || '').filter(Boolean).join(', ')
            : '—';
        doc.text(`Batches: ${batchNames}`, MG + 10, infoY + 48);

        // ═══════════════════════════════════════════════════════════════════
        // SUMMARY CARDS (4 equal columns)
        // ═══════════════════════════════════════════════════════════════════
        const cardsY = 175;
        const cardW = W / 4;
        const cardItems = [
            { label: 'Tests Taken', value: String(attempts.length) },
            { label: 'Avg Score',   value: `${avgScore}%` },
            { label: 'Doubts Asked', value: String(doubts) },
            { label: 'Fees Unpaid', value: String(fees.filter(f => f.status !== 'paid').length) },
        ];
        cardItems.forEach((card, i) => {
            const cx = MG + i * cardW;
            const isLast = i === cardItems.length - 1;
            doc.rect(cx, cardsY, cardW, 52).fill(CHALK);
            if (!isLast) doc.moveTo(cx + cardW, cardsY + 6).lineTo(cx + cardW, cardsY + 46).lineWidth(0.5).stroke('rgba(193,68,14,0.2)');
            doc.fillColor(TERRA).fontSize(18).font('Times-Bold')
                .text(card.value, cx, cardsY + 10, { width: cardW, align: 'center' });
            doc.fillColor(INK).fontSize(8).font('Helvetica')
                .text(card.label, cx, cardsY + 34, { width: cardW, align: 'center' });
        });
        // card border
        doc.rect(MG, cardsY, W, 52).lineWidth(0.5).stroke('rgba(193,68,14,0.25)');

        // ═══════════════════════════════════════════════════════════════════
        // TEST PERFORMANCE TABLE
        // ═══════════════════════════════════════════════════════════════════
        doc.y = cardsY + 52;
        sectionHeading('Test Performance');

        if (attempts.length === 0) {
            doc.fontSize(9).font('Helvetica').fillColor('#888').text('No tests attempted yet.', MG);
        } else {
            const colW = [195, 80, 55, 60, 45, 80];
            const headers = ['Test Name', 'Subject', 'Score', 'Total', '%', 'Date'];
            const hdrY = doc.y;

            // header row
            doc.rect(MG, hdrY, W, 18).fill(INK);
            doc.fillColor('#fff').fontSize(8).font('Helvetica-Bold');
            let hx = MG;
            headers.forEach((h, i) => {
                doc.text(h, hx + 3, hdrY + 4, { width: colW[i] - 6, lineBreak: false });
                hx += colW[i];
            });

            let rowY = hdrY + 18;
            attempts.slice(0, 8).forEach((att, idx) => {
                const t = att.testId;
                const bg = idx % 2 === 0 ? '#FFFFFF' : CHALK;
                const dateStr = att.submittedAt
                    ? new Date(att.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                    : '-';
                const cells = [
                    t?.name || '—',
                    t?.subject || '—',
                    String(att.score ?? 0),
                    String(t?.totalMarks ?? '—'),
                    `${att.percentage ?? 0}%`,
                    dateStr,
                ];
                tableRow(cells, colW, rowY, bg);
                rowY += 17;
            });
            doc.y = rowY + 6;
        }

        // ═══════════════════════════════════════════════════════════════════
        // FEE HISTORY TABLE
        // ═══════════════════════════════════════════════════════════════════
        sectionHeading('Fee History');

        if (fees.length === 0) {
            doc.fontSize(9).font('Helvetica').fillColor('#888').text('No fee records found.', MG);
        } else {
            const fColW = [120, 90, 90, 110, 105];
            const fHeaders = ['Month', 'Amount', 'Status', 'Due Date', 'Paid On'];
            const fhY = doc.y;

            doc.rect(MG, fhY, W, 18).fill(INK);
            doc.fillColor('#fff').fontSize(8).font('Helvetica-Bold');
            let fx = MG;
            fHeaders.forEach((h, i) => {
                doc.text(h, fx + 3, fhY + 4, { width: fColW[i] - 6, lineBreak: false });
                fx += fColW[i];
            });

            let rowY = fhY + 18;
            fees.slice(0, 6).forEach((fee, idx) => {
                const bg = idx % 2 === 0 ? '#FFFFFF' : CHALK;
                const statusClr = fee.status === 'paid' ? '#16a34a' : fee.status === 'overdue' ? TERRA : GOLD;
                doc.rect(MG, rowY, W, 17).fill(bg).stroke(bg);

                doc.fillColor(INK).fontSize(8).font('Helvetica');
                doc.text(`${MONTHS[fee.month] || ''} ${fee.year}`, MG + 3, rowY + 4, { width: fColW[0] - 6, lineBreak: false });
                doc.text(`Rs.${fee.amount}`, MG + fColW[0] + 3, rowY + 4, { width: fColW[1] - 6, lineBreak: false });
                doc.fillColor(statusClr).font('Helvetica-Bold')
                    .text(fee.status.toUpperCase(), MG + fColW[0] + fColW[1] + 3, rowY + 4, { width: fColW[2] - 6, lineBreak: false });
                doc.fillColor(INK).font('Helvetica');
                const dueStr = fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN') : '-';
                doc.text(dueStr, MG + fColW[0] + fColW[1] + fColW[2] + 3, rowY + 4, { width: fColW[3] - 6, lineBreak: false });
                const paidStr = fee.paidAt ? new Date(fee.paidAt).toLocaleDateString('en-IN') : '-';
                doc.text(paidStr, MG + fColW[0] + fColW[1] + fColW[2] + fColW[3] + 3, rowY + 4, { width: fColW[4] - 6, lineBreak: false });
                rowY += 17;
            });
            doc.y = rowY + 8;
        }

        // ═══════════════════════════════════════════════════════════════════
        // FOOTER BAND — flows naturally, no absolute positioning
        // ═══════════════════════════════════════════════════════════════════
        doc.moveDown(1);
        doc.rect(0, doc.y, 595, 38).fill(INK);
        doc.fillColor(CHALK).fontSize(8).font('Helvetica')
            .text('Choksi Classes, Navsari, Gujarat  |  choksiclasses@gmail.com', 0, doc.y + 8, { align: 'center', width: 595 });
        doc.fillColor(GOLD).fontSize(7)
            .text('This is a computer-generated report. No signature required.', 0, doc.y + 20, { align: 'center', width: 595 });

        doc.end();
    } catch (err) {
        res.status(500).json({ message: 'Report generation failed: ' + err.message });
    }
};

// POST /api/users/profile/photo — upload profile photo
exports.uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const user = await User.findById(req.user._id);
        if (user.profilePhotoId) await deleteFromDrive(user.profilePhotoId);
        const result = await uploadToDrive(req.file);
        user.profilePhoto = result.directUrl;
        user.profilePhotoId = result.fileId;
        await user.save();
        res.json({ photoUrl: result.webViewLink });
    } catch (err) {
        res.status(500).json({ message: 'Upload failed' });
    }
};

// GET /api/users/referrals — Sir: referral leaderboard
exports.getReferrals = async (req, res) => {
    try {
        const referred = await User.find({ role: 'student', referredBy: { $ne: null } })
            .populate('referredBy', 'name rollNumber')
            .select('name rollNumber referredBy createdAt');

        const map = {};
        for (const s of referred) {
            const rid = s.referredBy?._id?.toString();
            if (!rid) continue;
            if (!map[rid]) {
                map[rid] = {
                    referrer: { _id: rid, name: s.referredBy.name, rollNumber: s.referredBy.rollNumber },
                    count: 0, students: [],
                };
            }
            map[rid].count++;
            map[rid].students.push({ _id: s._id, name: s.name, rollNumber: s.rollNumber, joinedAt: s.createdAt });
        }

        const leaderboard = Object.values(map).sort((a, b) => b.count - a.count);
        res.json({ leaderboard, totalReferred: referred.length });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/users/sirs — Sir: list all sirs
exports.getSirs = async (req, res) => {
    try {
        const sirs = await User.find({ role: 'sir' })
            .select('-password -otp -otpExpiry')
            .sort({ name: 1 });
        res.json({ sirs });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/users/sirs — Sir: create sir
exports.createSir = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already registered' });

        const sir = await User.create({
            name, email, password, phone,
            role: 'sir',
        });

        try {
            await sendEmail({
                to: email,
                subject: 'Choksi Classes — Your admin account is ready',
                html: welcomeEmail({ name, email, password, role: 'Sir/Teacher (Admin)' }),
            });
        } catch (_) {}

        res.status(201).json({ message: 'Admin created', sir: { id: sir._id, name: sir.name, email: sir.email } });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Email already registered' });
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/users/sirs/:id — Sir: update sir
exports.updateSir = async (req, res) => {
    try {
        const { isActive, name, phone } = req.body;
        const sir = await User.findById(req.params.id);
        if (!sir || sir.role !== 'sir') return res.status(404).json({ message: 'Admin not found' });

        if (name !== undefined) sir.name = name;
        if (phone !== undefined) sir.phone = phone;
        if (isActive !== undefined) sir.isActive = isActive;
        await sir.save();

        res.json({ message: 'Admin updated' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
