const Doubt = require('../models/Doubt');
const User = require('../models/User');
const { uploadToDrive } = require('../utils/driveUpload');
const sendEmail = require('../utils/sendEmail');

// GET /api/doubts
exports.getDoubts = async (req, res) => {
    try {
        const { role, _id } = req.user;
        const { status, subject } = req.query;
        const filter = {};

        if (role === 'student') filter.studentId = _id;
        else if (role === 'parent') {
            const parent = await User.findById(_id);
            filter.studentId = { $in: parent.childIds };
        }
        if (status) filter.status = status;
        if (subject) filter.subject = subject;

        const doubts = await Doubt.find(filter)
            .sort({ createdAt: -1 })
            .populate('studentId', 'name')
            .populate('answeredBy', 'name');

        res.json({ doubts });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/doubts/:id
exports.getDoubt = async (req, res) => {
    try {
        const doubt = await Doubt.findById(req.params.id)
            .populate('studentId', 'name profilePhoto')
            .populate('answeredBy', 'name');
        if (!doubt) return res.status(404).json({ message: 'Doubt not found' });
        res.json({ doubt });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/doubts — Student: submit doubt
exports.submitDoubt = async (req, res) => {
    try {
        const { subject, chapter, question } = req.body;
        if (!subject || !question) return res.status(400).json({ message: 'Subject and question required' });

        let questionImageUrl, questionImageId;
        if (req.file) {
            const result = await uploadToDrive(req.file);
            questionImageUrl = result.webViewLink;
            questionImageId = result.fileId;
        }

        const doubt = await Doubt.create({
            studentId: req.user._id,
            subject, chapter, question,
            questionImageUrl, questionImageId,
        });

        res.status(201).json({ doubt });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/doubts/:id/answer — Sir: answer doubt
exports.answerDoubt = async (req, res) => {
    try {
        const doubt = await Doubt.findById(req.params.id);
        if (!doubt) return res.status(404).json({ message: 'Doubt not found' });

        let answerImageUrl, answerImageId;
        if (req.file) {
            const result = await uploadToDrive(req.file);
            answerImageUrl = result.webViewLink;
            answerImageId = result.fileId;
        }

        doubt.answer = req.body.answer;
        doubt.answerImageUrl = answerImageUrl;
        doubt.answerImageId = answerImageId;
        doubt.status = 'answered';
        doubt.answeredBy = req.user._id;
        doubt.answeredAt = new Date();
        await doubt.save();
        await doubt.populate('studentId', 'name email');

        // Email student
        try {
            await sendEmail({
                to: doubt.studentId.email,
                subject: 'Choksi Classes — Your doubt has been answered',
                html: `<div style="font-family:sans-serif;max-width:500px;margin:auto">
                    <div style="background:#2C1810;padding:20px;text-align:center;border-radius:12px 12px 0 0">
                        <h2 style="color:#F5F0E8;margin:0;font-family:Georgia">Choksi Classes</h2>
                    </div>
                    <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;border:1px solid #eee">
                        <p style="color:#2C1810">Hi <strong>${doubt.studentId.name}</strong>,</p>
                        <p>Your doubt in <strong>${doubt.subject}</strong> has been answered!</p>
                        <div style="background:#F5F0E8;border-radius:8px;padding:16px;margin:12px 0">
                            <p style="margin:0 0 8px;color:#666;font-size:12px">Your Question:</p>
                            <p style="margin:0;color:#2C1810">${doubt.question}</p>
                        </div>
                        <div style="background:#fff3e0;border-radius:8px;padding:16px;border-left:4px solid #C1440E">
                            <p style="margin:0 0 8px;color:#C1440E;font-size:12px;font-weight:bold">Answer:</p>
                            <p style="margin:0;color:#2C1810">${doubt.answer}</p>
                        </div>
                        <p style="color:#999;font-size:12px;margin-top:16px">Login to Choksi Classes to view the full answer.</p>
                    </div>
                </div>`,
            });
        } catch (_) {}

        res.json({ doubt });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/doubts/:id/messages — add follow-up message
exports.addMessage = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text?.trim()) return res.status(400).json({ message: 'Message cannot be empty' });
        const doubt = await Doubt.findById(req.params.id);
        if (!doubt) return res.status(404).json({ message: 'Doubt not found' });
        doubt.messages.push({
            sender: req.user._id,
            senderName: req.user.name,
            senderRole: req.user.role,
            text: text.trim(),
        });
        await doubt.save();
        // Broadcast to all clients in this doubt room via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.to(`doubt_${req.params.id}`).emit('new_message', {
                messages: doubt.messages,
            });
        }
        res.json({ messages: doubt.messages });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/doubts/:id — Student: delete own doubt
exports.deleteDoubt = async (req, res) => {
    try {
        const doubt = await Doubt.findOne({ _id: req.params.id, studentId: req.user._id });
        if (!doubt) return res.status(404).json({ message: 'Doubt not found' });
        await doubt.deleteOne();
        res.json({ message: 'Doubt deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
