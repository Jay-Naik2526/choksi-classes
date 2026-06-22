const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const generateOTP = require('../utils/generateOTP');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role)
            return res.status(400).json({ message: 'All fields required' });

        // Look up by email only, verify password first, then check the selected role.
        // This lets us give a clear message when the wrong role tab is chosen,
        // without leaking whether the email exists (password check gates it).
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password)))
            return res.status(401).json({ message: 'Invalid credentials' });

        if (user.role !== role)
            return res.status(401).json({ message: `This account is registered as a ${user.role}. Please select the correct role.` });

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
        const genericMsg = { message: 'If an account exists for that email, an OTP has been sent.' };

        const user = await User.findOne({ email });
        // Always return the same response to avoid leaking which emails are registered.
        if (!user) return res.json(genericMsg);

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        user.otpAttempts = 0;                                   // reset guard for new OTP
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

        res.json(genericMsg);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        if (!email || !otp || !password)
            return res.status(400).json({ message: 'Email, OTP and new password are required' });
        if (password.length < 8)
            return res.status(400).json({ message: 'Password must be at least 8 characters' });

        // Match by email + unexpired OTP only, so we can throttle wrong guesses.
        const user = await User.findOne({ email, otpExpiry: { $gt: Date.now() } });
        if (!user || !user.otp)
            return res.status(400).json({ message: 'Invalid or expired OTP' });

        // Lock out after 5 wrong attempts on the same OTP
        if ((user.otpAttempts || 0) >= 5) {
            user.otp = undefined;
            user.otpExpiry = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(429).json({ message: 'Too many incorrect attempts. Please request a new OTP.' });
        }

        if (user.otp !== otp) {
            user.otpAttempts = (user.otpAttempts || 0) + 1;
            await user.save({ validateBeforeSave: false });
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.password = password;
        user.otp = undefined;
        user.otpExpiry = undefined;
        user.otpAttempts = 0;
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
        if (newPassword.length < 8)
            return res.status(400).json({ message: 'New password must be at least 8 characters' });

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