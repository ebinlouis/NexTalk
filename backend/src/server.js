import express from 'express';
import { ENV } from './lib/env.js';

const app = express();
const PORT = ENV.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on the port : ${PORT}`);
});
