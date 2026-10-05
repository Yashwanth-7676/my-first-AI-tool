"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  X,
  Trash2,
  UploadCloud,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export interface IndexedDocument {
  id: string;
  title: string;
  created_at: string;
}

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpload: () => void;
}

export function KnowledgeBaseModal({
  isOpen,
  onClose,
  onOpenUpload,
}: KnowledgeBaseModalProps) {
  const [documents, setDocuments] = useState<IndexedDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${apiUrl}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${apiUrl}/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        setStatusMsg("Document removed from knowledge base.");
        setTimeout(() => setStatusMsg(null), 2500);
      }
    } catch (err) {
      console.error("Failed to delete document", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  const filtered = documents.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#14161c] border border-[#262833] rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#22242b] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                Knowledge Base (RAG)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                  {documents.length} Indexed
                </span>
              </h2>
              <p className="text-[11px] text-[#6d7178]">
                Vectors and document embeddings available to Yash AI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDocuments}
              className="p-1.5 rounded-lg hover:bg-[#20222a] text-[#6d7178] hover:text-white transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#20222a] text-[#6d7178] hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex items-center gap-2 mt-4 shrink-0">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#6d7178] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search indexed documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0c0d10] border border-[#262833] text-xs text-white placeholder-[#6d7178] focus:outline-none focus:border-indigo-500/60 transition"
            />
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenUpload();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md shadow-indigo-500/20 shrink-0"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
        </div>

        {/* Status Notification */}
        {statusMsg && (
          <div className="mt-3 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 shrink-0 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-1 custom-scrollbar min-h-[200px]">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-xs text-[#6d7178] space-y-2">
              <span className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
              <span>Loading vector knowledge base...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#6d7178] space-y-3">
              <FileText className="w-8 h-8 text-[#30333f] mx-auto" />
              <p>No documents found in knowledge base.</p>
              <button
                onClick={() => {
                  onClose();
                  onOpenUpload();
                }}
                className="px-4 py-1.5 rounded-xl bg-[#1e2029] hover:bg-[#252833] text-white text-xs font-medium border border-[#313442] transition"
              >
                Upload your first document
              </button>
            </div>
          ) : (
            filtered.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#0d0e13]/70 hover:bg-[#181a22] border border-[#232631] transition group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">
                      {doc.title}
                    </p>
                    <p className="text-[10px] text-[#6d7178] font-mono mt-0.5 truncate">
                      ID: {doc.id.slice(0, 8)}... • Indexed{" "}
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDelete(doc.id, e)}
                  disabled={deletingId === doc.id}
                  className="p-1.5 rounded-lg text-[#6d7178] hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
                  title="Delete from knowledge base"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center pt-4 mt-4 border-t border-[#22242b] shrink-0 text-[11px] text-[#6d7178]">
          <span>Context is injected when RAG is toggled ON.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-[#1c1e26] hover:bg-[#262833] text-white border border-[#2d303c] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
