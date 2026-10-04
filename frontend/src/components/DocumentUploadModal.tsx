"use client";

import React, { useState } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
}

export function DocumentUploadModal({ isOpen, onClose, token }: UploadModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/documents/text`, {
        method: "POST",
        headers,
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status: ${res.status}`);
      }

      setStatus("success");
      setTitle("");
      setContent("");
      setTimeout(() => {
        onClose();
        setStatus("idle");
      }, 1200);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Failed to ingest document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0d1322] border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-100">
              Ingest Document to pgvector
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleUpload} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. System Architecture Guide"
              required
              className="w-full bg-[#131b2e] border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Content / Knowledge Text
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste raw text, documentation, or domain knowledge here..."
              rows={6}
              required
              className="w-full bg-[#131b2e] border border-slate-700/80 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {status === "success" && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800 p-2.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Document successfully vectorized and indexed!
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/30 border border-rose-800 p-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition flex items-center gap-2"
            >
              {loading ? "Embedding..." : "Ingest & Index"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
