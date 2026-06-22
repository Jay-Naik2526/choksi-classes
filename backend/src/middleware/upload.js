const multer = require('multer');

const MB = 1024 * 1024;

// Allow-listed MIME types. Anything not on the list is rejected before it
// ever reaches Google Drive, so users can't smuggle scripts/HTML/executables.
const IMAGE_TYPES = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif',
];
const DOC_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
];

const makeUploader = (allowed, maxMB) => multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxMB * MB },
    fileFilter: (req, file, cb) => {
        if (allowed.includes(file.mimetype)) return cb(null, true);
        const err = new Error('Unsupported file type. Please upload an allowed format.');
        err.status = 400;
        cb(err);
    },
});

module.exports = {
    // Photos only — profile pictures, doubt screenshots
    imageUpload:    makeUploader(IMAGE_TYPES, 10),
    // Study materials — images + documents, larger cap
    materialUpload: makeUploader([...IMAGE_TYPES, ...DOC_TYPES], 50),
    // Homework submissions — images + documents
    homeworkUpload: makeUploader([...IMAGE_TYPES, ...DOC_TYPES], 10),
};
