import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from '../pages/SignupPage';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<SignupPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="*" element={<Navigate to="/signup" replace />} />
        </Routes>
    );
}
