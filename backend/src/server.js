import app from './app.js';
import { ENV } from './lib/env.js';
import { connectDB } from './config/db.js';

const PORT = ENV.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on the port : ${PORT}`);
    connectDB();
});
