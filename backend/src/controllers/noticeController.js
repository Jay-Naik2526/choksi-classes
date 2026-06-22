const Notice = require('../models/Notice');

// GET /api/notices
exports.getNotices = async (req, res) => {
    try {
        const { role } = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const filter = { isActive: true };
        if (role !== 'sir') {
            filter.$or = [{ targetRole: 'all' }, { targetRole: role }];
        }
        const total = await Notice.countDocuments(filter);
        const notices = await Notice.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'name')
            .lean();
        res.json({
            notices,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
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
        // Any Sir/admin may edit any notice
        const notice = await Notice.findById(req.params.id);
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
        // Any Sir/admin may delete any notice
        const notice = await Notice.findById(req.params.id);
        if (!notice) return res.status(404).json({ message: 'Notice not found' });
        notice.isActive = false;
        await notice.save();
        res.json({ message: 'Notice deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/notices/:id/read
exports.markRead = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (!notice) return res.status(404).json({ message: 'Notice not found' });

        if (!notice.readBy.includes(req.user._id)) {
            notice.readBy.push(req.user._id);
            await notice.save();
        }
        res.json({ message: 'Notice marked as read', readBy: notice.readBy });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
