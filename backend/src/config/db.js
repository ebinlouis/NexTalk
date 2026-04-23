import mongoose from 'mongoose';
import { ENV } from '../lib/env.js';

export const connectDB = async () => {
    try {
        const con = await mongoose.connect(ENV.MONGO_URL);
        console.log(`MongoDB Connected`);
    } catch (error) {
        console.error(`DB Connection Error: ${error.message}`);
    }
};
