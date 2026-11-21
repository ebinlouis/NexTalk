import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('backend/.env') });

const mongoUri = process.env.MONGO_URL;
if (!mongoUri) {
    console.error('Error: MONGO_URL not found in backend/.env');
    process.exit(1);
}

try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Dropping database...');
    await mongoose.connection.db.dropDatabase();
    console.log('Database dropped successfully! Clean slate ready.');
    await mongoose.disconnect();
    process.exit(0);
} catch (error) {
    console.error('Failed to drop database:', error.message);
    process.exit(1);
}
