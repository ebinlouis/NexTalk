import React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, MessageSquare, Check } from 'lucide-react';
import InputField from '../components/InputField';

export default function SignupPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center overflow-hidden font-sans select-none">
      
      {/* Decorative Sophisticated Animated Gradient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] animate-pulse duration-8000" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/15 blur-[120px] animate-pulse duration-6000" />
      <div className="absolute top-[40%] right-[20%] w-[35%] h-[35%] rounded-full bg-sky-900/10 blur-[100px] animate-pulse duration-7000" />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),rgba(255,255,255,0))] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 z-10 animate-fade-in-up">
        
        {/* Left Section: Branding & Product Features */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
          <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-2xl backdrop-blur-md shadow-lg shadow-black/20 hover:scale-105 transition-transform duration-300">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <MessageSquare size={22} />
            </div>
            <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-indigo-200 to-indigo-100 bg-clip-text text-transparent">
              NexTalk
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Conversations that<br />
              <span className="bg-gradient-to-r from-indigo-400 to-blue-300 bg-clip-text text-transparent">
                move faster.
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-400 max-w-md leading-relaxed">
              Experience lightning-fast communication, end-to-end reliability, and a sleek modern collaborative workspace engineered for modern teams.
            </p>
          </div>

          {/* Product-Focused Trust Checkmarks */}
          <div className="hidden lg:flex flex-col gap-3 mt-8 p-5 bg-slate-900/30 border border-slate-800/20 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <Check size={12} />
              </div>
              <span>Real-time Messaging</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <Check size={12} />
              </div>
              <span>End-to-End Secure</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <Check size={12} />
              </div>
              <span>Lightning Fast Delivery</span>
            </div>
          </div>
        </div>

        {/* Right Section: Glassmorphism Card */}
        <div className="w-full lg:w-[480px]">
          <div className="w-full bg-slate-900/40 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 md:p-8 shadow-[0_0_40px_rgba(79,70,229,0.15)] relative group/card transition-all duration-500 hover:border-indigo-500/30">
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                Create your account
              </h2>
              <p className="text-xs text-slate-400 mt-1.5">
                Get started today to enjoy premium messaging
              </p>
            </div>

            <form className="space-y-5">
              
              {/* Name Input */}
              <InputField
                id="name"
                name="name"
                label="Full Name"
                placeholder="John Doe"
                required
                icon={User}
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
              />

              {/* Password Input */}
              <InputField
                id="password"
                name="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                required
                icon={Lock}
                rightElement={
                  <div className="text-slate-500 hover:text-slate-300 transition-colors pointer-events-none">
                    <Eye size={16} />
                  </div>
                }
              />

              {/* Confirm Password Input */}
              <InputField
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="••••••••"
                required
                icon={Lock}
                rightElement={
                  <div className="text-slate-500 hover:text-slate-300 transition-colors pointer-events-none">
                    <Eye size={16} />
                  </div>
                }
              />

              {/* Create Account CTA */}
              <button
                type="button"
                className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-500/30 text-sm md:text-base text-center"
              >
                Create Account
              </button>
            </form>

            {/* Login Redirect */}
            <div className="text-center mt-6">
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
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
