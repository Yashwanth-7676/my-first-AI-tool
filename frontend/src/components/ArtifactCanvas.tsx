"use client";

import React, { useState } from "react";
import {
  X,
  Code,
  Eye,
  RefreshCw,
  Download,
  Copy,
  Check,
  Monitor,
  Smartphone,
  Tablet,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export interface ArtifactData {
  title: string;
  language: string;
  code: string;
}

interface ArtifactCanvasProps {
  artifact: ArtifactData | null;
  onClose: () => void;
}

export function ArtifactCanvas({ artifact, onClose }: ArtifactCanvasProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [iframeKey, setIframeKey] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!artifact) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext =
      artifact.language === "html"
        ? "html"
        : artifact.language === "typescript"
        ? "ts"
        : artifact.language === "javascript"
        ? "js"
        : artifact.language === "python"
        ? "py"
        : artifact.language === "css"
        ? "css"
        : "txt";
    const blob = new Blob([artifact.code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `artifact-${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Build sandboxed HTML document
  const buildHtmlDoc = (rawCode: string, lang: string) => {
    const trimmed = rawCode.trim();
    if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
      return trimmed;
    }

    if (lang === "svg" || trimmed.startsWith("<svg")) {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0d0e12;
      color: #e3e3e3;
      font-family: system-ui, sans-serif;
    }
  </style>
</head>
<body>
  ${trimmed}
</body>
</html>`;
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 1.5rem;
      background: #0d0e12;
      color: #e3e3e3;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }
  </style>
</head>
<body>
  ${trimmed}
</body>
</html>`;
  };

  const isPreviewable = ["html", "svg", "xml", "jsx", "tsx", "javascript", "web"].includes(
    artifact.language.toLowerCase()
  ) || artifact.code.includes("<") && artifact.code.includes(">");

  const htmlDoc = buildHtmlDoc(artifact.code, artifact.language);

  // Device width class
  const deviceWidthClass =
    device === "mobile"
      ? "max-w-[375px]"
      : device === "tablet"
      ? "max-w-[768px]"
      : "w-full";

  return (
    <div className="h-full w-full flex flex-col bg-[#111217] border-l border-[#242731] shadow-2xl relative z-30 animate-in slide-in-from-right duration-300">
      {/* Top Header Bar */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-[#242731] bg-[#15171d]/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h3 className="text-xs font-semibold text-white truncate flex items-center gap-2">
              <span>{artifact.title || "Interactive Artifact Canvas"}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#20232c] text-indigo-300 font-mono uppercase">
                {artifact.language}
              </span>
            </h3>
          </div>
        </div>

        {/* View Toggle & Actions */}
        <div className="flex items-center gap-2">
          {isPreviewable && (
            <div className="flex items-center bg-[#0c0d10] p-1 rounded-xl border border-[#22242b]">
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition ${
                  activeTab === "preview"
                    ? "bg-[#1f222b] text-white shadow-sm border border-indigo-500/30"
                    : "text-[#6d7178] hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition ${
                  activeTab === "code"
                    ? "bg-[#1f222b] text-white shadow-sm border border-indigo-500/30"
                    : "text-[#6d7178] hover:text-white"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Code</span>
              </button>
            </div>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-[#16181f] hover:bg-[#20232c] text-[#a0a4a8] hover:text-white border border-[#252833] transition"
            title="Copy code"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-[#16181f] hover:bg-[#20232c] text-[#a0a4a8] hover:text-white border border-[#252833] transition"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Close Canvas */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-rose-500/10 text-[#6d7178] hover:text-rose-400 transition"
            title="Close Canvas"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Responsive Viewport Sub-header (when in Preview mode) */}
      {activeTab === "preview" && isPreviewable && (
        <div className="h-10 flex items-center justify-between px-4 bg-[#0e0f13] border-b border-[#22242b] text-xs text-[#6d7178] shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDevice("desktop")}
              className={`p-1.5 rounded-lg transition ${
                device === "desktop" ? "bg-[#1c1e26] text-white" : "hover:text-white"
              }`}
              title="Desktop viewport (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice("tablet")}
              className={`p-1.5 rounded-lg transition ${
                device === "tablet" ? "bg-[#1c1e26] text-white" : "hover:text-white"
              }`}
              title="Tablet viewport (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`p-1.5 rounded-lg transition ${
                device === "mobile" ? "bg-[#1c1e26] text-white" : "hover:text-white"
              }`}
              title="Mobile viewport (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#4d515a]">
              {device === "desktop" ? "100% Fluid" : device === "tablet" ? "768px" : "375px"}
            </span>
            <button
              onClick={() => setIframeKey((prev) => prev + 1)}
              className="p-1.5 rounded-lg hover:bg-[#1a1c24] text-[#6d7178] hover:text-white transition"
              title="Reload sandbox"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Stage */}
      <div className="flex-1 overflow-auto bg-[#0a0b0e] flex items-center justify-center p-3">
        {activeTab === "preview" && isPreviewable ? (
          <div
            className={`h-full ${deviceWidthClass} transition-all duration-300 rounded-2xl overflow-hidden border border-[#232631] shadow-2xl bg-[#0d0e12] flex flex-col`}
          >
            <iframe
              key={iframeKey}
              srcDoc={htmlDoc}
              sandbox="allow-scripts allow-modals allow-same-origin"
              className="w-full h-full border-none rounded-2xl"
              title={artifact.title}
            />
          </div>
        ) : (
          <div className="w-full h-full overflow-auto rounded-2xl border border-[#232631] bg-[#131419] p-4 text-xs font-mono text-[#dcdfe4] leading-relaxed custom-scrollbar">
            <pre className="whitespace-pre">
              <code>{artifact.code}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
