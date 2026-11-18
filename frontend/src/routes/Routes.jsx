import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from '../pages/SignupPage';
import LoginPage from '../pages/LoginPage';
import ChatPage from '../pages/ChatPage';
import { useAuthStore } from '../store/useAuthStore';

export default function AppRoutes() {
    const { authUser } = useAuthStore();

    return (
        <Routes>
            <Route path="/" element={authUser ? <ChatPage /> : <Navigate to="/login" replace />} />
            <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to="/" replace />} />
            <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to={authUser ? '/' : '/login'} replace />} />
        </Routes>
    );
}
