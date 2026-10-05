"use client";

import React, { useEffect, useState } from "react";
import { Activity, RefreshCw } from "lucide-react";

interface TelemetryState {
  status: "online" | "checking" | "offline";
  latencyMs: number | null;
  service: string;
  database: string;
}

export function SystemTelemetryBadge() {
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    status: "checking",
    latencyMs: null,
    service: "yash-ai-backend",
    database: "SQLite (Local Vector)",
  });
  const [showTooltip, setShowTooltip] = useState(false);

  const checkHealth = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";
    const startTime = performance.now();
    try {
      const res = await fetch(`${apiUrl}/health`, {
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });
      const endTime = performance.now();
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setTelemetry({
          status: "online",
          latencyMs: Math.round(endTime - startTime),
          service: data.service || "yash-ai-backend",
          database: data.database || "Vector Core",
        });
      } else {
        setTelemetry((prev) => ({ ...prev, status: "offline", latencyMs: null }));
      }
    } catch {
      setTelemetry((prev) => ({ ...prev, status: "offline", latencyMs: null }));
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 25000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={checkHealth}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium border transition ${
          telemetry.status === "online"
            ? "bg-[#12141a] hover:bg-[#181a24] border-[#252834] text-slate-300"
            : telemetry.status === "checking"
            ? "bg-[#14151a] border-[#22242c] text-slate-400"
            : "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-300"
        }`}
        title="Backend Health & Latency Telemetry"
      >
        <span className="relative flex h-2 w-2">
          {telemetry.status === "online" && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              telemetry.status === "online"
                ? "bg-emerald-500"
                : telemetry.status === "checking"
                ? "bg-amber-400"
                : "bg-rose-500"
            }`}
          />
        </span>
        <span className="hidden sm:inline">
          {telemetry.status === "online"
            ? "Core Online"
            : telemetry.status === "checking"
            ? "Checking..."
            : "Backend Offline"}
        </span>
        {telemetry.latencyMs !== null && (
          <span className="font-mono text-[10px] text-indigo-400/90 ml-0.5">
            {telemetry.latencyMs}ms
          </span>
        )}
      </button>

      {/* Tooltip Card */}
      {showTooltip && (
        <div className="absolute top-full mt-2 right-0 w-64 p-3 rounded-2xl bg-[#14161f] border border-[#2b2e3c] shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
          <div className="flex items-center justify-between pb-2 border-b border-[#22242c]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-indigo-400" /> System Telemetry
            </span>
            <button
              onClick={checkHealth}
              className="text-[#6d7178] hover:text-white transition"
              title="Refresh"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
          <div className="mt-2 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#6d7178]">ASGI Engine:</span>
              <span className="text-white font-mono text-[10px]">FastAPI + Uvicorn</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#6d7178]">Storage Mode:</span>
              <span className="text-indigo-300 font-mono text-[10px]">SQLite / pgvector</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#6d7178]">Roundtrip Latency:</span>
              <span className="text-emerald-400 font-mono text-[10px]">
                {telemetry.latencyMs !== null ? `${telemetry.latencyMs} ms` : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

