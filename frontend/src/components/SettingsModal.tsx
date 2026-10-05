"use client";

import React, { useState } from "react";
import { X, Sliders, Sparkles, Terminal, BookOpen, Brain, Trash2, Check } from "lucide-react";

export interface PersonaConfig {
  id: string;
  name: string;
  description: string;
  icon: any;
  systemPrompt: string;
  temperature: number;
}

export const PERSONA_PRESETS: PersonaConfig[] = [
  {
    id: "creative-technologist",
    name: "Creative Technologist",
    description: "Anti-Gravity WebGL engineer crafting cinematic, visual, and interactive code.",
    icon: Sparkles,
    systemPrompt: "You are Yash AI, an elite AI collaborator, WebGL engineer, and Creative Technologist operating under the Anti-Gravity paradigm. Deliver cinematic, ultra-responsive, and visually staggering code.",
    temperature: 0.7,
  },
  {
    id: "software-architect",
    name: "Senior Software Architect",
    description: "Clean architecture, strict types, optimal time complexity, and security.",
    icon: Terminal,
    systemPrompt: "You are Yash AI, a Principal Software Architect. Write production-grade, strictly typed, modular, and performant code with zero placeholders.",
    temperature: 0.2,
  },
  {
    id: "ai-researcher",
    name: "AI & Math Researcher",
    description: "Deep theoretical insights, algorithms, vector mathematics, and derivation.",
    icon: Brain,
    systemPrompt: "You are Yash AI, a Senior Research Scientist specializing in machine learning, mathematics, and high-dimensional vector spaces.",
    temperature: 0.3,
  },
  {
    id: "concise-executive",
    name: "Concise Executive",
    description: "Direct bullet points, strategic analysis, and immediate clarity.",
    icon: BookOpen,
    systemPrompt: "You are Yash AI, an executive strategic advisor. Provide high-impact summaries, actionable insights, and bulleted recommendations with zero fluff.",
    temperature: 0.4,
  },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePersona: PersonaConfig;
  onSelectPersona: (persona: PersonaConfig) => void;
  onClearAllChats: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  activePersona,
  onSelectPersona,
  onClearAllChats,
}: SettingsModalProps) {
  const [temperature, setTemperature] = useState(activePersona.temperature);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#14161c] border border-[#262833] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#22242b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Intelligence Engine Settings
              </h2>
              <p className="text-[11px] text-[#6d7178]">
                Configure AI persona, model temperature, and conversation state
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#20222a] text-[#6d7178] hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Persona Presets Grid */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Active Persona Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PERSONA_PRESETS.map((p) => {
                const Icon = p.icon;
                const isSelected = activePersona.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPersona({ ...p, temperature });
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex items-start gap-3 ${
                      isSelected
                        ? "bg-indigo-500/15 border-indigo-500/50 shadow-md shadow-indigo-500/10 text-white"
                        : "bg-[#0d0e13]/60 hover:bg-[#181a22] border-[#242732] text-[#8e918f] hover:text-white"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isSelected
                          ? "bg-indigo-500/20 text-indigo-300"
                          : "bg-[#1d1f28] text-slate-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white truncate">
                          {p.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-[#6d7178] mt-0.5 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Temperature Slider */}
          <div className="p-4 rounded-2xl bg-[#0d0e13]/60 border border-[#242732] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Creativity / Temperature</span>
              <span className="font-mono text-indigo-400 font-semibold">{temperature}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setTemperature(val);
                onSelectPersona({ ...activePersona, temperature: val });
              }}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#6d7178]">
              <span>Precise & Deterministic (0.0)</span>
              <span>Imaginative & Creative (1.0)</span>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-300">Clear All Conversations</p>
              <p className="text-[10px] text-[#6d7178]">Purge all chat history from local browser cache</p>
            </div>
            {showClearConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClearAllChats();
                    setShowClearConfirm(false);
                    onClose();
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition"
                >
                  Yes, Clear
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-1 text-[11px] text-[#8e918f] hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-4 mt-4 border-t border-[#22242b]">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
