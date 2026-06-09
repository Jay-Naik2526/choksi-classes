const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const generateOTP = require('../utils/generateOTP');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role)
            return res.status(400).json({ message: 'All fields required' });

        const user = await User.findOne({ email, role });
        if (!user || !(await user.matchPassword(password)))
            return res.status(401).json({ message: 'Invalid credentials' });

        if (!user.isActive)
            return res.status(403).json({ message: 'Account deactivated' });

        const token = signToken(user._id);
        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'No account with that email' });

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await user.save({ validateBeforeSave: false });

        await sendEmail({
            to: email,
            subject: 'Choksi Classes - Password Reset OTP',
            html: `
        <div style="font-family:sans-serif;max-width:400px;margin:auto">
          <h2 style="color:#C1440E">Choksi Classes</h2>
          <p>Your OTP for password reset:</p>
          <h1 style="letter-spacing:8px;color:#2C1810">${otp}</h1>
          <p style="color:#999">Valid for 10 minutes. Do not share.</p>
        </div>
      `,
        });

        res.json({ message: 'OTP sent to email' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        const user = await User.findOne({
            email,
            otp,
            otpExpiry: { $gt: Date.now() },
        });
        if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

        user.password = password;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @GET /api/auth/me
exports.getMe = async (req, res) => {
    res.json({ user: req.user });
};

// @PATCH /api/auth/change-password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword)
            return res.status(400).json({ message: 'Both fields required' });
        if (newPassword.length < 6)
            return res.status(400).json({ message: 'New password must be at least 6 characters' });

        const user = await User.findById(req.user._id);
        if (!(await user.matchPassword(currentPassword)))
            return res.status(400).json({ message: 'Current password is incorrect' });

        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};