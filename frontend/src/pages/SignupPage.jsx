import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, MessageSquare, Check, Shield, Zap } from 'lucide-react';
import InputField from '../components/InputField';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { signup, isSigningUp } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) return toast.error('Full Name is required');
        if (!formData.email.trim()) return toast.error('Email is required');
        if (!formData.password) return toast.error('Password is required');
        if (formData.password.length < 8)
            return toast.error('Password must be at least 8 characters');
        if (formData.password !== formData.confirmPassword)
            return toast.error('Passwords do not match');

        await signup({
            fullName: formData.name,
            email: formData.email,
            password: formData.password,
        });
        navigate('/login');
    };

    return (
        <div className="relative min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center overflow-hidden font-sans select-none">
            {/* Ambient Background Glows */}
            <div className="absolute top-[15%] left-[5%] w-[45%] h-[45%] rounded-full bg-blue-500/10 blur-[130px] animate-pulse duration-8000 pointer-events-none" />
            <div className="absolute bottom-[15%] right-[5%] w-[45%] h-[45%] rounded-full bg-purple-500/8 blur-[130px] animate-pulse duration-6000 pointer-events-none" />
            <div className="absolute top-[40%] right-[30%] w-[30%] h-[30%] rounded-full bg-indigo-500/5 blur-[120px] animate-pulse duration-7000 pointer-events-none" />

            {/* Radial Dot Grid Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.2px,transparent_1.2px)] bg-size-[24px_24px] opacity-35 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_20%,rgba(0,0,0,0.65)_100%)] pointer-events-none" />

            {/* Main Container */}
            <div
                className="w-full max-w-6xl h-[85vh] min-h-[600px] mx-auto px-6 md:px-14 py-12 md:py-14 flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-12 lg:gap-16 z-10 animate-fade-in opacity-0 bg-slate-950/50 backdrop-blur-2xl border border-slate-800/95 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.65),0_0_50px_rgba(59,130,246,0.06)] border-t-white/10 relative transition-all duration-500 hover:border-slate-700/50"
                style={{ animationFillMode: 'forwards' }}
            >
                {/* Left Section: Branding & Features (Hidden on mobile/tablet for centering card) */}
                <div
                    className="hidden lg:flex w-full lg:w-1/2 flex-col justify-center items-start text-left gap-8 animate-fade-in opacity-0"
                    style={{ animationFillMode: 'forwards' }}
                >
                    <div
                        className="flex items-center gap-3 mb-2 cursor-pointer group animate-fade-in-left opacity-0"
                        style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
                    >
                        <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:rotate-6 transition-transform duration-200">
                            <MessageSquare size={18} />
                        </div>
                        <span className="text-lg font-bold tracking-wider bg-linear-to-r from-slate-100 via-slate-200 to-slate-300 bg-clip-text text-transparent">
                            NexTalk
                        </span>
                    </div>

                    <div
                        className="space-y-4 animate-fade-in-left opacity-0"
                        style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
                    >
                        <h1 className="text-[32px] md:text-[43px] lg:text-[48px] font-extrabold tracking-tight leading-[1.1] text-white">
                            <span className="whitespace-nowrap">Connect Better.</span>
                            <br />
                            <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap">
                                Work Together.
                            </span>
                        </h1>
                        <p className="text-sm md:text-base text-slate-400 max-w-90 leading-relaxed">
                            Secure messaging, seamless collaboration, and real-time communication
                            built for modern teams.
                        </p>
                    </div>

                    {/* Premium Feature Information Cards */}
                    <div className="grid grid-cols-1 gap-4 mt-4 w-full max-w-md">
                        <div
                            className="flex items-start gap-4 p-5 rounded-2xl bg-slate-900/10 border border-slate-800/40 backdrop-blur-sm hover:bg-slate-900/30 hover:border-slate-700/60 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(59,130,246,0.06)] transition-all duration-200 group cursor-pointer animate-fade-in-left opacity-0"
                            style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
                        >
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] group-hover:border-blue-500/40 transition-all duration-200">
                                <MessageSquare size={20} />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                                    Real-Time Messaging
                                </h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Instant messaging with typing indicators and online presence.
                                </p>
                            </div>
                        </div>

                        <div
                            className="flex items-start gap-4 p-5 rounded-2xl bg-slate-900/10 border border-slate-800/40 backdrop-blur-sm hover:bg-slate-900/30 hover:border-slate-700/60 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(59,130,246,0.06)] transition-all duration-200 group cursor-pointer animate-fade-in-left opacity-0"
                            style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
                        >
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] group-hover:border-indigo-500/40 transition-all duration-200">
                                <Shield size={20} />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                                    End-to-End Encryption
                                </h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Enterprise-grade security for every conversation.
                                </p>
                            </div>
                        </div>

                        <div
                            className="flex items-start gap-4 p-5 rounded-2xl bg-slate-900/10 border border-slate-800/40 backdrop-blur-sm hover:bg-slate-900/30 hover:border-slate-700/60 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(59,130,246,0.06)] transition-all duration-200 group cursor-pointer animate-fade-in-left opacity-0"
                            style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}
                        >
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] group-hover:border-purple-500/40 transition-all duration-200">
                                <Zap size={20} />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                                    Lightning Fast
                                </h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Optimized for instant delivery and reliable communication.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div
                    className="w-full lg:w-125 flex flex-col justify-center animate-fade-in-right opacity-0 lg:border-l lg:border-slate-800/85 lg:pl-16"
                    style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}
                >
                    <div className="flex lg:hidden items-center justify-center gap-2.5 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                            <MessageSquare size={16} />
                        </div>
                        <span className="text-lg font-bold tracking-wider bg-linear-to-r from-slate-100 to-slate-200 bg-clip-text text-transparent">
                            NexTalk
                        </span>
                    </div>

                    <div className="text-center mb-10 space-y-3">
                        <h2 className="text-2xl font-bold bg-linear-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                            Create your account
                        </h2>
                        <p className="text-xs text-slate-400">
                            Get started today to enjoy premium messaging
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Input */}
                        <InputField
                            id="name"
                            name="name"
                            label="Full Name"
                            placeholder="John Doe"
                            required
                            icon={User}
                            value={formData.name}
                            onChange={handleChange}
                            autoComplete="name"
                        />

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
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                            rightElement={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex="-1"
                                    className="text-slate-500 hover:text-slate-200 transition-colors duration-200 focus:outline-none cursor-pointer p-1 rounded-lg hover:bg-slate-800/40"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            }
                        />

                        {/* Confirm Password Input */}
                        <InputField
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            label="Confirm Password"
                            placeholder="••••••••"
                            required
                            icon={Lock}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            autoComplete="new-password"
                            rightElement={
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    tabIndex="-1"
                                    className="text-slate-500 hover:text-slate-200 transition-colors duration-200 focus:outline-none cursor-pointer p-1 rounded-lg hover:bg-slate-800/40"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            }
                        />

                        {/* Create Account CTA */}
                        <button
                            type="submit"
                            disabled={isSigningUp}
                            className="w-full mt-8 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:brightness-110 text-white font-semibold py-3 px-4 rounded-xl shadow-[0_4px_20px_rgba(59,130,246,0.2)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.4)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.96] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:translate-y-0"
                        >
                            {isSigningUp ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                    Loading...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Login Redirect */}
                    <div className="text-center mt-10">
                        <p className="text-xs text-slate-400">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200"
                            >
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
