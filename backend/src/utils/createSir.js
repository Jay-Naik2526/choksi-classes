const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: './.env' });

if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env');
    process.exit(1);
}

// Read CLI arguments
const args = process.argv.slice(2);
if (args.length < 3) {
    console.log('\nUsage: node src/utils/createSir.js "<Name>" "<Email>" "<Password>" [Phone]\n');
    console.log('Example: node src/utils/createSir.js "Sir Naik" "sir.naik@choksi.com" "SecurePass123" "9876543210"\n');
    process.exit(1);
}

const [name, email, password, phone] = args;

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const exists = await User.findOne({ email });
        if (exists) {
            console.error(`\n❌ Error: A user with email "${email}" already exists!`);
            process.exit(1);
        }

        const sir = await User.create({
            name,
            email,
            password,
            phone: phone || '',
            role: 'sir',
            isActive: true,
        });

        console.log(`\n🎉 SUCCESS! New Sir/Teacher (Admin) account created:`);
        console.log(`- Name:  ${sir.name}`);
        console.log(`- Email: ${sir.email}`);
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Database connection error:', err);
        process.exit(1);
    });
