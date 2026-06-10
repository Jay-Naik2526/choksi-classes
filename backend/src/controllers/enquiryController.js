const Enquiry = require('../models/Enquiry');

/* ── POST /api/enquiry  (public) ──────────────────────────────────────────
   Save the submission to DB. No email — Sir sees it in the portal. */
exports.submitEnquiry = async (req, res) => {
    try {
        const { parentName, childName, className, board, phone, message } = req.body;
        if (!parentName || !phone)
            return res.status(400).json({ message: 'Parent name and phone number are required.' });

        await Enquiry.create({ parentName, childName, className, board, phone, message });

        res.json({ message: 'Enquiry sent successfully! We will contact you within 24 hours.' });
    } catch (err) {
        console.error('Enquiry error:', err.message);
        res.status(500).json({ message: 'Could not save enquiry. Please call us directly.' });
    }
};

/* ── GET /api/enquiry  (sir only) ─────────────────────────────────────── */
exports.listEnquiries = async (req, res) => {
    try {
        const { status } = req.query;          // optional filter
        const filter = status && status !== 'all' ? { status } : {};
        const enquiries = await Enquiry.find(filter).sort({ createdAt: -1 });
        const newCount  = await Enquiry.countDocuments({ status: 'new' });
        res.json({ enquiries, newCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ── PATCH /api/enquiry/:id  (sir only) ────────────────────────────────── */
exports.updateEnquiry = async (req, res) => {
    try {
        const { status, note } = req.body;
        const update = {};
        if (status) update.status = status;
        if (note !== undefined) update.note = note;
        const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
        res.json({ enquiry });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ── DELETE /api/enquiry/:id  (sir only) ────────────────────────────────── */
exports.deleteEnquiry = async (req, res) => {
    try {
        await Enquiry.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
