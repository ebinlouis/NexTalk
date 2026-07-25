import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/Routes';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';

function App() {
    const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

    useEffect(() => {
        setTimeout(() => {
            checkAuth();
        }, 6000);
    }, [checkAuth]);

    if (isCheckingAuth && !authUser) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-950">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <AppRoutes />
            <Toaster position="top-center" reverseOrder={false} />
        </BrowserRouter>
    );
}

export default App;
