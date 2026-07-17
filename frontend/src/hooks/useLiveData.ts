"use client";

import { useState, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────────
   LIVE CLOCK  (India Standard Time)
───────────────────────────────────────────── */
export function useLiveClock() {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const tick = () => setTime(new Date());
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (d: Date) =>
    d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });

  return { time: fmt(time), date: fmtDate(time), raw: time };
}

/* ─────────────────────────────────────────────
   GLOBAL HEALTH STATS  (disease.sh — free, no key)
   Docs: https://disease.sh/docs
───────────────────────────────────────────── */
export interface GlobalHealthStats {
  cases: number;
  deaths: number;
  recovered: number;
  active: number;
  updated: number;
}
export function useGlobalHealthStats() {
  const [data, setData] = useState<GlobalHealthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  return { data, loading, error };
}

/* ─────────────────────────────────────────────
   INDIA COVID STATS  (disease.sh — free, no key)
───────────────────────────────────────────── */
export interface CountryHealthStats {
  country: string;
  cases: number;
  todayCases: number;
  deaths: number;
  todayDeaths: number;
  recovered: number;
  active: number;
  critical: number;
  tests: number;
  population: number;
  casesPerOneMillion: number;
}
export function useIndiaHealthStats() {
  const [data, setData] = useState<CountryHealthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/countries/India?strict=true")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  return { data, loading, error };
}

/* ─────────────────────────────────────────────
   OPEN WEATHER / AIR QUALITY  (Open-Meteo — free, no key)
   Mumbai coordinates used as default
───────────────────────────────────────────── */
export interface AirQualityData {
  aqi: number | null;
  pm2_5: number | null;
  pm10: number | null;
  no2: number | null;
  label: string;
  color: string;
}
export function useAirQuality(lat = 19.076, lon = 72.8777) {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5,pm10,nitrogen_dioxide,european_aqi&timezone=Asia%2FKolkata&forecast_days=1`
    )
      .then((r) => r.json())
      .then((d) => {
        const idx = 0; // first hour
        const aqi = d?.hourly?.european_aqi?.[idx] ?? null;
        const pm2_5 = d?.hourly?.pm2_5?.[idx] ?? null;
        const pm10 = d?.hourly?.pm10?.[idx] ?? null;
        const no2 = d?.hourly?.nitrogen_dioxide?.[idx] ?? null;

        let label = "Good";
        let color = "#10b981";
        if (aqi !== null) {
          if (aqi > 100) { label = "Unhealthy"; color = "#ef4444"; }
          else if (aqi > 50) { label = "Moderate"; color = "#f59e0b"; }
          else if (aqi > 20) { label = "Fair"; color = "#06b6d4"; }
        }
        setData({ aqi, pm2_5, pm10, no2, label, color });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lat, lon]);

  return { data, loading };
}

/* ─────────────────────────────────────────────
   OPENFDA DRUG SEARCH  (free, no key for <1000 req/day)
   Docs: https://api.fda.gov/drug/label.json
───────────────────────────────────────────── */
export interface DrugInfo {
  brand_name: string;
  generic_name: string;
  purpose: string[];
  warnings: string[];
  dosage: string[];
  manufacturer: string;
}
export function useDrugInfo(drugName: string) {
  const [data, setData] = useState<DrugInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(() => {
    if (!drugName.trim()) return;
    setLoading(true);
    setError(null);
    fetch(
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(drugName)}"&limit=1`
    )
      .then((r) => {
        if (!r.ok) throw new Error(`Not found (HTTP ${r.status})`);
        return r.json();
      })
      .then((d) => {
        const r = d.results?.[0];
        if (!r) throw new Error("No results found");
        setData({
          brand_name: r.openfda?.brand_name?.[0] ?? drugName,
          generic_name: r.openfda?.generic_name?.[0] ?? "Unknown",
          purpose: r.purpose ?? [],
          warnings: r.warnings_and_cautions ?? r.warnings ?? [],
          dosage: r.dosage_and_administration ?? [],
          manufacturer: r.openfda?.manufacturer_name?.[0] ?? "Unknown",
        });
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [drugName]);

  return { data, loading, error, search };
}

/* ─────────────────────────────────────────────
   CLINICAL TRIALS  (ClinicalTrials.gov v2 — free, no key)
   Docs: https://clinicaltrials.gov/data-api/api
───────────────────────────────────────────── */
export interface ClinicalTrial {
  nctId: string;
  briefTitle: string;
  status: string;
  phase: string;
  sponsor: string;
  conditions: string[];
  startDate: string;
}
export function useClinicalTrials(condition: string, limit = 5) {
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!condition.trim()) return;
    setLoading(true);
    fetch(
      `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(condition)}&pageSize=${limit}&fields=NCTId,BriefTitle,OverallStatus,Phase,LeadSponsorName,Condition,StartDate`
    )
      .then((r) => r.json())
      .then((d) => {
        const list: ClinicalTrial[] = (d.studies ?? []).map((s: any) => {
          const p = s.protocolSection;
          return {
            nctId: p?.identificationModule?.nctId ?? "",
            briefTitle: p?.identificationModule?.briefTitle ?? "",
            status: p?.statusModule?.overallStatus ?? "",
            phase: p?.designModule?.phases?.[0] ?? "N/A",
            sponsor: p?.sponsorCollaboratorsModule?.leadSponsor?.name ?? "",
            conditions: p?.conditionsModule?.conditions ?? [],
            startDate: p?.statusModule?.startDateStruct?.date ?? "",
          };
        });
        setTrials(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [condition, limit]);

  return { trials, loading };
}

/* ─────────────────────────────────────────────
   OPENFDA DRUG ADVERSE EVENTS  (free, no key)
───────────────────────────────────────────── */
export interface AdverseEvent {
  term: string;
  count: number;
}
export function useAdverseEvents(drug: string, limit = 6) {
  const [events, setEvents] = useState<AdverseEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!drug.trim()) return;
    setLoading(true);
    fetch(
      `https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:"${encodeURIComponent(drug)}"&count=patient.reaction.reactionmeddrapt.exact&limit=${limit}`
    )
      .then((r) => r.json())
      .then((d) => {
        setEvents((d.results ?? []).map((r: any) => ({ term: r.term, count: r.count })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [drug, limit]);

  return { events, loading };
}

/* ─────────────────────────────────────────────
   NUMBER FORMATTER
───────────────────────────────────────────── */
export function fmtNum(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(n % 1 === 0 ? 0 : 2);
}
