const sendEmail = require('../utils/sendEmail');

// POST /api/enquiry  (public — no auth)
exports.submitEnquiry = async (req, res) => {
    try {
        const { parentName, childName, className, board, phone, message } = req.body;
        if (!parentName || !phone)
            return res.status(400).json({ message: 'Parent name and phone number are required.' });

        const rows = [
            ['Parent Name',  parentName],
            ["Child's Name", childName  || '—'],
            ['Class',        className  || '—'],
            ['Board',        board      || '—'],
            ['Phone',        phone],
            ['Message',      message    || '—'],
        ];

        const tableRows = rows.map(([k, v], i) => `
            <tr style="background:${i % 2 === 0 ? '#fff' : '#F5F0E8'}">
                <td style="padding:10px 14px;font-weight:600;color:#2C1810;width:140px;font-size:13px">${k}</td>
                <td style="padding:10px 14px;color:${k === 'Phone' ? '#C1440E' : '#555'};font-size:13px;font-weight:${k === 'Phone' ? '700' : '400'}">${v}</td>
            </tr>`).join('');

        const html = `
<div style="font-family:sans-serif;max-width:540px;margin:auto">
  <div style="background:#2C1810;padding:28px 24px;border-radius:12px 12px 0 0;text-align:center">
    <h2 style="color:#F5F0E8;margin:0;font-family:Georgia,serif;font-size:22px">Choksi Classes</h2>
    <p style="color:#E8A020;margin:6px 0 0;font-size:13px;letter-spacing:.05em">NEW ADMISSION ENQUIRY</p>
  </div>
  <div style="background:#fff;border-radius:0 0 12px 12px;border:1px solid #e8e0d5;border-top:none;overflow:hidden">
    <table style="width:100%;border-collapse:collapse">${tableRows}</table>
    <div style="padding:18px 14px;background:#FFF8F5;border-top:1px solid #f0e8e0">
      <p style="margin:0;color:#888;font-size:11px">Sent via Choksi Classes admissions form · ${new Date().toLocaleString('en-IN')}</p>
    </div>
  </div>
</div>`;

        // Send to both owners
        await sendEmail({
            to: 'dipchoksi@hotmail.com, kairavichoksi@yahoo.com',
            subject: `📋 New Enquiry — ${parentName} (${childName || 'Child'}, ${className || 'Std ?'}, ${board || 'Board ?'})`,
            html,
        });

        res.json({ message: 'Enquiry sent successfully! We will contact you within 24 hours.' });
    } catch (err) {
        console.error('Enquiry email error:', err.message);
        res.status(500).json({ message: 'Could not send enquiry. Please call us directly.' });
    }
};
