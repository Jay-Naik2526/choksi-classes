const Material = require('../models/Material');
const User = require('../models/User');
const { uploadToDrive, deleteFromDrive } = require('../utils/driveUpload');

// GET /api/materials
exports.getMaterials = async (req, res) => {
    try {
        const { subject, chapter, type, search } = req.query;
        const filter = { isActive: true };
        if (subject) filter.subject = subject;
        if (chapter) filter.chapter = new RegExp(chapter, 'i');
        if (type) filter.type = type;
        if (search) filter.title = new RegExp(search, 'i');

        const materials = await Material.find(filter)
            .sort({ createdAt: -1 })
            .populate('uploadedBy', 'name');
        const user = await User.findById(req.user._id).select('bookmarkedMaterials');
        const bookmarkSet = new Set(user.bookmarkedMaterials.map(b => b.toString()));
        const materialsWithBookmark = materials.map(m => ({
            ...m.toObject(),
            isBookmarked: bookmarkSet.has(m._id.toString()),
        }));
        res.json({ materials: materialsWithBookmark });
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

        const material = await Material.create({
            title, subject, chapter, type,
            fileId, driveLink,
            videoUrl: type === 'video' ? videoUrl : undefined,
            description,
            batchIds: batchIds ? JSON.parse(batchIds) : [],
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
        const material = await Material.findOne({ _id: req.params.id, uploadedBy: req.user._id });
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
        const material = await Material.findOne({ _id: req.params.id, uploadedBy: req.user._id });
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
