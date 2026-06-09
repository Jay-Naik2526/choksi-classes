const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    studentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    note:       { type: String, default: '' },
    fileUrl:    String,
    fileId:     String,
    grade:      String,   // e.g. "A+", "8/10", "Good"
    feedback:   String,
    gradedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    submittedAt:{ type: Date, default: Date.now },
    gradedAt:   Date,
}, { _id: false });

const homeworkSchema = new mongoose.Schema({
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    subject:     { type: String, default: '' },
    dueDate:     { type: Date, required: true },
    batchId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submissions: [submissionSchema],
    isActive:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Homework', homeworkSchema);
