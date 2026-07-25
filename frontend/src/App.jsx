import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/Routes';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';
import GlobalLoader from './components/GlobalLoader';

function App() {
    const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isCheckingAuth && !authUser) {
        return <GlobalLoader />;
    }

    return (
        <BrowserRouter>
            <AppRoutes />
            <Toaster position="top-center" reverseOrder={false} />
        </BrowserRouter>
    );
}

export default App;
