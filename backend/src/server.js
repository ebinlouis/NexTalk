import express from 'express';
import cookieParser from 'cookie-parser';
import { ENV } from './lib/env.js';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.route.js';

const app = express();
const PORT = ENV.PORT;

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on the port : ${PORT}`);
    connectDB();
});
