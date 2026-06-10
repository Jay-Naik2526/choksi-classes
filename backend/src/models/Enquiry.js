const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
    parentName: { type: String, required: true, trim: true },
    childName:  { type: String, trim: true, default: '' },
    className:  { type: String, trim: true, default: '' },
    board:      { type: String, trim: true, default: '' },
    phone:      { type: String, required: true, trim: true },
    message:    { type: String, trim: true, default: '' },

    // Sir manages these
    status: {
        type: String,
        enum: ['new', 'contacted', 'enrolled', 'closed'],
        default: 'new',
    },
    note: { type: String, default: '' },   // Sir's internal note
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);
