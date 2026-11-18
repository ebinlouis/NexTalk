import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, MessageSquare, Zap, Clock, RefreshCw } from 'lucide-react';
import InputField from '../components/InputField';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const navigation = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoggingIn } = useAuthStore();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email.trim()) return toast.error('Email is required');
        if (!formData.password) return toast.error('Password is required');

        const result = await login(formData);
        if (result?.success) navigation('/');
    };

    return (
        <div className="relative min-h-screen bg-canvas text-ink flex items-center justify-center p-3 min-[861px]:py-8 min-[861px]:px-6 font-sans">

            {/* Main Container */}
            <div
                className="w-full max-w-[960px] min-[1025px]:max-w-[1160px] min-h-[700px] bg-white rounded-lg min-[861px]:rounded-[14px] shadow-card grid grid-cols-1 min-[861px]:grid-cols-2 min-[1025px]:grid-cols-[1fr_1.05fr] overflow-hidden animate-fade-in opacity-0"
                style={{ animationFillMode: 'forwards' }}
            >
                {/* Left Section: Branding & Features */}
                <div
                    className="flex order-2 relative overflow-hidden bg-linear-to-br from-primary to-primary-dark py-9 px-5 min-[481px]:py-11 min-[481px]:px-7 min-[861px]:py-11 min-[861px]:px-12 min-[1025px]:py-[60px] min-[1025px]:px-[68px] flex-col justify-between items-start text-left gap-9 animate-fade-in opacity-0"
                    style={{
                        animationFillMode: 'forwards',
                        backgroundImage:
                            'radial-gradient(circle at 65% 22%, rgba(45,212,191,0.2), transparent 40%), linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                    }}
                >
                    <div className="pt-2.5">
                        <h2 className="text-[28px] min-[861px]:text-[32px] min-[1025px]:text-[38px] font-bold leading-[1.2] tracking-[-0.03em] text-white max-w-[440px] mb-[34px]">
                            Where every conversation feels effortless.
                        </h2>
                        <div className="max-w-[450px]">
                            <span className="block text-[36px] leading-none text-accent-mint mb-2" style={{ fontFamily: 'Georgia, serif' }}>“</span>
                            <blockquote className="text-[15.5px] leading-[1.6] text-[#E2E8F0] mb-6">
                                Built for seamless real-time messaging, instant file sharing, and
                                distraction-free communication—wherever you are.
                            </blockquote>
                            <div className="flex items-center gap-3.5">
                                <div className="relative">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/25 bg-white/15 text-sm font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                                        AR
                                    </div>
                                    <span className="absolute bottom-0 right-0 h-[13px] w-[13px] rounded-full border-[2.5px] border-primary bg-success shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-white">Alex Rivera</h3>
                                    <p className="text-[13px] font-medium text-[#A7F3D0]">Active now in #general</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full mt-auto">
                        <div className="flex items-center gap-3 text-[11px] font-bold tracking-[0.12em] text-subtle mb-3.5">
                            POWERED BY MODERN TECH <span className="h-px flex-1 bg-white/10" />
                        </div>
                        <div className="grid grid-cols-2 gap-2.5 max-[480px]:gap-2">
                            {[[Zap, 'WebSockets'], [Lock, 'End-to-End Encrypted'], [Clock, 'Low Latency'], [RefreshCw, 'Multi-Device Sync']].map(([Icon, label]) => (
                                <div key={label} className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/4 backdrop-blur-sm py-[9px] px-3 text-xs font-medium tracking-[-0.01em] text-white/82">
                                    <Icon size={15} className="text-accent-mint shrink-0" /> {label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div
                    className="w-full min-[861px]:order-1 flex flex-col justify-center py-9 px-5 min-[481px]:py-11 min-[481px]:px-7 min-[861px]:py-11 min-[861px]:px-12 min-[1025px]:py-14 min-[1025px]:px-16 animate-fade-in-right opacity-0"
                    style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}
                >
                    <div className="w-full max-w-[390px] mx-auto">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-[38px] h-[38px] rounded-lg bg-primary flex items-center justify-center text-white shadow-[0_2px_8px_rgba(10,50,52,0.25)]">
                                <MessageSquare size={20} />
                            </div>
                            <span className="text-[19px] font-bold tracking-[-0.025em] text-primary">
                                NexTalk
                            </span>
                        </div>

                        <div className="text-left mb-[30px]">
                            <h2 className="text-2xl min-[481px]:text-[28px] font-bold leading-[1.2] tracking-[-0.03em] text-ink mb-2">
                                Welcome back!
                            </h2>
                            <p className="text-sm leading-[1.5] text-muted">
                                Log in to catch up with your friends, groups, and conversations.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} method="POST" className="space-y-[18px]">
                        {/* Email Input */}
                        <InputField
                            id="email"
                            name="email"
                            type="email"
                            label="Email Address"
                            placeholder="john@example.com"
                            required
                            icon={Mail}
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="username"
                        />

                        {/* Password Input */}
                        <InputField
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            label="Password"
                            placeholder="••••••••"
                            required
                            icon={Lock}
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                            rightElement={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex="-1"
                                    className="text-subtle hover:text-ink transition-colors duration-200 focus:outline-none cursor-pointer p-1 rounded-lg hover:bg-backdrop"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            }
                        />

                        <div className="flex justify-end -mt-3">
                            <button type="button" className="text-[12.5px] font-semibold text-primary hover:text-accent hover:underline transition-colors cursor-pointer">
                                Forgot password?
                            </button>
                        </div>

                        {/* Log In CTA */}
                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="w-full h-[46px] mt-1 bg-primary hover:bg-primary-hover text-white font-semibold px-4 rounded-lg shadow-btn transition-all duration-200 hover:-translate-y-px active:translate-y-0 cursor-pointer focus:outline-none focus:shadow-focus text-[14.5px] text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                        >
                            {isLoggingIn ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                    Loading...
                                </span>
                            ) : (
                                'Log In'
                            )}
                        </button>
                        <div className="flex items-center gap-3.5 my-1 text-[11.5px] font-semibold tracking-[0.05em] text-subtle">
                            <span className="h-px flex-1 bg-line" /> OR <span className="h-px flex-1 bg-line" />
                        </div>
                        <div className="space-y-2.5">
                            <button type="button" className="flex w-full h-[46px] items-center justify-center gap-2.5 rounded-lg border-[1.5px] border-line bg-white text-[13.5px] font-semibold text-ink-slate hover:bg-canvas hover:border-line-hover transition-colors cursor-pointer">
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                                </svg>
                                Continue with Google
                            </button>
                            <button type="button" className="flex w-full h-[46px] items-center justify-center gap-2.5 rounded-lg border-[1.5px] border-line bg-white text-[13.5px] font-semibold text-ink-slate hover:bg-canvas hover:border-line-hover transition-colors cursor-pointer">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8.92-2.85-.9.04-2 .6-2.65 1.35-.58.67-1.09 1.74-.95 2.77 1.01.08 2.05-.51 2.68-1.27Z" />
                                </svg>
                                Continue with Apple
                            </button>
                        </div>
                    </form>

                    {/* Signup Redirect */}
                    <div className="text-center mt-[26px]">
                        <p className="text-[13.5px] text-muted">
                            Don't have an account?{' '}
                            <Link
                                to="/signup"
                                className="font-bold text-primary hover:text-accent hover:underline transition-colors duration-200"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
