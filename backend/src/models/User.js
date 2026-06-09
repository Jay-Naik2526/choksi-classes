const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['sir', 'student', 'parent'], required: true },
    phone: { type: String },
    isActive: { type: Boolean, default: true },
    otp: { type: String },
    otpExpiry: { type: Date },
    // Student-specific
    rollNumber: { type: String },
    batchIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
    dateOfBirth: { type: Date },
    address: { type: String },
    // Parent-specific
    childIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Profile
    profilePhoto: { type: String },
    profilePhotoId: { type: String },
    bookmarkedMaterials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Material' }],
    // Referral
    referredBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    referralCode: { type: String, unique: true, sparse: true },
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (entered) {
    return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
