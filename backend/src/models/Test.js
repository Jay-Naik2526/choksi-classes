const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    date: { type: Date, required: true },
    duration: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    instructions: { type: String },
    status: {
        type: String,
        enum: ['draft', 'published', 'active', 'completed', 'results_released'],
        default: 'draft'
    },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resultsReleasedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);
