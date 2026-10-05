"use client";

import React from "react";
import { X, Keyboard, Command } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: "Ctrl + K", desc: "Focus prompt input dock" },
  { key: "/", desc: "Open Slash Command palette" },
  { key: "Enter", desc: "Send message" },
  { key: "Shift + Enter", desc: "Insert new line in textarea" },
  { key: "Ctrl + /", desc: "Toggle keyboard shortcuts cheat sheet" },
  { key: "Escape", desc: "Close open modals & Artifact Canvas" },
];

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#14161c] border border-[#262833] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#22242b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Keyboard Shortcuts
              </h2>
              <p className="text-[11px] text-[#6d7178]">
                Power-user shortcuts for Yash AI 2.0
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

        {/* Shortcuts List */}
        <div className="mt-4 space-y-2">
          {SHORTCUTS.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c0d10] border border-[#232631]"
            >
              <span className="text-xs text-[#c4c7c5]">{item.desc}</span>
              <kbd className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg bg-[#1a1c24] text-indigo-300 border border-[#2c2f3c] shadow-inner">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 mt-4 border-t border-[#22242b]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md shadow-indigo-500/20"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
