const PushSub = require('../models/PushSubscription');

// GET /api/push/vapid-key  (public)
exports.getPublicKey = (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || '' });
};

// POST /api/push/subscribe  (auth)
exports.subscribe = async (req, res) => {
    try {
        const { subscription } = req.body;
        if (!subscription?.endpoint) return res.status(400).json({ message: 'Invalid subscription' });

        await PushSub.findOneAndUpdate(
            { userId: req.user._id },
            { userId: req.user._id, subscription },
            { upsert: true, new: true }
        );
        res.json({ message: 'Subscribed to push notifications' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/push/unsubscribe  (auth)
exports.unsubscribe = async (req, res) => {
    try {
        await PushSub.deleteOne({ userId: req.user._id });
        res.json({ message: 'Unsubscribed' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
