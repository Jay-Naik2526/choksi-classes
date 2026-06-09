const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Not authorized' });
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ message: 'User account no longer exists' });
        }
        
        if (!user.isActive) {
            return res.status(403).json({ message: 'Access denied: Account deactivated' });
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
        return res.status(403).json({ message: 'Access denied' });
    next();
};

module.exports = { protect, authorize };