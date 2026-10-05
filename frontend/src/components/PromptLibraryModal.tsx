"use client";

import React, { useState } from "react";
import {
  X,
  BookOpen,
  Sparkles,
  Terminal,
  Cpu,
  Shield,
  Zap,
  Layers,
  ArrowRight,
  Search,
  Code2,
} from "lucide-react";

export interface PromptTemplate {
  id: string;
  category: "engineering" | "creative" | "security" | "executive";
  title: string;
  description: string;
  prompt: string;
  tags: string[];
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "webgl-particle-shader",
    category: "creative",
    title: "Anti-Gravity WebGL Particle Field",
    description: "Generates a full-viewport, high-DPI HTML5 canvas shader with mouse gravity physics.",
    tags: ["WebGL", "Canvas", "Physics", "Visuals"],
    prompt:
      "Build a complete, zero-dependency HTML/CSS/JS file containing an interactive 3D particle field under the Anti-Gravity paradigm. Include dark luxury styling (#08080a baseline), Retina High-DPI support via devicePixelRatio, mouse gravitation attraction, and click shockwave ripples. Output clean code ready to run in the live Artifact Canvas.",
  },
  {
    id: "system-design-blueprint",
    category: "engineering",
    title: "Production Distributed Architecture",
    description: "Comprehensive system design specification with caching, queues, and database sharding.",
    tags: ["Architecture", "System Design", "Backend", "Scale"],
    prompt:
      "Design a production-grade, distributed system architecture for a high-throughput event processing platform. Provide an architectural overview, tech stack justification, data flow sequence diagram in Mermaid, database schema with indexes, fault tolerance strategies, and API endpoint contracts.",
  },
  {
    id: "react-state-machine",
    category: "engineering",
    title: "Zero-Dependency Finite State Machine",
    description: "Strictly typed React state machine hook with exhaustive transitions and telemetry.",
    tags: ["React", "TypeScript", "State Machine"],
    prompt:
      "Create a production-grade TypeScript React custom hook implementing a deterministic Finite State Machine (FSM). Include strict discriminated union types for states and events, context transition side-effects, historical transition rollback, and a complete usage example with an interactive UI component.",
  },
  {
    id: "security-threat-audit",
    category: "security",
    title: "Full-Stack Security & Vulnerability Audit",
    description: "Exhaustive review for OWASP vulnerabilities, token leakage, and CORS/CSRF exposure.",
    tags: ["Security", "OWASP", "Pen-testing", "Audit"],
    prompt:
      "Conduct a comprehensive security audit of a modern full-stack web application (FastAPI + Next.js). Outline threat vectors for JWT authentication, database SQL injection, CORS misconfiguration, Server-Side Request Forgery (SSRF), and rate-limiting evasion. Provide concrete code patches and security headers.",
  },
  {
    id: "sql-pgvector-index",
    category: "engineering",
    title: "High-Scale pgvector Semantic Search Pipeline",
    description: "PostgreSQL pgvector schema with HNSW index tuning, cosine similarity, and chunking.",
    tags: ["SQL", "pgvector", "RAG", "Embeddings"],
    prompt:
      "Write an optimized PostgreSQL schema with pgvector extensions. Include HNSW index creation with calibrated m and ef_construction parameters, a cosine distance similarity query with metadata filtering, and an asynchronous Python ingestion pipeline with batch upserts and rollback handling.",
  },
  {
    id: "executive-whitepaper",
    category: "executive",
    title: "Executive Strategic AI Roadmap",
    description: "High-impact technical briefing on enterprise generative AI adoption and ROI.",
    tags: ["Strategy", "Executive", "ROI", "Enterprise"],
    prompt:
      "Draft an authoritative, executive-level technical memorandum evaluating on-premise vs. cloud-hosted LLM deployment. Include total cost of ownership (TCO) breakdown, data governance & privacy compliance (GDPR/HIPAA), latency tradeoffs, and an actionable 4-quarter roadmap.",
  },
  {
    id: "tailwind-dashboard-ui",
    category: "creative",
    title: "Cyberpunk Glassmorphism Analytics Dashboard",
    description: "Self-contained interactive dashboard artifact with animated charts and dark theme.",
    tags: ["UI/UX", "Tailwind", "Artifact", "Frontend"],
    prompt:
      "Generate a single-file, interactive analytics dashboard using Tailwind CSS and native JavaScript. Include glassmorphic cards, live simulated metrics counters, animated SVG line charts, responsive sidebar navigation, and a dark luxury aesthetic (#090a0f). Format as an interactive HTML artifact.",
  },
];

interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (promptText: string, autoSend?: boolean) => void;
}

export function PromptLibraryModal({
  isOpen,
  onClose,
  onSelectPrompt,
}: PromptLibraryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState("");

  if (!isOpen) return null;

  const filteredTemplates = PROMPT_TEMPLATES.filter((t) => {
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#13151b] border border-[#272935] rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#22242c] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>Prompt Engineering Laboratory</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                  {PROMPT_TEMPLATES.length} Presets
                </span>
              </h2>
              <p className="text-[11px] text-[#6d7178]">
                Production-grade prompt templates engineered for architecture, code generation, and visual WebGL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#1e2028] text-[#6d7178] hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Category Pills */}
        <div className="py-3 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#6d7178] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search templates by title, tech stack, or tag..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0c0d12] border border-[#242632] text-xs text-white placeholder-[#6d7178] focus:outline-none focus:border-indigo-500/60 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
            {[
              { id: "all", label: "All Templates" },
              { id: "engineering", label: "Engineering & Architecture" },
              { id: "creative", label: "Creative Technologist & WebGL" },
              { id: "security", label: "Security & Auditing" },
              { id: "executive", label: "Executive & Strategy" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl transition text-[11px] font-medium whitespace-nowrap border ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-sm"
                    : "bg-[#181921] border-[#252834] text-[#8e918f] hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mt-1 custom-scrollbar">
          {filteredTemplates.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#6d7178]">
              No prompt templates matched your criteria.
            </div>
          ) : (
            filteredTemplates.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-[#0e1015]/80 hover:bg-[#161821] border border-[#232530] hover:border-[#353849] transition group flex flex-col justify-between gap-3 shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition flex items-center gap-2">
                      <span>{t.title}</span>
                    </h3>
                    <div className="flex items-center gap-1">
                      {t.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-[#1c1e28] text-slate-400 font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-[#7d818d] leading-relaxed">
                    {t.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1b1c24]">
                  <span className="text-[10px] text-[#555864] font-mono truncate max-w-sm">
                    {t.prompt.slice(0, 70)}...
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onSelectPrompt(t.prompt, false);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#1d1f2a] hover:bg-[#282b3a] text-slate-300 hover:text-white transition"
                    >
                      Insert in Dock
                    </button>
                    <button
                      onClick={() => {
                        onSelectPrompt(t.prompt, true);
                        onClose();
                      }}
                      className="px-3 py-1 rounded-lg text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1 shadow-md shadow-indigo-600/20"
                    >
                      <span>Execute</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
