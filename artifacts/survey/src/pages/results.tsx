import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { supabase, type SurveyResponse } from "@/lib/supabase";

const ACCENT = "#8A3BDB";

const SLEEP_ORDER = [
  "Less than 5 hours",
  "5–6 hours",
  "6–7 hours",
  "7–8 hours",
  "8–9 hours",
  "9 or more hours",
];

type ChartEntry = { name: string; count: number };

function aggregateStress(rows: SurveyResponse[]): ChartEntry[] {
  const counts: Record<number, number> = {};
  for (let i = 1; i <= 10; i++) counts[i] = 0;
  for (const r of rows) counts[r.stress_level] = (counts[r.stress_level] ?? 0) + 1;
  return Object.entries(counts).map(([k, v]) => ({ name: k, count: v }));
}

function aggregateSleep(rows: SurveyResponse[]): ChartEntry[] {
  const counts: Record<string, number> = {};
  for (const r of rows) {
    counts[r.sleep_hours] = (counts[r.sleep_hours] ?? 0) + 1;
  }
  return SLEEP_ORDER.filter((s) => counts[s] !== undefined).map((s) => ({
    name: s,
    count: counts[s],
  }));
}

function aggregateMajors(rows: SurveyResponse[]): ChartEntry[] {
  const counts: Record<string, number> = {};
  for (const r of rows) {
    for (const m of r.major) {
      if (m === "Other" && r.other_major) {
        const display =
          r.other_major.trim().charAt(0).toUpperCase() +
          r.other_major.trim().slice(1).toLowerCase();
        counts[display] = (counts[display] ?? 0) + 1;
      } else {
        counts[m] = (counts[m] ?? 0) + 1;
      }
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function HorizontalBarChart({ data, label }: { data: ChartEntry[]; label: string }) {
  return (
    <div className="chart-container">
      <h2 className="chart-title">{label}</h2>
      {data.length === 0 ? (
        <p className="chart-empty">No data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(200, data.length * 48)}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 4, right: 32, left: 8, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 13 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={160}
              tick={{ fontSize: 13 }}
            />
            <Tooltip formatter={(v) => [v, "Responses"]} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={ACCENT} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function Results() {
  const [rows, setRows] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("survey_responses")
        .select("exercise, sleep_hours, stress_level, major, other_major");
      if (error) {
        setError(`Could not load results (${error.code ?? error.message ?? "unknown error"}). Check that your Supabase URL and anon key are correct and the table exists.`);
      } else {
        setRows(data as SurveyResponse[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const stressData = aggregateStress(rows);
  const sleepData = aggregateSleep(rows);
  const majorData = aggregateMajors(rows);

  return (
    <div className="page-wrapper">
      <header className="survey-header">
        <span className="survey-header-title">Survey Results</span>
        <Link href="/" className="header-link">
          Home
        </Link>
      </header>

      <main className="container">
        <h1 className="section-title">Aggregated Results</h1>

        {loading && <p className="loading-text">Loading results…</p>}
        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="total-responses">
              <span className="total-number">{rows.length}</span>
              <span className="total-label">Total Responses</span>
            </div>

            <div className="charts-section">
              {/* Stress — vertical bar */}
              <div className="chart-container">
                <h2 className="chart-title">Stress Levels (1–10)</h2>
                {rows.length === 0 ? (
                  <p className="chart-empty">No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={stressData}
                      margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
                      <Tooltip formatter={(v) => [v, "Responses"]} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {stressData.map((_, i) => (
                          <Cell key={i} fill={ACCENT} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <HorizontalBarChart data={majorData} label="Most Popular Majors" />
              <HorizontalBarChart data={sleepData} label="Sleep Hours Distribution" />
            </div>

            <div className="results-actions">
              <Link href="/" className="btn btn-outline">
                Home
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
