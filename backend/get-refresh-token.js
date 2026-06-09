/**
 * Run this ONCE to get your Google OAuth2 refresh token.
 * Usage: node get-refresh-token.js
 *
 * After running, paste the refresh token into your .env as GOOGLE_REFRESH_TOKEN
 */
require('dotenv').config();
const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.log('\n❌ Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env first, then re-run.\n');
    process.exit(1);
}

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob'
);

const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/drive'],
});

console.log('\n1. Open this URL in your browser:\n');
console.log(authUrl);
console.log('\n2. Sign in with jaymacbook2526@gmail.com (the Drive owner account)');
console.log('3. Allow access → copy the code shown\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Paste the code here: ', async (code) => {
    rl.close();
    try {
        const { tokens } = await oAuth2Client.getToken(code.trim());
        console.log('\n✅ SUCCESS! Add this to your backend .env:\n');
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log('\nThen restart the backend.\n');
    } catch (err) {
        console.error('\n❌ Error:', err.message, '\n');
    }
});
