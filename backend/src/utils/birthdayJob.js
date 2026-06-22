const cron = require('node-cron');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const escapeHtml = require('../utils/escapeHtml');
const { sendPushToUser, sendPushToMany } = require('../utils/pushNotifications');

const TZ = 'Asia/Kolkata';

const birthdayEmail = (name) => `
<div style="font-family:sans-serif;max-width:480px;margin:auto">
  <div style="background:linear-gradient(135deg,#C1440E,#E8A020);padding:28px;text-align:center;border-radius:14px 14px 0 0">
    <div style="font-size:40px">🎂</div>
    <h2 style="color:#fff;margin:8px 0 0;font-family:Georgia,serif">Happy Birthday, ${escapeHtml(name)}!</h2>
  </div>
  <div style="background:#fff;padding:24px;border-radius:0 0 14px 14px;border:1px solid #eee;text-align:center">
    <p style="color:#2C1810;font-size:15px">Wishing you a wonderful year ahead filled with success and joy.</p>
    <p style="color:#888;font-size:13px;margin-top:14px">— With warm wishes from everyone at <strong>Choksi Classes</strong></p>
  </div>
</div>`;

// Find today's birthday students (IST), greet them, and notify Sir. Idempotent per year.
const runBirthdayGreetings = async () => {
    try {
        const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: TZ }));
        const month = nowIST.getMonth() + 1;
        const day   = nowIST.getDate();
        const year  = nowIST.getFullYear();

        const candidates = await User.aggregate([
            { $match: { role: 'student', isActive: true, dateOfBirth: { $ne: null } } },
            { $addFields: {
                _m: { $month:      { date: '$dateOfBirth', timezone: TZ } },
                _d: { $dayOfMonth: { date: '$dateOfBirth', timezone: TZ } },
            }},
            { $match: { _m: month, _d: day } },
        ]);

        // Skip anyone already greeted this calendar year
        const toGreet = candidates.filter(s => s.lastBirthdayGreetYear !== year);
        if (toGreet.length === 0) return { greeted: 0, names: [] };

        for (const s of toGreet) {
            // Await sends so they reliably complete before the HTTP trigger responds
            await sendPushToUser(s._id, {
                title: '🎂 Happy Birthday!',
                body: `Wishing you a wonderful year ahead, ${s.name?.split(' ')[0] || 'champion'}!`,
                url: '/dashboard',
            }).catch(() => {});

            if (s.email) {
                await sendEmail({
                    to: s.email,
                    subject: '🎂 Happy Birthday from Choksi Classes!',
                    html: birthdayEmail(s.name || 'Student'),
                }).catch(() => {});
            }

            await User.updateOne({ _id: s._id }, { $set: { lastBirthdayGreetYear: year } });
        }

        // Let the teachers know whose birthday it is today
        const names = toGreet.map(s => s.name).filter(Boolean);
        const sirs = await User.find({ role: 'sir', isActive: true }).select('_id').lean();
        if (sirs.length && names.length) {
            await sendPushToMany(sirs.map(s => s._id), {
                title: '🎂 Birthday today',
                body: `It's ${names.join(', ')}'s birthday today. Wish them!`,
                url: '/students',
            }).catch(() => {});
        }

        console.log(`✓ Sent ${toGreet.length} birthday greeting(s).`);
        return { greeted: toGreet.length, names };
    } catch (err) {
        console.error('Birthday job failed:', err.message);
        return { greeted: 0, names: [], error: err.message };
    }
};

// Schedule daily at 08:00 IST
const scheduleBirthdayJob = () => {
    cron.schedule('0 8 * * *', runBirthdayGreetings, { timezone: TZ });
    console.log('✓ Birthday greeting job scheduled (08:00 IST daily).');
};

module.exports = { runBirthdayGreetings, scheduleBirthdayJob };
