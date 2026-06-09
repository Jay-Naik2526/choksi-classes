const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    await User.deleteMany({});

    await User.create([
        {
            name: 'Sir Choksi',
            email: 'sir@choksi.com',
            password: 'Test@1234',
            role: 'sir',
            phone: '9374488770',
        },
        {
            name: 'Jay Naik',
            email: 'student@choksi.com',
            password: 'Test@1234',
            role: 'student',
            phone: '9374488770',
        },
        {
            name: 'Parent Naik',
            email: 'parent@choksi.com',
            password: 'Test@1234',
            role: 'parent',
            phone: '9374488770',
        },
    ]);

    console.log('Seeded successfully');
    process.exit();
}).catch((err) => {
    console.error(err);
    process.exit(1);
});