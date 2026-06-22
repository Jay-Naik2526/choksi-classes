const Material = require('../models/Material');
const User = require('../models/User');
const { uploadToDrive, deleteFromDrive } = require('../utils/driveUpload');

// GET /api/materials
exports.getMaterials = async (req, res) => {
    try {
        const { subject, chapter, type, search } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const filter = { isActive: true };
        if (subject) filter.subject = subject;
        if (chapter) filter.chapter = new RegExp(chapter, 'i');
        if (type) filter.type = type;
        if (search) filter.title = new RegExp(search, 'i');

        // FIX #3: Students and parents only see materials for their batch(es)
        if (req.user.role === 'student' || req.user.role === 'parent') {
            let studentIds = [req.user._id];
            if (req.user.role === 'parent') {
                const parent = await User.findById(req.user._id).select('childIds').lean();
                studentIds = parent.childIds || [];
            }
            // Gather all batchIds across the relevant students
            const studentDocs = await User.find({ _id: { $in: studentIds } }).select('batchIds').lean();
            const allBatchIds = studentDocs.flatMap(s => s.batchIds || []);
            filter.$or = [
                { batchIds: { $size: 0 } },
                { batchIds: { $elemMatch: { $in: allBatchIds } } },
            ];
        }

        const total = await Material.countDocuments(filter);
        const materials = await Material.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('uploadedBy', 'name')
            .populate('batchIds', 'name')
            .lean();

        const user = await User.findById(req.user._id).select('bookmarkedMaterials').lean();
        const bookmarkSet = new Set((user?.bookmarkedMaterials || []).map(b => b.toString()));
        const materialsWithBookmark = materials.map(m => ({
            ...m,
            isBookmarked: bookmarkSet.has(m._id.toString()),
        }));
        res.json({
            materials: materialsWithBookmark,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/materials — Sir only (with file upload)
exports.createMaterial = async (req, res) => {
    try {
        const { title, subject, chapter, type, videoUrl, description, batchIds } = req.body;
        if (!title || !subject || !type) return res.status(400).json({ message: 'Title, subject, type required' });

        let fileId, driveLink;

        if (type !== 'video' && req.file) {
            const result = await uploadToDrive(req.file);
            fileId = result.fileId;
            driveLink = result.webViewLink;
        }

        const parsedBatchIds = batchIds ? JSON.parse(batchIds) : [];

        const material = await Material.create({
            title, subject, chapter, type,
            fileId, driveLink,
            videoUrl: type === 'video' ? videoUrl : undefined,
            description,
            batchIds: parsedBatchIds,
            uploadedBy: req.user._id,
        });

        res.status(201).json({ material });
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

// PUT /api/materials/:id
exports.updateMaterial = async (req, res) => {
    try {
        // Any Sir/admin may edit any material (consistent with delete)
        const material = await Material.findById(req.params.id);
        if (!material) return res.status(404).json({ message: 'Material not found' });
        const { title, subject, chapter, description } = req.body;
        if (title) material.title = title;
        if (subject) material.subject = subject;
        if (chapter) material.chapter = chapter;
        if (description) material.description = description;
        await material.save();
        res.json({ material });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/materials/:id
exports.deleteMaterial = async (req, res) => {
    try {
        // FIX #2: Any sir can delete any material (not just the uploader)
        const material = await Material.findById(req.params.id);
        if (!material) return res.status(404).json({ message: 'Material not found' });
        if (material.fileId) await deleteFromDrive(material.fileId);
        material.isActive = false;
        await material.save();
        res.json({ message: 'Material deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/materials/:id/bookmark — toggle bookmark for current user
exports.toggleBookmark = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const matId = req.params.id;
        const idx = user.bookmarkedMaterials.findIndex(b => b.toString() === matId);
        if (idx === -1) {
            user.bookmarkedMaterials.push(matId);
        } else {
            user.bookmarkedMaterials.splice(idx, 1);
        }
        await user.save();
        res.json({ bookmarked: idx === -1, bookmarks: user.bookmarkedMaterials });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/materials/subjects — unique subjects list
exports.getSubjects = async (req, res) => {
    try {
        const subjects = await Material.distinct('subject', { isActive: true });
        res.json({ subjects });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/materials/batch-groups — returns batch-grouped summary for folder view
exports.getBatchGroups = async (req, res) => {
    try {
        const materials = await Material.find({ isActive: true })
            .populate('batchIds', 'name')
            .select('batchIds subject chapter title')
            .lean();

        // Build { batchId: { id, name, subjects: Set } }
        const batchMap = {};

        materials.forEach(m => {
            const batches = m.batchIds && m.batchIds.length > 0
                ? m.batchIds
                : [{ _id: 'general', name: 'General' }];

            batches.forEach(b => {
                const key = b._id?.toString() || 'general';
                if (!batchMap[key]) batchMap[key] = { id: key, name: b.name || 'General', count: 0, subjects: new Set() };
                batchMap[key].count += 1;
                if (m.subject) batchMap[key].subjects.add(m.subject);
            });
        });

        const groups = Object.values(batchMap).map(g => ({
            id: g.id,
            name: g.name,
            count: g.count,
            subjectCount: g.subjects.size,
        }));

        res.json({ groups });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
