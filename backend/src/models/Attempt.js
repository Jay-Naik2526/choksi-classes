const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    answers: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        selectedOption: String,
        textAnswer: String,
        marksAwarded: { type: Number, default: 0 },
        isCorrect: Boolean,
    }],
    score: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    status: { type: String, enum: ['in_progress', 'submitted', 'graded'], default: 'in_progress' },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    timeTaken: { type: Number },
}, { timestamps: true });

attemptSchema.index({ studentId: 1, testId: 1 }, { unique: true });

module.exports = mongoose.model('Attempt', attemptSchema);
