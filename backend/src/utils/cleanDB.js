const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Batch = require('../models/Batch');
const Test = require('../models/Test');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const Homework = require('../models/Homework');
const Material = require('../models/Material');
const Notice = require('../models/Notice');
const Fee = require('../models/Fee');
const Doubt = require('../models/Doubt');
const PushSubscription = require('../models/PushSubscription');

dotenv.config({ path: './.env' });

if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env');
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('🔌 Connected to MongoDB. Starting database cleanup...');

        // 1. Delete all transactional data
        await Attempt.deleteMany({});
        console.log('✓ Cleared all Test Attempts (Attempt)');

        await Test.deleteMany({});
        console.log('✓ Cleared all Tests (Test)');

        await Question.deleteMany({});
        console.log('✓ Cleared all Questions (Question)');

        await Homework.deleteMany({});
        console.log('✓ Cleared all Homework (Homework)');

        await Material.deleteMany({});
        console.log('✓ Cleared all Materials (Material)');

        await Notice.deleteMany({});
        console.log('✓ Cleared all Notices (Notice)');

        await Fee.deleteMany({});
        console.log('✓ Cleared all Fees (Fee)');

        await Doubt.deleteMany({});
        console.log('✓ Cleared all Doubts (Doubt)');

        await PushSubscription.deleteMany({});
        console.log('✓ Cleared all Push Subscriptions');

        await Batch.deleteMany({});
        console.log('✓ Cleared all Batches (Batch)');

        // 2. Reset user-related batch assignments and bookmarks (preserving the accounts)
        const updateResult = await User.updateMany(
            {},
            { 
                $set: { 
                    batchIds: [], 
                    bookmarkedMaterials: [],
                    otp: undefined,
                    otpExpiry: undefined
                } 
            }
        );
        console.log(`✓ Reset batch associations and bookmarks for ${updateResult.modifiedCount} user accounts.`);

        console.log('\n🎉 DATABASE CLEANUP COMPLETED! All test data wiped, user accounts preserved.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Connection error:', err);
        process.exit(1);
    });
