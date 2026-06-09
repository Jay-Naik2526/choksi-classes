const { google } = require('googleapis');
const { Readable } = require('stream');

const getAuth = () => {
    const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'urn:ietf:wg:oauth:2.0:oob'
    );
    oAuth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
    return oAuth2Client;
};

const uploadToDrive = async (file) => {
    const auth = getAuth();
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
        name: `${Date.now()}_${file.originalname}`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const stream = Readable.from(file.buffer);
    const media = { mimeType: file.mimetype, body: stream };

    const response = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id, webViewLink, webContentLink, name',
    });

    await drive.permissions.create({
        fileId: response.data.id,
        requestBody: { role: 'reader', type: 'anyone' },
    });

    return {
        fileId: response.data.id,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink,
        directUrl: `https://drive.google.com/uc?export=view&id=${response.data.id}`,
        name: response.data.name,
    };
};

const deleteFromDrive = async (fileId) => {
    try {
        const auth = getAuth();
        const drive = google.drive({ version: 'v3', auth });
        await drive.files.delete({ fileId });
    } catch (err) {
        console.error('Drive delete error:', err.message);
    }
};

module.exports = { uploadToDrive, deleteFromDrive };
