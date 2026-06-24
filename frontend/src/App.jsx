import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/Routes';
import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
            <Toaster position="top-center" reverseOrder={false} />
        </BrowserRouter>
    );
}

export default App;
