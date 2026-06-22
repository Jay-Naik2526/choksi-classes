const Homework  = require('../models/Homework');
const Batch     = require('../models/Batch');
const User      = require('../models/User');
const { uploadToDrive } = require('../utils/driveUpload');
const { sendPushToMany, sendPushToUser } = require('../utils/pushNotifications');

// GET /api/homework
exports.list = async (req, res) => {
    try {
        const { role, _id } = req.user;
        let query = { isActive: true };

        let targetStudentId = _id;
        let targetBatchIds = req.user.batchIds || [];

        if (role === 'parent') {
            const studentId = req.query.studentId;
            if (!studentId) {
                return res.status(400).json({ message: 'studentId query parameter required' });
            }
            const parent = await User.findById(_id).lean();
            const isChild = parent.childIds?.some(cid => cid.toString() === studentId);
            if (!isChild) {
                return res.status(403).json({ message: 'Access denied: student is not linked to this parent' });
            }
            targetStudentId = studentId;
            const studentDoc = await User.findById(studentId).select('batchIds').lean();
            targetBatchIds = studentDoc?.batchIds || [];
        }

        if (role === 'student' || role === 'parent') {
            query.$or = [
                { batchId: { $in: targetBatchIds } },
                { batchId: null },
                { batchId: { $exists: false } }
            ];
        }

        const homeworks = await Homework.find(query)
            .populate('batchId', 'name subject')
            .populate('createdBy', 'name')
            .sort({ dueDate: 1 });

        if (role === 'student' || role === 'parent') {
            const result = homeworks.map(hw => {
                const sub = hw.submissions.find(
                    s => s.studentId?.toString() === targetStudentId.toString()
                );
                const hwObj = hw.toObject();
                delete hwObj.submissions;
                return { ...hwObj, mySubmission: sub || null };
            });
            return res.json({ homeworks: result });
        }

        res.json({ homeworks });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/homework/:id
exports.getOne = async (req, res) => {
    try {
        const { role, _id } = req.user;
        const hw = await Homework.findById(req.params.id)
            .populate('batchId', 'name subject')
            .populate('createdBy', 'name')
            .populate('submissions.studentId', 'name rollNumber');
        if (!hw || !hw.isActive) return res.status(404).json({ message: 'Not found' });

        if (role === 'student' || role === 'parent') {
            let targetStudentId = _id;
            if (role === 'parent') {
                const studentId = req.query.studentId;
                if (!studentId) {
                    return res.status(400).json({ message: 'studentId query parameter required' });
                }
                const parent = await User.findById(_id).lean();
                const isChild = parent.childIds?.some(cid => cid.toString() === studentId);
                if (!isChild) {
                    return res.status(403).json({ message: 'Access denied: student is not linked to this parent' });
                }
                targetStudentId = studentId;
            }

            const sub = hw.submissions.find(
                s => (s.studentId?._id || s.studentId)?.toString() === targetStudentId.toString()
            );
            const hwObj = hw.toObject();
            hwObj.submissions = sub ? [sub] : [];
            return res.json({ homework: hwObj });
        }

        res.json({ homework: hw });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/homework  (sir only)
exports.create = async (req, res) => {
    try {
        const { title, description, dueDate, batchId, subject } = req.body;
        const hw = await Homework.create({
            title,
            description,
            dueDate,
            batchId: batchId || undefined,
            subject,
            createdBy: req.user._id,
        });

        // Push notification to all students in batch
        if (batchId) {
            const batch = await Batch.findById(batchId).select('students');
            if (batch?.students?.length) {
                sendPushToMany(batch.students, {
                    title: '📚 New Homework',
                    body: `${title} — due ${new Date(dueDate).toLocaleDateString('en-IN')}`,
                    url: '/homework',
                }).catch(() => {});
            }
        }

        res.status(201).json({ homework: hw });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/homework/:id  (sir only)
exports.update = async (req, res) => {
    try {
        const hw = await Homework.findById(req.params.id);
        if (!hw) return res.status(404).json({ message: 'Not found' });
        ['title','description','dueDate','subject'].forEach(k => {
            if (req.body[k] !== undefined) hw[k] = req.body[k];
        });
        await hw.save();
        res.json({ homework: hw });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/homework/:id  (sir only)
exports.remove = async (req, res) => {
    try {
        const hw = await Homework.findById(req.params.id);
        if (!hw) return res.status(404).json({ message: 'Not found' });
        hw.isActive = false;
        await hw.save();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/homework/:id/submit  (student)
exports.submit = async (req, res) => {
    try {
        const hw = await Homework.findById(req.params.id);
        if (!hw || !hw.isActive) return res.status(404).json({ message: 'Not found' });

        const sid = req.user._id.toString();
        if (hw.submissions.some(s => s.studentId?.toString() === sid))
            return res.status(400).json({ message: 'Already submitted' });

        let fileUrl, fileId;
        if (req.file) {
            const result = await uploadToDrive(req.file);
            fileUrl = result.directUrl;
            fileId  = result.fileId;
        }

        hw.submissions.push({ studentId: req.user._id, note: req.body.note || '', fileUrl, fileId });
        await hw.save();

        // Notify sir
        const sir = await User.findOne({ role: 'sir' }).select('_id');
        if (sir) {
            sendPushToUser(sir._id, {
                title: '✅ Homework Submitted',
                body: `${req.user.name} submitted "${hw.title}"`,
                url: `/homework/${hw._id}`,
            }).catch(() => {});
        }

        res.json({ message: 'Submitted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/homework/:id/grade/:studentId  (sir)
exports.grade = async (req, res) => {
    try {
        const hw = await Homework.findById(req.params.id);
        if (!hw) return res.status(404).json({ message: 'Not found' });

        const sub = hw.submissions.find(s => s.studentId?.toString() === req.params.studentId);
        if (!sub) return res.status(404).json({ message: 'Submission not found' });

        sub.grade    = req.body.grade || sub.grade;
        sub.feedback = req.body.feedback || sub.feedback;
        sub.gradedBy = req.user._id;
        sub.gradedAt = new Date();
        await hw.save();

        sendPushToUser(req.params.studentId, {
            title: '🎯 Homework Graded!',
            body: `"${hw.title}" — Grade: ${sub.grade}`,
            url: '/homework',
        }).catch(() => {});

        res.json({ message: 'Graded' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
