import http from 'http';
import app from './app.js';
import { initSocket } from './lib/socket.js';
import { ENV } from './lib/env.js';
import { connectDB } from './config/db.js';

const PORT = ENV.PORT;
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
    console.log(`Server is running on the port : ${PORT}`);
    connectDB();
});
