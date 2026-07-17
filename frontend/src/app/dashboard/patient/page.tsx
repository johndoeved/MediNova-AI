"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Activity, MessageSquare, Settings, Bell, Search,
  Video, ChevronLeft, ChevronRight, Heart, Brain, Pill,
  FileText, LogOut, TrendingUp, TrendingDown, Zap,
  AlertTriangle, CheckCircle2, Plus, Upload, Microscope,
  Wind, Info, ChevronRight as CR, Stethoscope, BarChart2, Clock,
} from "lucide-react";
import {
  useLiveClock, useGlobalHealthStats, useIndiaHealthStats,
  useAirQuality, useDrugInfo, useClinicalTrials, fmtNum,
} from "@/hooks/useLiveData";

const ThreeHeart = dynamic(() => import("@/components/ThreeHeart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50">
      <div className="w-14 h-14 border-2 border-t-cyan-400 border-cyan-100 rounded-full animate-spin" />
    </div>
  ),
});

/* ──── Light glass mini-card ──── */
function LCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[22px] border transition-all ${className}`}
      style={{
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(20px) saturate(180%)",
        borderColor: "rgba(255,255,255,0.92)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.07), 0 1px 0 rgba(255,255,255,1) inset",
      }}
    >
      {children}
    </div>
  );
}

/* ──── MiniCalendar ──── */
function MiniCalendar() {
  const [cur, setCur] = useState(new Date());
  const today = new Date();
  const year = cur.getFullYear(), month = cur.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = cur.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setCur(new Date(year, month - 1, 1))} className="w-7 h-7 rounded-lg bg-black/5 hover:bg-black/10 flex items-center justify-center transition-all">
          <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
        </button>
        <span className="text-xs font-bold text-cyan-600 px-3 py-1 rounded-lg bg-cyan-50 border border-cyan-100">{monthName}</span>
        <button onClick={() => setCur(new Date(year, month + 1, 1))} className="w-7 h-7 rounded-lg bg-black/5 hover:bg-black/10 flex items-center justify-center transition-all">
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {["S","M","T","W","T","F","S"].map((d,i)=>(
          <span key={i} className="text-[10px] text-slate-400 font-semibold pb-1">{d}</span>
        ))}
        {cells.map((day, i) => {
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          return (
            <button key={i} disabled={!day}
              className={`w-7 h-7 rounded-full text-[11px] font-medium transition-all mx-auto flex items-center justify-center ${
                !day ? "invisible" :
                isToday ? "bg-gradient-to-br from-cyan-400 to-blue-500 text-white font-bold shadow-md shadow-cyan-300/40" :
                "text-slate-500 hover:bg-cyan-50 hover:text-cyan-600"
              }`}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ──── MAIN ──── */
export default function PatientDashboard() {
  const router = useRouter();
  const { time, date } = useLiveClock();
  const { data: globalStats, loading: globalLoading } = useGlobalHealthStats();
  const { data: indiaStats, loading: indiaLoading } = useIndiaHealthStats();
  const { data: airData, loading: airLoading } = useAirQuality();
  const { trials } = useClinicalTrials("cardiac", 3);
  const [activeTab, setActiveTab] = useState<"overview"|"vitals"|"ai"|"reports"|"trials"|"drugs">("overview");
  const [activeOrgan, setActiveOrgan] = useState("Heart");
  const [drugQuery, setDrugQuery] = useState("Atorvastatin");
  const [drugSearch, setDrugSearch] = useState("Atorvastatin");
  const { data: drugData, loading: drugLoading, error: drugError, search: fetchDrug } = useDrugInfo(drugSearch);
  useEffect(() => { fetchDrug(); }, [fetchDrug]);

  const ORGANS = [
    { name: "Heart", icon: "❤️", color: "#f43f5e" },
    { name: "Brain", icon: "🧠", color: "#8b5cf6" },
    { name: "Lungs", icon: "🫁", color: "#06b6d4" },
    { name: "Kidneys", icon: "🫘", color: "#f59e0b" },
    { name: "Liver", icon: "🫀", color: "#10b981" },
  ];

  const VITALS = [
    { label:"Blood Pressure", value:"120/80", unit:"mmHg", color:"#3b82f6", trend:"+2 from last", icon:Activity },
    { label:"Heart Rate", value:"72", unit:"bpm", color:"#f43f5e", trend:"Normal range", icon:Heart },
    { label:"SpO₂", value:"98.5", unit:"%", color:"#10b981", trend:"Excellent", icon:Zap },
    { label:"Blood Sugar", value:"92", unit:"mg/dL", color:"#f59e0b", trend:"-5 from last", icon:TrendingDown },
    { label:"Temperature", value:"36.6", unit:"°C", color:"#06b6d4", trend:"Normal", icon:Activity },
    { label:"Cholesterol", value:"178", unit:"mg/dL", color:"#8b5cf6", trend:"Optimal", icon:TrendingUp },
  ];

  const APPOINTMENTS = [
    { icon:"🩺", label:"Complete Blood Count (CBC)", date:"24 Apr", doctor:"Dr. Shimron Hetmyer", color:"#06b6d4" },
    { icon:"🏥", label:"Clinic Visit Appointment", date:"31 May", doctor:"Dr. Shilpa Rao", color:"#8b5cf6" },
    { icon:"💻", label:"Video Consultation Chat", date:"02 Jun", doctor:"Dr. Kartik Aryan", color:"#10b981" },
  ];

  const NAV = [
    { icon: Home, tab:"overview", label:"Overview" },
    { icon: Activity, tab:"vitals", label:"Vitals" },
    { icon: Brain, tab:"ai", label:"AI Consult" },
    { icon: FileText, tab:"reports", label:"Reports" },
    { icon: Microscope, tab:"trials", label:"Trials" },
    { icon: Pill, tab:"drugs", label:"Drugs" },
  ];

  return (
    <div className="min-h-screen bg-glass-dashboard relative overflow-hidden">
      {/* Soft blob accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-200/30 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-200/25 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-200/20 rounded-full filter blur-[90px] pointer-events-none" />

      <div className="relative z-10 flex h-screen">

        {/* ═══════ LEFT SIDEBAR — light glass icon rail ═══════ */}
        <aside className="w-20 flex-shrink-0 flex flex-col items-center py-7 gap-5"
          style={{
            background:"rgba(255,255,255,0.65)",
            backdropFilter:"blur(28px) saturate(200%)",
            borderRight:"1px solid rgba(255,255,255,0.9)",
            boxShadow:"4px 0 24px rgba(0,0,0,0.05)",
          }}>
          <button onClick={() => router.push("/")}
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-400/30 hover:scale-105 transition-transform mb-1">
            <Activity className="w-5 h-5 text-white" />
          </button>

          <div className="flex flex-col gap-2.5 flex-1">
            {NAV.map(({ icon: Icon, tab, label }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                title={label}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all relative group ${
                  activeTab === tab
                    ? "bg-cyan-50 border-cyan-200 text-cyan-600 shadow-md shadow-cyan-100"
                    : "bg-white/60 border-white/80 text-slate-400 hover:text-slate-600 hover:bg-white/80 hover:border-slate-200"
                }`}>
                <Icon className="w-5 h-5" />
                <span className="absolute left-14 px-2 py-1 rounded-lg bg-slate-800 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-slate-700">
                  {label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2.5">
            <button className="w-12 h-12 rounded-2xl bg-white/60 border border-white/80 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all">
              <MessageSquare className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 rounded-2xl bg-white/60 border border-white/80 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all">
              <Settings className="w-5 h-5" />
            </button>
            <button onClick={() => router.push("/")}
              className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-400 hover:bg-rose-100 flex items-center justify-center transition-all">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </aside>

        {/* ═══════ MAIN GLASS PANEL ═══════ */}
        <main className="flex-1 p-4 overflow-hidden">
          <div className="h-full rounded-[28px] overflow-hidden flex flex-col"
            style={{
              background:"rgba(255,255,255,0.60)",
              backdropFilter:"blur(40px) saturate(200%)",
              border:"1px solid rgba(255,255,255,0.92)",
              boxShadow:"0 24px 80px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,1) inset",
            }}>

            {/* ─── TOP BAR ─── */}
            <div className="flex items-center justify-between px-8 py-3.5 border-b border-black/[0.04]"
              style={{ background:"rgba(255,255,255,0.55)" }}>
              <div className="flex items-center gap-4">
                <p className="text-lg font-bold text-slate-800" style={{ fontFamily:"Outfit, sans-serif" }}>
                  MediNova<span className="text-cyan-500"> AI</span>
                </p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input className="glass-input pl-9 pr-4 py-2 text-sm w-60" style={{ borderRadius:12, fontSize:13 }}
                    placeholder="Search patients, drugs, records..." />
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Live IST time */}
                <div className="text-right">
                  <p className="text-xl font-extrabold text-slate-800 leading-none" style={{ fontFamily:"Outfit, sans-serif" }}>{time}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{date}</p>
                </div>
                <div className="h-8 w-px bg-black/[0.07]" />
                <button className="relative w-9 h-9 rounded-xl bg-white/70 border border-white/90 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all shadow-sm">
                  <Bell className="w-4 h-4" />
                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                </button>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:scale-105 transition-transform shadow-md shadow-cyan-300/30">
                  JD
                </div>
              </div>
            </div>

            {/* ─── CONTENT ─── */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <AnimatePresence mode="wait">

                {/* ════ OVERVIEW — InfiHealth layout, light glass ════ */}
                {activeTab === "overview" && (
                  <motion.div key="overview" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }} transition={{ duration:0.25 }}
                    className="grid grid-cols-12 gap-5 h-full">

                    {/* LEFT: Title + organ ring + 3D viewer + air quality */}
                    <div className="col-span-12 xl:col-span-7 flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold text-cyan-500 uppercase tracking-[0.12em] mb-1">Overview</p>
                          <h1 className="text-3xl font-extrabold text-slate-800 leading-tight" style={{ fontFamily:"Outfit, sans-serif" }}>Patient Health</h1>
                        </div>

                        {/* Health ring — InfiHealth style */}
                        <div className="relative w-20 h-20 flex items-center justify-center">
                          <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(6,182,212,0.12)" strokeWidth="6" />
                            <circle cx="40" cy="40" r="32" fill="none" stroke="url(#healthGradL)" strokeWidth="6"
                              strokeLinecap="round" strokeDasharray={`${2*Math.PI*32*0.82} ${2*Math.PI*32}`} />
                            <defs>
                              <linearGradient id="healthGradL" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#10b981" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="text-center z-10">
                            <p className="text-lg font-extrabold text-slate-800 leading-none" style={{ fontFamily:"Outfit, sans-serif" }}>82</p>
                            <p className="text-[9px] text-emerald-500 font-bold">/100</p>
                          </div>
                        </div>
                      </div>

                      {/* 3D Organ viewer */}
                      <LCard className="overflow-hidden relative flex-1" style={{ minHeight:280 } as any}>
                        {/* Organ tabs */}
                        <div className="absolute top-3 left-3 z-10 flex gap-1.5 flex-wrap">
                          {ORGANS.map((o) => (
                            <button key={o.name} onClick={() => setActiveOrgan(o.name)}
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 ${
                                activeOrgan === o.name
                                  ? "border-white shadow-md text-white"
                                  : "border-white/70 bg-white/50 text-slate-500 hover:bg-white/80"
                              }`}
                              style={activeOrgan === o.name ? { background: `${o.color}CC`, borderColor: o.color } : {}}>
                              {o.icon} {o.name}
                            </button>
                          ))}
                        </div>

                        {/* 3D Canvas - light bg */}
                        <div className="w-full h-full" style={{ background:"linear-gradient(135deg, #e0f7fa20, #f0fdf420)" }}>
                          <ThreeHeart />
                        </div>

                        {/* Floating label */}
                        <div className="absolute top-1/3 left-5 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/80"
                          style={{ background:"rgba(255,255,255,0.80)", backdropFilter:"blur(12px)" }}>
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                          <span className="text-xs text-slate-600 font-medium">{activeOrgan} Monitor</span>
                        </div>

                        {/* Bottom vitals row */}
                        <div className="absolute bottom-3 inset-x-3 z-10 grid grid-cols-3 gap-2">
                          {[{l:"SpO₂",v:"98.5%",c:"#10b981"},{l:"Heart Rate",v:"72 bpm",c:"#f43f5e"},{l:"BP",v:"120/80",c:"#3b82f6"}].map((s)=>(
                            <div key={s.l} className="px-3 py-2 rounded-xl text-center border border-white/80"
                              style={{ background:"rgba(255,255,255,0.80)", backdropFilter:"blur(12px)" }}>
                              <p className="text-[9px] text-slate-400 mb-0.5">{s.l}</p>
                              <p className="text-sm font-bold" style={{ fontFamily:"Outfit, sans-serif", color:s.c }}>{s.v}</p>
                            </div>
                          ))}
                        </div>
                      </LCard>

                      {/* Air Quality — Open-Meteo API */}
                      {!airLoading && airData && (
                        <LCard className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
                              style={{ background:`${airData.color}12`, borderColor:`${airData.color}25` }}>
                              <Wind className="w-5 h-5" style={{ color:airData.color }} />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-slate-500 mb-0.5">Mumbai Air Quality — Live (Open-Meteo API)</p>
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-slate-800">AQI {airData.aqi ?? "—"}</span>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full border"
                                  style={{ color:airData.color, borderColor:`${airData.color}30`, background:`${airData.color}10` }}>
                                  {airData.label}
                                </span>
                                {airData.pm2_5 && <span className="text-xs text-slate-400">PM2.5: {airData.pm2_5.toFixed(1)} μg/m³</span>}
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400">Live</span>
                          </div>
                        </LCard>
                      )}
                    </div>

                    {/* RIGHT: Clock, Doctor, Calendar, Visits, Stats */}
                    <div className="col-span-12 xl:col-span-5 flex flex-col gap-4">

                      {/* Doctor card */}
                      <LCard className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg shadow-cyan-300/30">JC</div>
                          <div className="flex-1">
                            <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider mb-0.5">Next Appointment</p>
                            <p className="text-sm font-bold text-slate-800">Dr. Jane Cardiologist</p>
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Mon, 28 Jul · 10:00 – 11:30 AM</p>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-600 text-xs font-semibold hover:bg-cyan-100 transition-all">
                            <Video className="w-3.5 h-3.5" /> Video Call
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs font-semibold hover:bg-slate-100 transition-all">
                            <MessageSquare className="w-3.5 h-3.5" /> Message
                          </button>
                        </div>
                      </LCard>

                      {/* Mini Calendar */}
                      <LCard className="p-5"><MiniCalendar /></LCard>

                      {/* In-Week Visits */}
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2.5">In-Week Visits</p>
                        <div className="grid grid-cols-3 gap-2">
                          {APPOINTMENTS.map((apt) => (
                            <LCard key={apt.label} className="p-3 hover:scale-105 cursor-pointer">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="text-base">{apt.icon}</span>
                                <span className="text-[10px] font-bold text-slate-400">{apt.date}</span>
                              </div>
                              <p className="text-xs font-bold text-slate-700 leading-tight mb-1">{apt.label}</p>
                              <p className="text-[10px] text-slate-400 truncate">{apt.doctor}</p>
                            </LCard>
                          ))}
                        </div>
                      </div>

                      {/* Live Global Health Stats */}
                      <LCard className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-slate-700">Global Health Monitor</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-emerald-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live · disease.sh
                          </div>
                        </div>
                        {globalLoading ? (
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <div className="w-3 h-3 border border-t-cyan-400 border-cyan-100 rounded-full animate-spin" />
                            Fetching live data...
                          </div>
                        ) : globalStats ? (
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { l:"Global Cases", v:fmtNum(globalStats.cases), c:"#f59e0b" },
                              { l:"Recovered", v:fmtNum(globalStats.recovered), c:"#10b981" },
                              { l:"Active", v:fmtNum(globalStats.active), c:"#06b6d4" },
                              { l:"Deaths", v:fmtNum(globalStats.deaths), c:"#ef4444" },
                            ].map((s)=>(
                              <div key={s.l} className="px-3 py-2 rounded-xl border border-slate-100 bg-slate-50/80">
                                <p className="text-[9px] text-slate-400 mb-0.5">{s.l}</p>
                                <p className="text-base font-bold" style={{ fontFamily:"Outfit, sans-serif", color:s.c }}>{s.v}</p>
                              </div>
                            ))}
                          </div>
                        ) : <p className="text-xs text-slate-400">Unable to load live data</p>}
                      </LCard>
                    </div>
                  </motion.div>
                )}

                {/* ════ VITALS ════ */}
                {activeTab === "vitals" && (
                  <motion.div key="vitals" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}>
                    <div className="mb-6">
                      <p className="text-xs text-cyan-500 uppercase tracking-widest font-semibold mb-1">Live Monitoring</p>
                      <h2 className="text-2xl font-extrabold text-slate-800" style={{ fontFamily:"Outfit, sans-serif" }}>Patient Vitals</h2>
                    </div>

                    {/* India stats banner */}
                    {!indiaLoading && indiaStats && (
                      <LCard className="mb-5 p-4">
                        <div className="flex flex-wrap gap-4 items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🇮🇳</span>
                            <p className="text-xs font-bold text-slate-700">India Health Data</p>
                            <span className="text-[10px] text-slate-400">· Live via disease.sh</span>
                          </div>
                          {[
                            { l:"Today Cases", v:fmtNum(indiaStats.todayCases), c:"#f59e0b" },
                            { l:"Active", v:fmtNum(indiaStats.active), c:"#06b6d4" },
                            { l:"Recovered", v:fmtNum(indiaStats.recovered), c:"#10b981" },
                            { l:"Tests", v:fmtNum(indiaStats.tests), c:"#8b5cf6" },
                          ].map((s)=>(
                            <div key={s.l} className="text-center">
                              <p className="text-[9px] text-slate-400">{s.l}</p>
                              <p className="text-sm font-bold" style={{ color:s.c, fontFamily:"Outfit, sans-serif" }}>{s.v}</p>
                            </div>
                          ))}
                        </div>
                      </LCard>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
                      {VITALS.map((v) => {
                        const Icon = v.icon;
                        return (
                          <LCard key={v.label} className="p-5 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                            <div className="flex justify-between items-start mb-3">
                              <p className="text-[11px] text-slate-500 font-medium">{v.label}</p>
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ background:`${v.color}12`, border:`1px solid ${v.color}25` }}>
                                <Icon className="w-4 h-4" style={{ color:v.color }} />
                              </div>
                            </div>
                            <p className="text-3xl font-extrabold mb-0.5" style={{ fontFamily:"Outfit, sans-serif", color:v.color }}>{v.value}</p>
                            <p className="text-xs text-slate-400">{v.unit}</p>
                            <p className="text-[10px] mt-1.5 font-semibold text-slate-500">{v.trend}</p>
                            <div className="flex items-end gap-0.5 h-8 mt-3">
                              {Array.from({length:12},(_,i)=>(
                                <div key={i} className="flex-1 rounded-sm" style={{ height:`${30+Math.sin(i*0.8)*20}%`, background:`${v.color}${i===11?"CC":"25"}` }} />
                              ))}
                            </div>
                          </LCard>
                        );
                      })}
                    </div>

                    {/* ECG */}
                    <LCard className="p-5">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-bold text-slate-700" style={{ fontFamily:"Outfit, sans-serif" }}>ECG Waveform — Live</p>
                        <div className="flex items-center gap-1.5 text-xs text-rose-500">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" /> 72 bpm
                        </div>
                      </div>
                      <div className="flex items-end gap-0.5 h-16">
                        {[20,22,18,25,80,5,15,25,18,85,5,18,22,20,25,80,5,16,24,20,25,78,5,20,22,18,20,82,5,15].map((h,i)=>(
                          <div key={i} className="flex-1 rounded-sm"
                            style={{ height:`${h}%`, background: i%5===4 ? "rgba(244,63,94,0.75)" : "rgba(244,63,94,0.18)" }} />
                        ))}
                      </div>
                    </LCard>
                  </motion.div>
                )}

                {/* ════ AI CONSULT ════ */}
                {activeTab === "ai" && <AIChatPanel activeOrgan={activeOrgan} setActiveOrgan={setActiveOrgan} />}

                {/* ════ REPORTS ════ */}
                {activeTab === "reports" && <ReportsPanel />}

                {/* ════ CLINICAL TRIALS ════ */}
                {activeTab === "trials" && (
                  <motion.div key="trials" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}>
                    <div className="mb-6">
                      <p className="text-xs text-cyan-500 uppercase tracking-widest font-semibold mb-1">ClinicalTrials.gov API — Live</p>
                      <h2 className="text-2xl font-extrabold text-slate-800" style={{ fontFamily:"Outfit, sans-serif" }}>Active Clinical Trials</h2>
                    </div>
                    {trials.length === 0 ? (
                      <div className="flex items-center gap-3 text-slate-400">
                        <div className="w-5 h-5 border-2 border-t-cyan-400 border-cyan-100 rounded-full animate-spin" />
                        Loading live trials from ClinicalTrials.gov...
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {trials.map((t) => (
                          <LCard key={t.nctId} className="p-5 hover:shadow-lg cursor-pointer">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center flex-shrink-0">
                                <Microscope className="w-5 h-5 text-cyan-500" />
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-wrap gap-2 mb-2">
                                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-600 font-bold">{t.nctId}</span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${t.status==="RECRUITING" ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-slate-50 border-slate-200 text-slate-500"}`}>{t.status}</span>
                                  {t.phase && <span className="text-[10px] px-2 py-0.5 rounded-full border border-purple-200 bg-purple-50 text-purple-600 font-bold">{t.phase}</span>}
                                </div>
                                <p className="text-sm font-semibold text-slate-700 mb-1">{t.briefTitle}</p>
                                <p className="text-xs text-slate-400">Sponsor: {t.sponsor}</p>
                              </div>
                              <a href={`https://clinicaltrials.gov/study/${t.nctId}`} target="_blank" rel="noopener noreferrer"
                                className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-cyan-500 hover:border-cyan-200 transition-all">
                                <CR className="w-4 h-4" />
                              </a>
                            </div>
                          </LCard>
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400 mt-4 text-center">Data sourced live from ClinicalTrials.gov v2 API</p>
                  </motion.div>
                )}

                {/* ════ DRUGS ════ */}
                {activeTab === "drugs" && (
                  <motion.div key="drugs" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}>
                    <div className="mb-6">
                      <p className="text-xs text-cyan-500 uppercase tracking-widest font-semibold mb-1">OpenFDA API — Live</p>
                      <h2 className="text-2xl font-extrabold text-slate-800" style={{ fontFamily:"Outfit, sans-serif" }}>Drug Intelligence Database</h2>
                    </div>
                    <div className="flex gap-3 mb-6">
                      <input className="glass-input flex-1 text-sm" style={{ borderRadius:16 }}
                        value={drugQuery} onChange={(e) => setDrugQuery(e.target.value)}
                        placeholder="Search drug (e.g. Atorvastatin, Metformin, Tylenol)..."
                        onKeyDown={(e) => { if(e.key==="Enter"){ setDrugSearch(drugQuery); setTimeout(fetchDrug,50); }}} />
                      <button onClick={() => { setDrugSearch(drugQuery); setTimeout(fetchDrug,50); }}
                        className="btn-primary px-6 py-3 text-sm" style={{ borderRadius:16 }}>
                        <Search className="w-4 h-4" /> Search FDA
                      </button>
                    </div>
                    {drugLoading && (
                      <div className="flex items-center gap-3 text-slate-400 py-8">
                        <div className="w-5 h-5 border-2 border-t-cyan-400 border-cyan-100 rounded-full animate-spin" />
                        Fetching from OpenFDA...
                      </div>
                    )}
                    {drugError && (
                      <LCard className="p-4">
                        <div className="flex items-center gap-2 text-amber-600 text-sm">
                          <Info className="w-4 h-4" /> {drugError} — Try: Tylenol, Lipitor, Advil
                        </div>
                      </LCard>
                    )}
                    {drugData && !drugLoading && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <LCard className="p-5">
                          <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider">Brand Name</p>
                          <p className="text-xl font-extrabold text-cyan-600 mb-1" style={{ fontFamily:"Outfit, sans-serif" }}>{drugData.brand_name}</p>
                          <p className="text-sm text-slate-500 mb-2">{drugData.generic_name}</p>
                          <p className="text-[10px] text-slate-400 mb-1">Manufacturer</p>
                          <p className="text-xs text-slate-600">{drugData.manufacturer}</p>
                        </LCard>
                        <LCard className="p-5">
                          <p className="text-[10px] text-slate-400 mb-2 uppercase tracking-wider">Purpose / Indication</p>
                          {drugData.purpose.slice(0,1).map((p,i)=>(
                            <p key={i} className="text-xs text-slate-600 leading-relaxed line-clamp-5">{p}</p>
                          ))}
                        </LCard>
                        {drugData.dosage.length>0 && (
                          <LCard className="p-5">
                            <p className="text-[10px] text-slate-400 mb-2 uppercase tracking-wider">Dosage & Administration</p>
                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-5">{drugData.dosage[0]}</p>
                          </LCard>
                        )}
                        {drugData.warnings.length>0 && (
                          <div className="p-5 rounded-[22px] border border-rose-200 bg-rose-50/70">
                            <p className="text-[10px] text-rose-500 mb-2 uppercase tracking-wider flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Warnings & Cautions
                            </p>
                            <p className="text-xs text-rose-800 leading-relaxed line-clamp-5">{drugData.warnings[0]}</p>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400 mt-6 text-center">Data sourced live from U.S. Food and Drug Administration — OpenFDA API</p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ─── AI Chat Panel sub-component ─── */
const AI_MAP: Record<string, { reply:string; organ:string }> = {
  head: { reply:"Headache detected. Rate 1-10. Any light sensitivity, neck stiffness, or visual aura?", organ:"Brain" },
  chest: { reply:"⚠️ Chest pain flagged. Radiating to arm/jaw? Breathless? This warrants urgent triage.", organ:"Heart" },
  stomach: { reply:"GI symptoms. Localised or diffuse? Worse after meals?", organ:"Digestive" },
  back: { reply:"Spinal pain. Any radiating numbness down the legs?", organ:"Spine" },
  breath: { reply:"Respiratory compromise. Sudden or gradual? History of asthma/COPD?", organ:"Lungs" },
  knee: { reply:"Joint pain noted. Is it swollen, warm, or stiff after rest?", organ:"Joints" },
  fever: { reply:"Fever noted. What is your temperature? Any chills, body ache, or rash?", organ:"Lymphatic" },
};

type Msg = { sender:"user"|"ai"; text:string };

function AIChatPanel({ activeOrgan, setActiveOrgan }: { activeOrgan:string; setActiveOrgan:(o:string)=>void }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { sender:"ai", text:"Hello! I'm your MediNova Clinical AI assistant. Describe your symptoms naturally — I'll ask intelligent follow-up questions to help assess your condition. This complements (but never replaces) medical consultation." },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || thinking) return;
    const txt = input.trim();
    setMsgs((p)=>[...p,{sender:"user",text:txt}]);
    setInput(""); setThinking(true);
    setTimeout(()=>{
      const lc = txt.toLowerCase();
      let best = { reply:"Thank you. Pinpoint the location, rate severity 1-10, and tell me how long you've had this?", organ:activeOrgan };
      for (const k of Object.keys(AI_MAP)) { if(lc.includes(k)){best=AI_MAP[k];break;} }
      setActiveOrgan(best.organ);
      setMsgs((p)=>[...p,{sender:"ai",text:best.reply}]);
      setThinking(false);
      setTimeout(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),50);
    }, 1000);
  };

  return (
    <motion.div key="ai" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.25 }} className="flex flex-col" style={{ height:"calc(100vh - 220px)" }}>
      <div className="mb-4">
        <p className="text-xs text-cyan-500 uppercase tracking-widest font-semibold mb-1">Symptom Intelligence Engine</p>
        <h2 className="text-2xl font-extrabold text-slate-800" style={{ fontFamily:"Outfit, sans-serif" }}>Clinical AI Consultation</h2>
        <p className="text-xs text-slate-400 mt-1">For live AI chat across all topics, use the <strong className="text-cyan-500">NovaCare AI</strong> button (bottom right ↘)</p>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
        {msgs.map((m,i)=>(
          <div key={i} className={`flex ${m.sender==="user"?"justify-end":"justify-start"}`}>
            <div className="max-w-[78%] px-4 py-3 text-sm leading-relaxed"
              style={{
                borderRadius: m.sender==="user" ? "20px 20px 5px 20px" : "20px 20px 20px 5px",
                background: m.sender==="user" ? "linear-gradient(135deg, rgba(6,182,212,0.12), rgba(14,165,233,0.08))" : "rgba(255,255,255,0.80)",
                border: m.sender==="user" ? "1px solid rgba(6,182,212,0.22)" : "1px solid rgba(0,0,0,0.06)",
                color: m.sender==="user" ? "#0c4a6e" : "#334155",
                boxShadow:"0 2px 8px rgba(0,0,0,0.05)",
              }}>
              <span className="block text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60">
                {m.sender==="user" ? "You" : "🤖 Clinical AI"}
              </span>
              {m.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex gap-1.5 px-4 py-3 rounded-2xl border border-white/80 bg-white/70 w-fit shadow-sm">
            {[0,150,300].map((d)=>(
              <span key={d} className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay:`${d}ms` }} />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="flex gap-3">
        <input value={input} onChange={(e)=>setInput(e.target.value)}
          className="glass-input flex-1 text-sm" style={{ borderRadius:16 }}
          placeholder="Describe your symptoms (e.g. 'I have chest pain and shortness of breath')..."
          disabled={thinking} />
        <button type="submit" disabled={!input.trim()||thinking}
          className="btn-primary px-5 py-3 disabled:opacity-50" style={{ borderRadius:16 }}>
          Send
        </button>
      </form>
    </motion.div>
  );
}

/* ─── Reports Panel sub-component ─── */
function ReportsPanel() {
  const [file, setFile] = useState<File|null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<null|{findings:string[];ai:string[];steps:string[]}>(null);
  const ref = useRef<HTMLInputElement>(null);

  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if(!f) return;
    setFile(f); setResult(null); setScanning(true);
    setTimeout(()=>{
      setScanning(false);
      setResult({
        findings:["Sinus tachycardia — HR 102 bpm (Ref: 60-100)","Trace tricuspid regurgitation — no haemodynamic significance","Systolic BP: 148/92 mmHg — Stage 1 HTN","eGFR: 74 mL/min/1.73m² — mildly reduced"],
        ai:["Mild cardiovascular stress — elevated arterial workload","Valvular backflow is physiological — no intervention required","BP elevation may warrant antihypertensive if sustained over 4 weeks"],
        steps:["24-hour ABPM — High Priority","Nephrology referral for eGFR monitoring","Dietary sodium <2g/day · 150 min/week aerobic exercise","Follow-up in 6 weeks with repeat lipid and renal panel"],
      });
    }, 2200);
  };

  return (
    <motion.div key="reports" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}>
      <div className="mb-6">
        <p className="text-xs text-cyan-500 uppercase tracking-widest font-semibold mb-1">OCR + AI Intelligence</p>
        <h2 className="text-2xl font-extrabold text-slate-800" style={{ fontFamily:"Outfit, sans-serif" }}>Medical Report Analysis</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <LCard className="p-8 border-2 border-dashed cursor-pointer flex flex-col items-center justify-center text-center min-h-[200px] hover:border-cyan-300 hover:bg-cyan-50/50 transition-all group"
          onClick={()=>ref.current?.click()}>
          <input ref={ref} type="file" className="hidden" accept="image/*,application/pdf" onChange={upload} />
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Upload className="w-7 h-7 text-cyan-500" />
          </div>
          <p className="text-sm font-bold text-slate-700 mb-1">Upload Medical Report</p>
          <p className="text-xs text-slate-400 mb-3">Blood tests, MRI, CT, ECG, X-Ray</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {["PDF","PNG","JPG","DICOM"].map((f)=>(
              <span key={f} className="text-[10px] px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-400">{f}</span>
            ))}
          </div>
        </LCard>

        <LCard className="p-6 min-h-[200px] flex flex-col">
          {!file && !scanning && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <FileText className="w-10 h-10 mb-2 text-slate-300" />
              <p className="text-xs">Upload a document to begin analysis</p>
            </div>
          )}
          {scanning && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 border-2 border-t-cyan-400 border-cyan-100 rounded-full animate-spin" />
              <p className="text-sm text-cyan-600 font-semibold animate-pulse">Scanning & Analysing...</p>
            </div>
          )}
          {result && (
            <div className="space-y-4 overflow-y-auto">
              <div className="flex justify-between pb-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-700">Analysis Complete</p>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider mb-2">Findings</p>
                <ul className="space-y-1.5">{result.findings.map((f,i)=>(
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 mt-1.5" />{f}
                  </li>
                ))}</ul>
              </div>
              <div>
                <p className="text-[10px] text-purple-500 font-bold uppercase tracking-wider mb-2">AI Interpretations</p>
                <ul className="space-y-1.5">{result.ai.map((t,i)=>(
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                    <Brain className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />{t}
                  </li>
                ))}</ul>
              </div>
              <div>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-2">Next Steps</p>
                <ul className="space-y-1.5">{result.steps.map((s,i)=>(
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />{s}
                  </li>
                ))}</ul>
              </div>
              <button onClick={()=>{setResult(null);setFile(null);}}
                className="btn-secondary w-full py-2.5 text-xs mt-2">Clear & Upload New</button>
            </div>
          )}
        </LCard>
      </div>
    </motion.div>
  );
}
