import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, MessageSquare, Zap, Clock, RefreshCw } from 'lucide-react';
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

        const result = await signup({
            fullName: formData.name,
            email: formData.email,
            password: formData.password,
        });
        if (result?.success) navigate('/login');
    };

    return (
        <div className="relative min-h-screen bg-canvas text-ink flex items-center justify-center p-3 min-[861px]:py-8 min-[861px]:px-6 font-sans select-none">

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
                                Create your account
                            </h2>
                            <p className="text-sm leading-[1.5] text-muted">
                                Get started today to enjoy premium messaging
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-[18px]">
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
                                    className="text-subtle hover:text-ink transition-colors duration-200 focus:outline-none cursor-pointer p-1 rounded-lg hover:bg-backdrop"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                                    className="text-subtle hover:text-ink transition-colors duration-200 focus:outline-none cursor-pointer p-1 rounded-lg hover:bg-backdrop"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            }
                        />

                        {/* Create Account CTA */}
                        <button
                            type="submit"
                            disabled={isSigningUp}
                            className="w-full h-[46px] mt-1 bg-primary hover:bg-primary-hover text-white font-semibold px-4 rounded-lg shadow-btn transition-all duration-200 hover:-translate-y-px active:translate-y-0 cursor-pointer focus:outline-none focus:shadow-focus text-[14.5px] text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
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
                    <div className="text-center mt-[26px]">
                        <p className="text-[13.5px] text-muted">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-bold text-primary hover:text-accent hover:underline transition-colors duration-200"
                            >
                                Log in
                            </Link>
                        </p>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
