const webpush = require('web-push');

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:dipchoksi@hotmail.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

/**
 * Send a push notification to a single user by their userId.
 * Silently fails if no subscription found or VAPID keys missing.
 */
const sendPushToUser = async (userId, { title = 'Choksi Classes', body = '', url = '/' } = {}) => {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;
    try {
        const PushSub = require('../models/PushSubscription');
        const record = await PushSub.findOne({ userId });
        if (!record) return;
        await webpush.sendNotification(
            record.subscription,
            JSON.stringify({ title, body, icon: '/favicon.svg', badge: '/favicon.svg', data: { url } })
        );
    } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
            // expired subscription — clean up
            try {
                const PushSub = require('../models/PushSubscription');
                await PushSub.deleteOne({ userId });
            } catch (_) {}
        }
    }
};

/**
 * Send push to multiple users.
 */
const sendPushToMany = async (userIds, payload) => {
    await Promise.allSettled(userIds.map(uid => sendPushToUser(uid, payload)));
};

module.exports = { sendPushToUser, sendPushToMany };
