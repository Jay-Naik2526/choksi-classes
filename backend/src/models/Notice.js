const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    priority: { type: String, enum: ['normal', 'urgent', 'holiday'], default: 'normal' },
    targetRole: { type: String, enum: ['all', 'student', 'parent'], default: 'all', index: true },
    link: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true, index: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
