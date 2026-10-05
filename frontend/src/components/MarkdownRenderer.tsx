"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal, Eye, Sparkles } from "lucide-react";
import { ArtifactData } from "./ArtifactCanvas";

interface MarkdownRendererProps {
  content: string;
  onOpenArtifact?: (artifact: ArtifactData) => void;
}

export function MarkdownRenderer({ content, onOpenArtifact }: MarkdownRendererProps) {
  if (!content) return null;

  // Split content by code blocks: ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_\-\+]*)\n([\s\S]*?)(?:```|$)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  let blockIdx = 0;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.slice(lastIndex, match.index);
    if (textBefore) {
      parts.push(
        <TextSection key={`text-${blockIdx}-${lastIndex}`} rawText={textBefore} />
      );
    }

    const language = match[1]?.trim() || "code";
    const codeSnippet = match[2] ?? "";
    parts.push(
      <CodeBlock
        key={`code-${blockIdx}`}
        language={language}
        code={codeSnippet}
        onOpenArtifact={onOpenArtifact}
      />
    );

    lastIndex = match.index + match[0].length;
    blockIdx++;
  }

  const remaining = content.slice(lastIndex);
  if (remaining) {
    parts.push(<TextSection key={`text-remaining-${lastIndex}`} rawText={remaining} />);
  }

  return <div className="space-y-2 text-sm leading-relaxed">{parts}</div>;
}

function CodeBlock({
  language,
  code,
  onOpenArtifact,
}: {
  language: string;
  code: string;
  onOpenArtifact?: (artifact: ArtifactData) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-[#2d2e30] bg-[#16171a] shadow-lg">
      <div className="flex items-center justify-between border-b border-[#2d2e30]/80 bg-[#1e2024] px-4 py-2 text-xs text-[#a0a4a8]">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-indigo-400" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-300">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-[#c4c7c5] transition hover:bg-[#282a2c] hover:text-white"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-4 font-mono text-xs text-[#e1e4e8] leading-relaxed">
        <pre className="whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function TextSection({ rawText }: { rawText: string }) {
  const lines = rawText.split("\n");
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = (key: string) => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={key} className="my-2 space-y-1 pl-1">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Horizontal Rule
    if (trimmed === "---" || trimmed === "***") {
      flushList(`list-hr-${i}`);
      elements.push(<hr key={`hr-${i}`} className="my-4 border-[#2d2e30]" />);
      continue;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      flushList(`list-h3-${i}`);
      elements.push(
        <h3 key={`h3-${i}`} className="mt-4 mb-1.5 text-base font-semibold text-white tracking-tight">
          {formatInline(trimmed.slice(4))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushList(`list-h2-${i}`);
      elements.push(
        <h2 key={`h2-${i}`} className="mt-5 mb-2 text-lg font-bold text-white tracking-tight">
          {formatInline(trimmed.slice(3))}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith("# ")) {
      flushList(`list-h1-${i}`);
      elements.push(
        <h1 key={`h1-${i}`} className="mt-6 mb-2.5 text-xl font-bold text-white tracking-tight">
          {formatInline(trimmed.slice(2))}
        </h1>
      );
      continue;
    }
    if (trimmed.startsWith("#### ")) {
      flushList(`list-h4-${i}`);
      elements.push(
        <h4 key={`h4-${i}`} className="mt-3 mb-1 text-sm font-semibold text-indigo-300">
          {formatInline(trimmed.slice(5))}
        </h4>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      flushList(`list-quote-${i}`);
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-2 border-l-2 border-indigo-400 bg-indigo-500/10 px-3 py-1.5 text-slate-300 italic text-xs rounded-r-lg"
        >
          {formatInline(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Bullet / Numbered Lists
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)/);
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);

    if (bulletMatch) {
      inList = true;
      listItems.push(
        <li key={`li-${i}`} className="flex items-start gap-2 text-slate-300">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
          <span className="flex-1">{formatInline(bulletMatch[1])}</span>
        </li>
      );
      continue;
    }

    if (numMatch) {
      inList = true;
      listItems.push(
        <li key={`num-li-${i}`} className="flex items-start gap-2 text-slate-300">
          <span className="shrink-0 font-mono text-xs font-semibold text-indigo-400">
            {numMatch[1]}.
          </span>
          <span className="flex-1">{formatInline(numMatch[2])}</span>
        </li>
      );
      continue;
    }

    flushList(`list-flush-${i}`);

    if (!trimmed) {
      // Empty line spacing
      elements.push(<div key={`empty-${i}`} className="h-2" />);
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={`p-${i}`} className="text-slate-200">
        {formatInline(line)}
      </p>
    );
  }

  flushList(`list-end`);

  return <div className="space-y-1">{elements}</div>;
}

/**
 * Parses inline markdown: **bold**, *italic*, `code`, and [links](url)
 */
function formatInline(text: string): React.ReactNode[] {
  // Regex tokenizing inline backticks, bold, italic, and links
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={`code-inline-${keyIdx++}`}
          className="rounded bg-[#222428] px-1.5 py-0.5 font-mono text-[12px] text-indigo-300 border border-[#3c4043]/50"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={`bold-${keyIdx++}`} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={`italic-${keyIdx++}`} className="italic text-slate-300">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={`link-${keyIdx++}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition"
          >
            {linkMatch[1]}
          </a>
        );
      }
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}
