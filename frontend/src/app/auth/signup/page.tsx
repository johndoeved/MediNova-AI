"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, Eye, EyeOff, Lock, Mail, User, ArrowRight, CheckCircle2, Phone } from "lucide-react";
import Link from "next/link";

const ROLES = [
  { id: "patient", emoji: "👤", title: "Patient", desc: "Access health records & consultations" },
  { id: "doctor", emoji: "🩺", title: "Doctor", desc: "Clinical decision support & patient management" },
  { id: "admin", emoji: "⚙️", title: "Administrator", desc: "Hospital operations & system management" },
] as const;

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"patient" | "doctor" | "admin">("patient");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);

    if (role === "patient") router.push("/dashboard/patient");
    else if (role === "doctor") router.push("/dashboard/doctor");
    else router.push("/dashboard/admin");
  };

  const pwStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColors = ["", "#ef4444", "#f59e0b", "#10b981"];
  const strengthLabels = ["", "Weak", "Fair", "Strong"];

  return (
    <div className="bg-glass-page min-h-screen flex items-center justify-center p-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => router.push("/")} className="inline-flex items-center gap-3 mb-5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>
              MediNova<span className="text-cyan-500"> AI</span>
            </span>
          </button>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>Create your account</h1>
          <p className="text-slate-500 text-sm font-medium">Join thousands of healthcare professionals</p>
        </div>

        <div className="glass-card-elevated p-8 shadow-xl" style={{ borderRadius: 28, background: "rgba(255, 255, 255, 0.7)" }}>

          {/* Role Selection */}
          <div className="mb-7">
            <label className="glass-label mb-2 block">I am a...</label>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    role === r.id
                      ? "bg-cyan-50 border-cyan-200 shadow-md shadow-cyan-100"
                      : "bg-white/50 border-slate-200 hover:border-slate-300 hover:bg-white/80 shadow-sm"
                  }`}
                >
                  <div className="text-2xl mb-2">{r.emoji}</div>
                  <div className={`text-sm font-bold mb-1 ${role === r.id ? "text-cyan-700" : "text-slate-700"}`} style={{ fontFamily: "Outfit, sans-serif" }}>{r.title}</div>
                  <div className={`text-[11px] leading-tight font-medium ${role === r.id ? "text-cyan-600/80" : "text-slate-500"}`}>{r.desc}</div>
                  {role === r.id && <CheckCircle2 className="w-4 h-4 text-cyan-500 mt-3" />}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Name */}
            <div>
              <label className="glass-label mb-2 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input type="text" value={form.name} onChange={update("name")} className="glass-input pl-11 shadow-sm font-medium text-slate-700" placeholder="Dr. Jane Smith" required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="glass-label mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input type="email" value={form.email} onChange={update("email")} className="glass-input pl-11 shadow-sm font-medium text-slate-700" placeholder="you@hospital.com" required />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="glass-label mb-2 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input type="tel" value={form.phone} onChange={update("phone")} className="glass-input pl-11 shadow-sm font-medium text-slate-700" placeholder="+1 (555) 000-0000" />
              </div>
            </div>

            {/* Password row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="glass-label mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={form.password}
                    onChange={update("password")}
                    className="glass-input pl-11 pr-10 shadow-sm font-medium text-slate-700"
                    placeholder="Create password"
                    required
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPwd ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {form.password && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(pwStrength / 3) * 100}%`, backgroundColor: strengthColors[pwStrength] }} />
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: strengthColors[pwStrength] }}>{strengthLabels[pwStrength]}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="glass-label mb-2 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={form.confirm}
                    onChange={update("confirm")}
                    className="glass-input pl-11 shadow-sm font-medium text-slate-700"
                    placeholder="Repeat password"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 shadow-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm shadow-md disabled:opacity-60 disabled:cursor-not-allowed mt-3"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating your account...</>
              ) : (
                <>Create MediNova Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs font-medium text-slate-500 mt-6">
            By signing up you agree to our{" "}
            <a href="#" className="text-cyan-600 font-bold hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-cyan-600 font-bold hover:underline">Privacy Policy</a>
          </p>
        </div>

        <p className="text-center text-sm font-medium text-slate-500 mt-8">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-cyan-600 font-bold hover:text-cyan-500 transition-colors">
            Sign in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
