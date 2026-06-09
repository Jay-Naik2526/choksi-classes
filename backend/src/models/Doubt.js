const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    chapter: { type: String },
    question: { type: String, required: true },
    questionImageUrl: { type: String },
    questionImageId: { type: String },
    answer: { type: String },
    answerImageUrl: { type: String },
    answerImageId: { type: String },
    status: { type: String, enum: ['pending', 'answered'], default: 'pending' },
    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    answeredAt: { type: Date },
    messages: [{
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        senderName: { type: String },
        senderRole: { type: String },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    }],
}, { timestamps: true });

module.exports = mongoose.model('Doubt', doubtSchema);
