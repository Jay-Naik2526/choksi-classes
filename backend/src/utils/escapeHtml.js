// Escape user-supplied text before interpolating it into HTML email bodies.
// Prevents HTML/script injection and email-client phishing via crafted input
// (e.g. a doubt question containing markup, or a name with tags).
const escapeHtml = (value) => {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

module.exports = escapeHtml;
