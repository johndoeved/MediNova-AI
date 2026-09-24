"use client";

import React, { useState } from "react";
import {
  Activity, Heart, AlertTriangle, CheckCircle2,
  TrendingUp, ShieldAlert, Sparkles, ArrowRight, RefreshCw, Info
} from "lucide-react";

interface MLHeartPredictorProps {
  onApplyToOrgan?: (organ: string, conditionId: string | null, heartRate: number) => void;
}

export default function MLHeartPredictor({ onApplyToOrgan }: MLHeartPredictorProps) {
  const [age, setAge] = useState(54);
  const [sex, setSex] = useState(1);
  const [chestPain, setChestPain] = useState(2);
  const [restingBp, setRestingBp] = useState(138);
  const [cholesterol, setCholesterol] = useState(238);
  const [fbs, setFbs] = useState(0);
  const [restEcg, setRestEcg] = useState(1);
  const [maxHeartRate, setMaxHeartRate] = useState(145);
  const [exang, setExang] = useState(1);
  const [oldpeak, setOldpeak] = useState(1.4);
  const [slope, setSlope] = useState(1);
  const [ca, setCa] = useState(1);
  const [thal, setThal] = useState(2);

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Quick Preset Profiles for Easy Testing
  const loadPreset = (type: "healthy" | "moderate" | "severe") => {
    if (type === "healthy") {
      setAge(34);
      setSex(0);
      setChestPain(1);
      setRestingBp(115);
      setCholesterol(175);
      setFbs(0);
      setRestEcg(0);
      setMaxHeartRate(174);
      setExang(0);
      setOldpeak(0.2);
      setSlope(2);
      setCa(0);
      setThal(2);
    } else if (type === "moderate") {
      setAge(52);
      setSex(1);
      setChestPain(2);
      setRestingBp(136);
      setCholesterol(228);
      setFbs(0);
      setRestEcg(1);
      setMaxHeartRate(148);
      setExang(0);
      setOldpeak(1.0);
      setSlope(1);
      setCa(0);
      setThal(2);
    } else {
      setAge(64);
      setSex(1);
      setChestPain(0);
      setRestingBp(162);
      setCholesterol(284);
      setFbs(1);
      setRestEcg(2);
      setMaxHeartRate(118);
      setExang(1);
      setOldpeak(2.8);
      setSlope(1);
      setCa(2);
      setThal(3);
    }
    setPrediction(null);
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);

    const payload = {
      age: Number(age),
      sex: Number(sex),
      chest_pain_type: Number(chestPain),
      resting_bp: Number(restingBp),
      cholesterol: Number(cholesterol),
      fasting_blood_sugar_gt_120: Number(fbs),
      resting_ecg: Number(restEcg),
      max_heart_rate: Number(maxHeartRate),
      exercise_induced_angina: Number(exang),
      st_depression: Number(oldpeak),
      st_slope: Number(slope),
      num_major_vessels: Number(ca),
      thalassemia: Number(thal),
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/ml/predict-heart-disease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      setPrediction(data);

      if (onApplyToOrgan) {
        onApplyToOrgan(data.organ, data.condition_id, data.risk_probability > 50 ? 104 : 72);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to connect to ML backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-rose-50 via-cyan-50 to-blue-50 border border-white/80 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-rose-500/25">
            <Heart className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>
                Cardiovascular Disease ML Risk Predictor
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                Random Forest
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Trained on Kaggle Cleveland Heart Disease Dataset · 85.3% Accuracy · 91.7% ROC-AUC · 97.0% Recall
            </p>
          </div>
        </div>

        {/* Preset Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 mr-1">Load Preset:</span>
          <button
            onClick={() => loadPreset("healthy")}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200 bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100 transition-all shadow-sm"
          >
            Optimal
          </button>
          <button
            onClick={() => loadPreset("moderate")}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-200 bg-amber-50/80 text-amber-700 hover:bg-amber-100 transition-all shadow-sm"
          >
            Moderate
          </button>
          <button
            onClick={() => loadPreset("severe")}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-200 bg-rose-50/80 text-rose-700 hover:bg-rose-100 transition-all shadow-sm"
          >
            High Risk
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Clinical Biomarkers */}
        <div className="lg:col-span-7 rounded-3xl p-6 border border-white/80 bg-white/70 shadow-sm backdrop-blur-xl">
          <p className="text-xs font-bold text-cyan-600 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <Activity className="w-4 h-4" /> Patient Clinical Parameters
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Age */}
            <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Age</label>
                <span className="text-xs font-bold text-cyan-600">{age} yrs</span>
              </div>
              <input
                type="range"
                min="20"
                max="85"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Sex */}
            <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60">
              <label className="text-xs font-bold text-slate-700 block mb-2">Biological Sex</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSex(1)}
                  className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    sex === 1 ? "bg-cyan-500 text-white border-cyan-500 shadow-sm" : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setSex(0)}
                  className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    sex === 0 ? "bg-cyan-500 text-white border-cyan-500 shadow-sm" : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

            {/* Resting BP */}
            <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Resting Blood Pressure</label>
                <span className="text-xs font-bold text-cyan-600">{restingBp} mmHg</span>
              </div>
              <input
                type="range"
                min="90"
                max="200"
                value={restingBp}
                onChange={(e) => setRestingBp(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Cholesterol */}
            <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Serum Cholesterol</label>
                <span className="text-xs font-bold text-cyan-600">{cholesterol} mg/dL</span>
              </div>
              <input
                type="range"
                min="120"
                max="400"
                value={cholesterol}
                onChange={(e) => setCholesterol(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Max Heart Rate */}
            <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Max Heart Rate Achieved</label>
                <span className="text-xs font-bold text-cyan-600">{maxHeartRate} bpm</span>
              </div>
              <input
                type="range"
                min="70"
                max="210"
                value={maxHeartRate}
                onChange={(e) => setMaxHeartRate(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* ST Depression */}
            <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">ST Depression (Oldpeak)</label>
                <span className="text-xs font-bold text-cyan-600">{oldpeak} mm</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="5.0"
                step="0.1"
                value={oldpeak}
                onChange={(e) => setOldpeak(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Chest Pain Type */}
            <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Chest Pain Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 0, label: "Typical Angina" },
                  { id: 1, label: "Atypical Angina" },
                  { id: 2, label: "Non-Anginal" },
                  { id: 3, label: "Asymptomatic" },
                ].map((cp) => (
                  <button
                    key={cp.id}
                    type="button"
                    onClick={() => setChestPain(cp.id)}
                    className={`py-1.5 px-2 text-[11px] font-semibold rounded-xl border text-center transition-all ${
                      chestPain === cp.id
                        ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {cp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise Angina & Fasting Blood Sugar */}
            <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Exercise Angina</span>
              <button
                type="button"
                onClick={() => setExang(exang === 1 ? 0 : 1)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                  exang === 1 ? "bg-rose-100 text-rose-700 border-rose-300" : "bg-white text-slate-500 border-slate-200"
                }`}
              >
                {exang === 1 ? "Yes (Positive)" : "No (Negative)"}
              </button>
            </div>

            <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Fasting Blood Sugar &gt; 120</span>
              <button
                type="button"
                onClick={() => setFbs(fbs === 1 ? 0 : 1)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                  fbs === 1 ? "bg-amber-100 text-amber-700 border-amber-300" : "bg-white text-slate-500 border-slate-200"
                }`}
              >
                {fbs === 1 ? "High (&gt; 120)" : "Normal (&lt; 120)"}
              </button>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full mt-5 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-cyan-500 text-white font-extrabold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Computing ML Inference...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run AI Diagnostic Prediction
              </>
            )}
          </button>

          {error && (
            <p className="text-xs text-rose-600 font-semibold mt-2 text-center">
              ⚠️ {error}
            </p>
          )}
        </div>

        {/* Right Panel: Output & Clinical Interpretation */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl p-6 border border-white/80 bg-white/70 shadow-sm backdrop-blur-xl flex-1 flex flex-col">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Diagnostic Outcome
            </p>

            {!prediction && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Heart className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-600">Model Ready</p>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Click &quot;Run AI Diagnostic Prediction&quot; to calculate disease probability from the trained Random Forest classifier.
                </p>
              </div>
            )}

            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 border-3 border-t-rose-500 border-rose-100 rounded-full animate-spin mb-3" />
                <p className="text-sm font-bold text-slate-700">Evaluating 13 Clinical Parameters...</p>
                <p className="text-xs text-slate-400">Querying FastAPI inference engine</p>
              </div>
            )}

            {prediction && (
              <div className="space-y-4">
                {/* Risk Gauge Card */}
                <div
                  className={`p-5 rounded-2xl border flex items-center justify-between ${
                    prediction.risk_level === "High Risk"
                      ? "bg-rose-50/80 border-rose-200 text-rose-900"
                      : prediction.risk_level === "Moderate Risk"
                      ? "bg-amber-50/80 border-amber-200 text-amber-900"
                      : "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                  }`}
                >
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
                      Cardiovascular Risk Probability
                    </span>
                    <p className="text-3xl font-extrabold mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                      {prediction.risk_probability}%
                    </p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/80 border border-current inline-block mt-1">
                      {prediction.risk_level}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                      Confidence Score
                    </span>
                    <p className="text-xl font-bold" style={{ fontFamily: "Outfit, sans-serif" }}>
                      {prediction.confidence_score}%
                    </p>
                    <span className="text-[10px] opacity-70">Random Forest</span>
                  </div>
                </div>

                {/* Primary Contributing Factors */}
                <div>
                  <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Key Contributing Factors
                  </p>
                  <ul className="space-y-1.5">
                    {prediction.primary_factors.map((factor: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div>
                  <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Recommended Clinical Actions
                  </p>
                  <ul className="space-y-1.5">
                    {prediction.clinical_recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="text-xs text-slate-600 bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
