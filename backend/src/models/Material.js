const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, index: true },
    chapter: { type: String, index: true },
    type: { type: String, enum: ['pdf', 'video', 'note'], required: true },
    fileId: { type: String },
    driveLink: { type: String },
    videoUrl: { type: String },
    description: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    batchIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch', index: true }],
    isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);
