const Notice = require('../models/Notice');

// GET /api/notices
exports.getNotices = async (req, res) => {
    try {
        const { role } = req.user;
        const filter = { isActive: true };
        if (role !== 'sir') {
            filter.$or = [{ targetRole: 'all' }, { targetRole: role }];
        }
        const notices = await Notice.find(filter)
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name');
        res.json({ notices });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/notices
exports.createNotice = async (req, res) => {
    try {
        const { title, body, priority, targetRole, link } = req.body;
        if (!title || !body) return res.status(400).json({ message: 'Title and body required' });
        const notice = await Notice.create({
            title, body,
            priority: priority || 'normal',
            targetRole: targetRole || 'all',
            link: link || undefined,
            createdBy: req.user._id,
        });
        res.status(201).json({ notice });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/notices/:id
exports.updateNotice = async (req, res) => {
    try {
        const notice = await Notice.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!notice) return res.status(404).json({ message: 'Notice not found' });
        const { title, body, priority, targetRole } = req.body;
        if (title) notice.title = title;
        if (body) notice.body = body;
        if (priority) notice.priority = priority;
        if (targetRole) notice.targetRole = targetRole;
        await notice.save();
        res.json({ notice });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/notices/:id
exports.deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!notice) return res.status(404).json({ message: 'Notice not found' });
        notice.isActive = false;
        await notice.save();
        res.json({ message: 'Notice deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
