"use client";

import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Activity, Heart, Calendar, Brain, Shield, Upload, FileText,
  User, ChevronRight, TrendingUp, Sparkles, Info, CheckCircle2,
  AlertTriangle, Video, Settings, Bell, Search, Zap, Microscope,
  Pill, Stethoscope, Eye, ArrowRight, Star, Cpu, Lock, Globe,
} from "lucide-react";

const ThreeHeart = dynamic(() => import("@/components/ThreeHeart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-2 border-cyan-400/20 rounded-full animate-ping" />
        <div className="absolute inset-0 border-2 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    </div>
  ),
});

const FEATURES = [
  {
    icon: Brain,
    color: "cyan",
    title: "AI Clinical Decision Support",
    desc: "Evidence-based condition analysis with confidence scoring, red flag detection, and dynamic follow-up questioning.",
  },
  {
    icon: Eye,
    color: "purple",
    title: "Interactive 3D Anatomy Engine",
    desc: "Rotate, zoom, isolate and cross-section full human anatomy in real-time WebGL. Organs highlight to symptom input.",
  },
  {
    icon: Upload,
    color: "blue",
    title: "Medical Report OCR Analysis",
    desc: "Upload MRI, CT, blood work, or ECGs. AI parses findings, maps to patient history, and suggests next steps.",
  },
  {
    icon: Shield,
    color: "emerald",
    title: "End-to-End Security",
    desc: "HIPAA-compliant encrypted storage. Zero-trust architecture with role-based access for all clinical staff.",
  },
  {
    icon: Stethoscope,
    color: "rose",
    title: "Multi-Role Dashboards",
    desc: "Tailored workspaces for patients, clinicians, reception, labs, radiology, pharmacy, and admins.",
  },
  {
    icon: Zap,
    color: "amber",
    title: "Real-Time Monitoring",
    desc: "Live vitals, alerts, and emergency dispatch with automatic escalation and priority triaging.",
  },
];

const STATS = [
  { value: "98.7%", label: "Diagnostic Accuracy", icon: TrendingUp, color: "#10b981" },
  { value: "2.4s", label: "Avg. AI Response", icon: Zap, color: "#0ea5e9" },
  { value: "50+", label: "Organ Systems", icon: Eye, color: "#8b5cf6" },
  { value: "HIPAA", label: "Compliant & Secure", icon: Lock, color: "#3b82f6" },
];

const TABS = [
  { id: "patient", label: "Patient Portal", icon: User },
  { id: "clinical", label: "Clinician Suite", icon: Brain },
  { id: "ai", label: "AI Assistant", icon: Sparkles },
  { id: "emergency", label: "Emergency", icon: AlertTriangle },
];

type ChatMsg = { sender: "user" | "ai"; text: string };

const AI_RESPONSES: Record<string, { reply: string; organ: string }> = {
  head: { reply: "Headache/migraine patterns detected. Rate the pain 1-10. Do you have light sensitivity, neck stiffness, or visual disturbances?", organ: "Brain" },
  migraine: { reply: "Migraine indicators present. Is this throbbing/pulsing? Any aura (visual zigzags, numbness) before onset?", organ: "Brain" },
  chest: { reply: "⚠️ Chest symptoms require urgent triage. Is there tightness, pressure, or pain radiating to your left arm or jaw? Any shortness of breath?", organ: "Heart" },
  heart: { reply: "Cardiac symptom flag raised. Do you feel palpitations (racing/irregular heartbeat)? Any dizziness or fainting episodes?", organ: "Heart" },
  stomach: { reply: "GI/Abdominal symptoms noted. Is the pain localized or diffuse? Does it worsen after eating, and have you had any nausea or vomiting?", organ: "Digestive" },
  kidney: { reply: "Renal region pain noted. Is it a dull ache in your lower back/flank? Any changes in urine colour, frequency, or burning sensation?", organ: "Kidneys" },
  back: { reply: "Spinal/musculoskeletal symptoms noted. Any radiating pain down your legs (sciatica pattern)? Is it worse with movement or rest?", organ: "Spine" },
  lung: { reply: "Respiratory symptoms noted. Rate your breathlessness 1-10. Any cough (dry or productive), wheezing, or chest tightness?", organ: "Lungs" },
  breath: { reply: "Respiratory compromise flagged. Is this sudden onset or gradual? Any history of asthma, COPD, or recent infections?", organ: "Lungs" },
};

export default function LandingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("patient");
  const [aiChat, setAiChat] = useState<ChatMsg[]>([
    { sender: "ai", text: "Hello! I am your MediNova Clinical AI. Describe your symptoms naturally — I'll ask intelligent follow-up questions to help assess your condition. This does not replace a doctor's consultation." },
  ]);
  const [symptomInput, setSymptomInput] = useState("");
  const [aiProcessing, setAiProcessing] = useState(false);
  const [activeOrgan, setActiveOrgan] = useState("Heart");
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<null | { findings: string[]; interpretations: string[]; steps: string[] }>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomInput.trim() || aiProcessing) return;

    const userText = symptomInput.trim();
    const updated: ChatMsg[] = [...aiChat, { sender: "user", text: userText }];
    setAiChat(updated);
    setSymptomInput("");
    setAiProcessing(true);

    setTimeout(() => {
      const lc = userText.toLowerCase();
      let best = { reply: "Thank you for sharing. Could you provide more detail — where exactly is the discomfort, and how long have you had it? Rate the severity 1-10.", organ: activeOrgan };
      for (const key of Object.keys(AI_RESPONSES)) {
        if (lc.includes(key)) { best = AI_RESPONSES[key]; break; }
      }
      setActiveOrgan(best.organ);
      setAiChat((prev) => [...prev, { sender: "ai", text: best.reply }]);
      setAiProcessing(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }, 1100);
  };

  const handleOcrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrFile(file);
    setOcrResult(null);
    setOcrScanning(true);

    setTimeout(() => {
      setOcrScanning(false);
      setOcrResult({
        findings: [
          "Sinus tachycardia — HR 102 bpm (Normal: 60-100 bpm)",
          "Trace tricuspid regurgitation — no haemodynamic significance",
          "Systolic BP: 148/92 mmHg — Stage 1 hypertension range",
          "eGFR: 74 mL/min — mildly reduced renal filtration",
        ],
        interpretations: [
          "Mild cardiovascular stress consistent with elevated arterial workload",
          "Physiological valvular backflow — no surgical intervention indicated at this time",
          "Blood pressure elevation may warrant pharmacological management if sustained",
        ],
        steps: [
          "Schedule 24-hour Ambulatory Blood Pressure Monitoring (ABPM)",
          "Nephrology referral for eGFR trajectory monitoring",
          "Dietary sodium reduction (<2g/day) and aerobic exercise program",
          "Follow-up in 6 weeks with repeat lipid panel and renal function tests",
        ],
      });
    }, 2200);
  };

  return (
    <div className="bg-glass-page">

      {/* ─── FLOATING NAVBAR ─── */}
      <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6">
        <nav className="glass-nav max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 rounded-full flex items-center justify-between shadow-sm">
          {/* Logo */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 transition-transform group-hover:scale-105">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span style={{ fontFamily: "Outfit, sans-serif" }} className="font-bold text-xl text-slate-800">
              MediNova<span className="text-cyan-500"> AI</span>
            </span>
          </button>

          {/* Nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {[
              { href: "#features", label: "Features" },
              { href: "#sandbox", label: "Sandbox" },
              { href: "#assistant", label: "AI Assistant" },
              { href: "#ocr", label: "Reports" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100/50 transition-all"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/auth/login")}
              className="btn-secondary py-2.5 px-6 text-sm shadow-sm hover:shadow-md"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push("/auth/signup")}
              className="btn-primary py-2.5 px-6 text-sm shadow-md hover:shadow-lg"
            >
              Get Started
            </button>
          </div>
        </nav>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="pt-36 pb-20 px-4 sm:px-6 max-w-7xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-200 bg-cyan-50/50 text-cyan-600 text-xs font-semibold mb-8 backdrop-blur-md shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            AI-Powered Clinical Intelligence Platform
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-800 mb-6 leading-[1.05]" style={{ fontFamily: "Outfit, sans-serif", textShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            The Future of<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500">
              AI Healthcare
            </span>
          </h1>

          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Beautifully engineered for hospitals. Powered by clinical AI. Featuring real-time 3D anatomy, OCR report analysis, and intelligent diagnosis support — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <a href="#sandbox" className="btn-primary text-base py-3.5 px-8 shadow-lg hover:shadow-xl">
              <Sparkles className="w-4 h-4" />
              Explore Platform
            </a>
            <button onClick={() => router.push("/auth/signup")} className="btn-secondary text-base py-3.5 px-8 shadow-sm hover:shadow-md bg-white/70">
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card-elevated p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <Icon className="w-6 h-6 mx-auto mb-3" style={{ color: stat.color }} />
                  <div className="text-3xl font-extrabold text-slate-800 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>{stat.value}</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section id="features" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>
            Built for Every<span className="text-cyan-500"> Clinical Role</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">One platform. Every stakeholder. From patients to surgeons to hospital administrators.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            const colorMap: Record<string, string> = {
              cyan: "#0ea5e9", purple: "#8b5cf6", blue: "#3b82f6",
              emerald: "#10b981", rose: "#f43f5e", amber: "#f59e0b",
            };
            const c = colorMap[feat.color];
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-8 group cursor-pointer"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-transform group-hover:scale-110"
                  style={{ background: `${c}15`, border: `1px solid ${c}30` }}
                >
                  <Icon className="w-7 h-7" style={{ color: c }} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3" style={{ fontFamily: "Outfit, sans-serif" }}>{feat.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── INTERACTIVE SANDBOX ─── */}
      <section id="sandbox" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>
            Interactive<span className="text-cyan-500"> Dashboard Sandbox</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">Switch between workspaces to see how each role experiences MediNova AI.</p>
        </div>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn px-5 py-2.5 rounded-full text-sm ${activeTab === tab.id ? "active bg-cyan-100 text-cyan-700 shadow-sm border-cyan-200" : "bg-white/50 text-slate-500 hover:bg-white/80 border-slate-200"}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Sandbox Container */}
        <div className="glass-card-elevated overflow-hidden border border-white/80 shadow-2xl" style={{ borderRadius: 32, minHeight: 600 }}>
          <div className="flex h-full" style={{ minHeight: 600 }}>

            {/* Sidebar pill nav */}
            <div className="w-16 md:w-20 flex-shrink-0 flex flex-col items-center py-8 gap-6 border-r border-slate-200/50"
              style={{ background: "rgba(255,255,255,0.4)" }}>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 flex flex-col gap-4 mt-4">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      title={tab.label}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                        activeTab === tab.id
                          ? "bg-cyan-50 border-cyan-200 text-cyan-600 shadow-sm"
                          : "bg-white/50 border-white/60 text-slate-400 hover:text-slate-600 hover:bg-white/80"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-sm font-bold text-white shadow-md border-2 border-white/50">
                MN
              </div>
            </div>

            {/* Main viewport */}
            <div className="flex-1 p-6 md:p-10 overflow-y-auto" style={{ background: "rgba(255,255,255,0.5)" }}>
              <AnimatePresence mode="wait">

                {/* ── PATIENT TAB ── */}
                {activeTab === "patient" && (
                  <motion.div key="patient" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <p className="text-xs font-bold text-cyan-600 uppercase tracking-widest mb-1.5">Patient Portal</p>
                        <h2 className="text-3xl font-extrabold text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>Patient Health Overview</h2>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => router.push("/dashboard/patient")} className="btn-primary py-2.5 px-5 text-sm shadow-sm">
                          Open Dashboard <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                      {/* 3D Organ viewer area */}
                      <div className="xl:col-span-7">
                        <div className="glass-card-elevated rounded-3xl overflow-hidden relative shadow-sm" style={{ height: 380, background: "rgba(255,255,255,0.7)" }}>
                          <div className="absolute top-5 left-5 z-10 flex items-center gap-2 px-4 py-2 rounded-full border border-rose-200 bg-rose-50/80 text-rose-600 text-xs font-bold shadow-sm backdrop-blur-md">
                            <Heart className="w-4 h-4 animate-pulse" />
                            Interactive 3D {activeOrgan}
                          </div>
                          <ThreeHeart />
                          <div className="absolute bottom-5 left-5 z-10 glass-nav p-4 rounded-2xl shadow-sm">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">SpO₂</p>
                            <p className="text-xl font-extrabold text-emerald-500" style={{ fontFamily: "Outfit, sans-serif" }}>98.5%</p>
                          </div>
                          <div className="absolute bottom-5 right-5 z-10 glass-nav p-4 rounded-2xl shadow-sm">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">HR</p>
                            <p className="text-xl font-extrabold text-cyan-500" style={{ fontFamily: "Outfit, sans-serif" }}>72 bpm</p>
                          </div>
                        </div>
                      </div>

                      {/* Right widgets */}
                      <div className="xl:col-span-5 flex flex-col gap-5">
                        {/* Doctor card */}
                        <div className="glass-card-elevated p-6 flex items-center gap-5 shadow-sm">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">JC</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-cyan-600 font-bold uppercase tracking-wider mb-1">Next Appointment</p>
                            <p className="text-base font-bold text-slate-800 truncate" style={{ fontFamily: "Outfit, sans-serif" }}>Dr. Jane Cardiologist</p>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">Mon, 10:00–11:30 AM</p>
                          </div>
                          <button
                            onClick={() => router.push("/dashboard/appointments")}
                            className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 hover:bg-cyan-100 transition-all shadow-sm"
                          >
                            <Video className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Vitals grid */}
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: "Blood Pressure", value: "120/80", unit: "mmHg", color: "#3b82f6" },
                            { label: "Blood Sugar", value: "92", unit: "mg/dL", color: "#10b981" },
                            { label: "Temperature", value: "36.6", unit: "°C", color: "#f59e0b" },
                            { label: "Cholesterol", value: "178", unit: "mg/dL", color: "#8b5cf6" },
                          ].map((v) => (
                            <div key={v.label} className="glass-card-elevated p-5 shadow-sm" style={{ borderRadius: 20 }}>
                              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">{v.label}</p>
                              <p className="text-2xl font-extrabold mb-0.5" style={{ fontFamily: "Outfit, sans-serif", color: v.color }}>{v.value}</p>
                              <p className="text-[11px] font-semibold text-slate-400">{v.unit}</p>
                            </div>
                          ))}
                        </div>

                        {/* Quick action */}
                        <button
                          onClick={() => router.push("/dashboard/patient")}
                          className="btn-primary w-full py-3.5 text-sm shadow-md mt-1"
                        >
                          Open Full Patient Portal <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── CLINICAL TAB ── */}
                {activeTab === "clinical" && (
                  <motion.div key="clinical" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1.5">Clinician Suite</p>
                        <h2 className="text-3xl font-extrabold text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>Clinical Decision Support</h2>
                      </div>
                      <button onClick={() => router.push("/dashboard/doctor")} className="btn-primary py-2.5 px-5 text-sm shadow-sm" style={{ background: "linear-gradient(135deg, #a855f7, #8b5cf6)" }}>
                        Doctor Dashboard <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {/* Diagnosis panel */}
                      <div className="glass-card-elevated p-8 shadow-sm" style={{ borderRadius: 28 }}>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-bold text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>Possible Diagnoses</h3>
                          <span className="stat-badge bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs py-1 px-3">94% Confidence</span>
                        </div>
                        <div className="space-y-5">
                          {[
                            { name: "Migraine with Aura", conf: 88, flag: false },
                            { name: "Tension-Type Headache", conf: 72, flag: false },
                            { name: "Hypertensive Urgency", conf: 45, flag: true },
                          ].map((d) => (
                            <div key={d.name} className="flex items-center gap-4">
                              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${d.flag ? "bg-rose-500" : "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"}`} />
                              <div className="flex-1">
                                <div className="flex justify-between mb-2">
                                  <span className="text-sm font-bold text-slate-700">{d.name}</span>
                                  <span className="text-xs font-bold text-slate-500">{d.conf}%</span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${d.conf}%`, background: d.flag ? "#f43f5e" : "linear-gradient(90deg, #0ea5e9, #3b82f6)" }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="glass-card-elevated p-8 flex flex-col gap-5 shadow-sm" style={{ borderRadius: 28 }}>
                        <h3 className="text-lg font-bold text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>Recommended Investigations</h3>
                        {[
                          { test: "Brain MRI (with Gadolinium)", priority: "High", color: "#ef4444" },
                          { test: "Complete Blood Count (CBC)", priority: "Routine", color: "#0ea5e9" },
                          { test: "Ophthalmology Consult", priority: "Medium", color: "#f59e0b" },
                        ].map((r) => (
                          <div key={r.test} className="flex justify-between items-center p-4 rounded-2xl border border-slate-200 bg-white/60 shadow-sm">
                            <span className="text-sm font-semibold text-slate-700">{r.test}</span>
                            <span className="stat-badge text-[11px] py-1 px-3" style={{ color: r.color, borderColor: `${r.color}30`, backgroundColor: `${r.color}10`, border: `1px solid ${r.color}30` }}>{r.priority}</span>
                          </div>
                        ))}
                        <div className="flex items-start gap-3 p-4 mt-2 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-700 font-medium shadow-sm">
                          <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
                          Suggestions are AI-generated support tools. Clinician judgment takes precedence.
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── AI ASSISTANT TAB ── */}
                {activeTab === "ai" && (
                  <motion.div key="ai" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }} className="flex flex-col" style={{ height: 520 }}>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-xs font-bold text-cyan-600 uppercase tracking-widest mb-1.5">Natural Language AI</p>
                        <h2 className="text-3xl font-extrabold text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>Clinical AI Health Assistant</h2>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 text-xs font-bold shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                        Active
                      </div>
                    </div>

                    {/* Chat window */}
                    <div className="flex-1 overflow-y-auto space-y-4 mb-5 pr-2">
                      {aiChat.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] p-5 text-sm leading-relaxed shadow-sm ${
                            msg.sender === "user"
                              ? "bg-gradient-to-br from-cyan-500 to-blue-500 border border-cyan-400 text-white"
                              : "bg-white/80 border border-slate-200 text-slate-700 backdrop-blur-md"
                          }`} style={{ borderRadius: msg.sender === "user" ? "20px 20px 6px 20px" : "20px 20px 20px 6px" }}>
                            <span className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${msg.sender === "user" ? "opacity-70 text-cyan-100" : "text-slate-400"}`}>
                              {msg.sender === "user" ? "Patient" : "🤖 MediNova AI"}
                            </span>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {aiProcessing && (
                        <div className="flex justify-start">
                          <div className="bg-white/80 border border-slate-200 p-5 rounded-2xl rounded-bl-md flex items-center gap-3 shadow-sm backdrop-blur-md">
                            <div className="flex gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                            <span className="text-sm font-semibold text-cyan-600">Analyzing symptoms...</span>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat input */}
                    <form onSubmit={sendSymptom} className="flex gap-3">
                      <input
                        className="glass-input flex-1 text-sm shadow-sm"
                        style={{ borderRadius: 16, padding: "16px 20px" }}
                        value={symptomInput}
                        onChange={(e) => setSymptomInput(e.target.value)}
                        placeholder="Describe your symptoms (e.g. 'I have a severe headache and blurred vision')..."
                        disabled={aiProcessing}
                      />
                      <button
                        type="submit"
                        disabled={!symptomInput.trim() || aiProcessing}
                        className="btn-primary px-6 py-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        style={{ borderRadius: 16 }}
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* ── EMERGENCY TAB ── */}
                {activeTab === "emergency" && (
                  <motion.div key="emergency" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" /> Live Emergency Command
                        </p>
                        <h2 className="text-3xl font-extrabold text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>Emergency Operations Center</h2>
                      </div>
                      <button onClick={() => router.push("/dashboard/emergency")} className="btn-primary py-2.5 px-5 text-sm shadow-md" style={{ background: "linear-gradient(135deg, #ef4444, #b91c1c)" }}>
                        Open Emergency Desk <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {/* EKG monitor mock */}
                      <div className="glass-card-elevated p-8 border border-rose-200 bg-rose-50/50 shadow-sm" style={{ borderRadius: 28 }}>
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-sm font-bold text-rose-600 flex items-center gap-2">
                            <Activity className="w-5 h-5 animate-pulse" /> Case #4829 — Trauma
                          </span>
                          <span className="stat-badge bg-rose-100 text-rose-700 border border-rose-300 px-3 py-1 text-xs">CRITICAL</span>
                        </div>
                        {/* EKG bars */}
                        <div className="flex items-end gap-1.5 h-28 mb-5">
                          {[20,35,15,80,5,20,35,15,80,5,20,35,20,90,5,20,35,15,75,5,20,30,15,80].map((h, i) => (
                            <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i % 4 === 3 ? "#ef4444" : "rgba(239,68,68,0.2)" }} />
                          ))}
                        </div>
                        <div className="flex justify-between text-sm font-semibold text-slate-500 bg-white/60 p-4 rounded-xl border border-rose-100">
                          <span>Heart Rate: <strong className="text-rose-600 text-lg">138 bpm</strong></span>
                          <span>BP: <strong className="text-rose-600 text-lg">180/110</strong></span>
                        </div>
                      </div>

                      {/* Dispatch status */}
                      <div className="glass-card-elevated p-8 flex flex-col gap-4 shadow-sm" style={{ borderRadius: 28 }}>
                        <h3 className="text-lg font-bold text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>Active Dispatch</h3>
                        {[
                          { unit: "Ambulance Unit 04", status: "En Route", eta: "ETA: 3 min", color: "#ef4444" },
                          { unit: "OR Bay 02", status: "Ready", eta: "Prepped & Sterile", color: "#10b981" },
                          { unit: "Trauma Team Alpha", status: "Standby", eta: "Level 1 activation", color: "#f59e0b" },
                        ].map((d) => (
                          <div key={d.unit} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white/60 shadow-sm">
                            <div className="w-3 h-3 rounded-full flex-shrink-0 animate-pulse shadow-sm" style={{ backgroundColor: d.color, boxShadow: `0 0 8px ${d.color}` }} />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-slate-700 mb-0.5">{d.unit}</p>
                              <p className="text-xs font-semibold text-slate-500">{d.eta}</p>
                            </div>
                            <span className="stat-badge text-xs px-3 py-1" style={{ color: d.color, borderColor: `${d.color}30`, backgroundColor: `${d.color}10`, border: `1px solid ${d.color}30` }}>{d.status}</span>
                          </div>
                        ))}
                        <button
                          onClick={() => router.push("/dashboard/emergency")}
                          className="btn-primary w-full py-3.5 text-sm mt-2 shadow-md"
                          style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
                        >
                          <AlertTriangle className="w-5 h-5" /> Open Emergency Dashboard
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ─── AI ASSISTANT SECTION ─── */}
      <section id="assistant" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="glass-card-elevated p-10 md:p-14 border border-cyan-200/50 shadow-xl" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(240,249,255,0.8) 100%)" }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-cyan-200 bg-cyan-50/80 text-cyan-700 text-xs font-bold mb-6 shadow-sm">
                <Cpu className="w-4 h-4 text-cyan-500" />
                Intelligent Clinical AI
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-6" style={{ fontFamily: "Outfit, sans-serif" }}>
                AI That Thinks<br /><span className="text-cyan-500">Like a Clinician</span>
              </h2>
              <p className="text-slate-500 text-lg mb-8 leading-relaxed font-medium">
                Our AI doesn't follow scripts. It dynamically adapts its questions based on your responses, building a full clinical picture before suggesting possible conditions with evidence-based reasoning.
              </p>
              <div className="space-y-4 mb-10">
                {[
                  "Dynamic follow-up questioning — never fixed scripts",
                  "Organ highlighting in 3D model based on symptoms",
                  "Confidence scoring with reasoning transparency",
                  "Red flag detection for immediate escalation",
                ].map((pt) => (
                  <div key={pt} className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    {pt}
                  </div>
                ))}
              </div>
              <button onClick={() => setActiveTab("ai")} className="btn-primary py-3 px-8 shadow-md hover:shadow-lg">
                <Sparkles className="w-5 h-5" />
                Try AI Assistant Now
                <a href="#sandbox" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { sender: "user", text: "I've had a severe headache behind my eyes since this morning." },
                { sender: "ai", text: "Noted. Is the pain throbbing or a constant pressure? Are you sensitive to light or sound? Any visual disturbances (auras, zigzag lines) before onset?" },
                { sender: "user", text: "Throbbing, and yes — lights are making it worse. No visual aura." },
                { sender: "ai", text: "This pattern is consistent with migraine without aura. On a scale of 1-10, how severe is the pain now? Any nausea or vomiting accompanying it?" },
              ].map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.sender === "user" ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[85%] p-5 text-sm leading-relaxed shadow-sm"
                    style={{
                      borderRadius: msg.sender === "user" ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
                      background: msg.sender === "user" ? "linear-gradient(135deg, #0ea5e9, #3b82f6)" : "rgba(255,255,255,0.9)",
                      border: msg.sender === "user" ? "none" : "1px solid rgba(0,0,0,0.05)",
                      color: msg.sender === "user" ? "white" : "#334155",
                    }}
                  >
                    <span className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${msg.sender === "user" ? "opacity-70 text-cyan-100" : "text-slate-400"}`}>
                      {msg.sender === "user" ? "Patient" : "🤖 MediNova AI"}
                    </span>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── OCR REPORT SECTION ─── */}
      <section id="ocr" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>
            Medical Report<span className="text-cyan-500"> OCR Analysis</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">Upload any medical document. Our AI extracts, interprets, and contextualises findings.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Upload zone */}
          <div
            className="glass-card-elevated border-2 border-dashed cursor-pointer group flex flex-col items-center justify-center p-14 text-center relative overflow-hidden transition-all shadow-md hover:shadow-lg hover:border-cyan-300 hover:bg-cyan-50/30"
            style={{ borderColor: "rgba(6,182,212,0.3)", minHeight: 340, borderRadius: 32 }}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "radial-gradient(circle at center, rgba(6,182,212,0.05) 0%, transparent 70%)" }} />
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*,application/pdf" onChange={handleOcrUpload} />
            <div className="w-20 h-20 rounded-3xl bg-cyan-50 border border-cyan-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
              <Upload className="w-10 h-10 text-cyan-500" />
            </div>
            <p className="text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>Upload Medical Report</p>
            <p className="text-sm font-medium text-slate-500 mb-6">Drag & drop or click to browse</p>
            <div className="flex flex-wrap justify-center gap-3">
              {["PDF", "PNG", "JPG", "DICOM", "HL7"].map((f) => (
                <span key={f} className="stat-badge bg-slate-100/80 border border-slate-200 text-slate-500 px-3 py-1 shadow-sm">{f}</span>
              ))}
            </div>
          </div>

          {/* Results area */}
          <div className="glass-card-elevated p-8 flex flex-col shadow-md" style={{ minHeight: 340, borderRadius: 32 }}>
            {!ocrFile && !ocrScanning && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <FileText className="w-16 h-16 text-slate-300 mb-4" />
                <p className="text-base font-medium text-slate-400">Upload a medical document to see AI-powered OCR analysis results.</p>
              </div>
            )}
            {ocrScanning && (
              <div className="flex-1 flex flex-col items-center justify-center gap-5">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full animate-ping" />
                  <div className="absolute inset-0 border-4 border-t-cyan-500 rounded-full animate-spin" />
                </div>
                <p className="text-base text-cyan-600 font-bold animate-pulse">Scanning & Analysing Document...</p>
                <p className="text-sm font-semibold text-slate-400">Extracting text · Mapping findings · Generating insights</p>
              </div>
            )}
            {ocrResult && (
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 overflow-y-auto space-y-6 pr-2">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <span className="text-base font-bold text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>Analysis Complete</span>
                  <span className="text-xs font-semibold text-slate-500 truncate max-w-[200px] bg-slate-100 px-3 py-1 rounded-full border border-slate-200">{ocrFile?.name}</span>
                </div>

                <div>
                  <p className="glass-label text-cyan-600 mb-3 text-xs">Extracted Findings</p>
                  <ul className="space-y-2.5">
                    {ocrResult.findings.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0 mt-1.5 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />{f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="glass-label text-purple-600 mb-3 text-xs">AI Interpretations</p>
                  <ul className="space-y-2.5">
                    {ocrResult.interpretations.map((t, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                        <Brain className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />{t}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="glass-label text-emerald-600 mb-3 text-xs">Recommended Clinical Steps</p>
                  <ul className="space-y-2.5">
                    {ocrResult.steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />{s}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => { setOcrResult(null); setOcrFile(null); }}
                  className="btn-secondary w-full py-3 text-sm font-bold shadow-sm mt-4"
                >
                  Clear & Upload New Report
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-black/[0.05] mt-20 bg-white/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span style={{ fontFamily: "Outfit, sans-serif" }} className="font-bold text-xl text-slate-800">
                MediNova<span className="text-cyan-500"> AI</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">© {new Date().getFullYear()} MediNova AI. All rights reserved.</p>
            <div className="flex gap-6 text-sm font-semibold text-slate-500">
              <a href="#" className="hover:text-cyan-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-cyan-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-cyan-600 transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
