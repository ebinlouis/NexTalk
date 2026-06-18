import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Render Signup directly on both root and /signup paths */}
        <Route path="/" element={<SignupPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Fallback route - Render Signup directly as default */}
        <Route path="*" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
