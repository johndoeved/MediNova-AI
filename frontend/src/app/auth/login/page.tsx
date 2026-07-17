"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"patient" | "doctor" | "admin">("patient");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError("");
    setLoading(true);

    // Simulated auth — replace with real API call
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);

    // Route based on role
    if (role === "patient") router.push("/dashboard/patient");
    else if (role === "doctor") router.push("/dashboard/doctor");
    else router.push("/dashboard/admin");
  };

  return (
    <div className="bg-glass-page min-h-screen flex items-center justify-center p-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => router.push("/")} className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>
              MediNova<span className="text-cyan-500"> AI</span>
            </span>
          </button>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>Welcome back</h1>
          <p className="text-slate-500 text-sm font-medium">Sign in to your clinical workspace</p>
        </div>

        {/* Card */}
        <div className="glass-card-elevated p-8 shadow-xl" style={{ borderRadius: 28, background: "rgba(255, 255, 255, 0.7)" }}>

          {/* Role selector */}
          <div className="mb-6">
            <label className="glass-label mb-2 block">Select Your Role</label>
            <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl border border-slate-200 bg-slate-50/50 shadow-inner">
              {(["patient", "doctor", "admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold capitalize transition-all shadow-sm ${
                    role === r
                      ? "bg-white border border-slate-200 text-cyan-600"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 border border-transparent"
                  }`}
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  {r === "patient" ? "👤 Patient" : r === "doctor" ? "🩺 Doctor" : "⚙️ Admin"}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="glass-label mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input pl-11 shadow-sm font-medium text-slate-700"
                  placeholder="you@hospital.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="glass-label mb-0">Password</label>
                <a href="#" className="text-xs font-bold text-cyan-600 hover:text-cyan-500 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input pl-11 pr-12 shadow-sm font-medium text-slate-700"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 shadow-sm">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm shadow-md mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to MediNova AI
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">or continue with</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Social / Demo login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="btn-secondary py-3 text-xs font-bold justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-cyan-500" /> Demo Patient
            </button>
            <button className="btn-secondary py-3 text-xs font-bold justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-500" /> Demo Doctor
            </button>
          </div>
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm font-medium text-slate-500 mt-8">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-cyan-600 font-bold hover:text-cyan-500 transition-colors">
            Create one now
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
