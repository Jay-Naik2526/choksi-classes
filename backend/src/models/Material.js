const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true },
    chapter: { type: String },
    type: { type: String, enum: ['pdf', 'video', 'note'], required: true },
    fileId: { type: String },
    driveLink: { type: String },
    videoUrl: { type: String },
    description: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    batchIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);
