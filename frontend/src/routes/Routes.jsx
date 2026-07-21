import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from '../pages/SignupPage';
import LoginPage from '../pages/LoginPage';
import ChatPage from '../pages/ChatPage';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
