"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Paperclip,
  Plus,
  MessageSquare,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  Zap,
  Code,
  Compass,
  Lightbulb,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  Download,
  Search,
  Edit2,
  Sliders,
  Cpu,
  Pin,
  PinOff,
  Wand2,
  Database,
  HelpCircle,
} from "lucide-react";
import { DocumentUploadModal } from "../components/DocumentUploadModal";
import { KnowledgeBaseModal } from "../components/KnowledgeBaseModal";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { AntiGravityCanvas } from "../components/AntiGravityCanvas";
import { ArtifactCanvas, ArtifactData } from "../components/ArtifactCanvas";
import { SettingsModal, PERSONA_PRESETS, PersonaConfig } from "../components/SettingsModal";
import { KeyboardShortcutsModal } from "../components/KeyboardShortcutsModal";
import { VoiceVisualizer } from "../components/VoiceVisualizer";
import { sounds } from "../utils/soundEffects";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  modelUsed?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  isPinned?: boolean;
}

interface AIModel {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon: any;
  color: string;
}

const AVAILABLE_MODELS: AIModel[] = [
  {
    id: "yash-quantum",
    name: "Yash AI 2.0 Quantum",
    badge: "Ultra-Fast",
    description: "Next-gen multimodal architecture with sub-second token latency.",
    icon: Zap,
    color: "text-amber-400",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o Omniscience",
    badge: "OpenAI Flagship",
    description: "Multi-domain reasoning, complex math, and state-of-the-art logic.",
    icon: Sparkles,
    color: "text-emerald-400",
  },
  {
    id: "claude-3-5",
    name: "Claude 3.5 Sonnet",
    badge: "Nuanced Writing",
    description: "Unmatched code architecture, technical writing, and human nuance.",
    icon: Compass,
    color: "text-indigo-400",
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    badge: "Chain of Thought",
    description: "Autonomous mathematical verification and deep reasoning steps.",
    icon: Lightbulb,
    color: "text-sky-400",
  },
  {
    id: "ollama-local",
    name: "Ollama (Llama 3.2)",
    badge: "100% Offline / Private",
    description: "Local inference running on http://localhost:11434 with zero data leak.",
    icon: Cpu,
    color: "text-purple-400",
  },
];

const SLASH_COMMANDS = [
  {
    command: "/canvas",
    title: "Interactive Canvas UI",
    description: "Generate interactive HTML/Tailwind components with live sandboxed preview",
    prompt: "Create an interactive HTML and Tailwind CSS glassmorphic card component with hover animations and a live preview.",
  },
  {
    command: "/code",
    title: "Production Code Architecture",
    description: "Produce robust, strictly typed full-stack code with architectural breakdown",
    prompt: "Write a high-performance Python FastAPI endpoint with async database queries and type annotations.",
  },
  {
    command: "/explain",
    title: "Conceptual Intuition",
    description: "Deep, intuitive mental models and step-by-step breakdown",
    prompt: "Explain how neural networks learn in intuitive, visual terms with real-world analogies.",
  },
  {
    command: "/fix",
    title: "Debug & Optimize",
    description: "Identify performance bottlenecks, memory leaks, and logic errors",
    prompt: "Review and optimize this code for minimum memory footprint and async efficiency: ",
  },
  {
    command: "/rag",
    title: "Vector Document Retrieval",
    description: "Ground answers in uploaded knowledge documents using vector embeddings",
    prompt: "Based on our indexed project documents, summarize the system architecture and key design patterns.",
  },
];

const STARTER_PROMPTS = [
  {
    icon: Code,
    title: "Interactive Canvas Component",
    prompt: "Create an interactive HTML and Tailwind CSS glassmorphic pricing card with hover animations and a live preview.",
    color: "text-emerald-400 bg-emerald-500/10",
  },
  {
    icon: Lightbulb,
    title: "Explain a concept",
    prompt: "Explain how neural networks learn in intuitive, visual terms with real-world analogies.",
    color: "text-amber-400 bg-amber-500/10",
  },
  {
    icon: Compass,
    title: "Explore ideas",
    prompt: "Brainstorm 5 innovative AI startup ideas using Retrieval Augmented Generation (RAG) and local vector search.",
    color: "text-sky-400 bg-sky-500/10",
  },
  {
    icon: FileText,
    title: "Draft content",
    prompt: "Draft an engaging pitch email to tech investors for Yash AI 2.0 full-stack conversational platform.",
    color: "text-purple-400 bg-purple-500/10",
  },
];

export default function ChatDashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string>("");
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [useRag, setUseRag] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Slash commands popover
  const [showSlashMenu, setShowSlashMenu] = useState(false);

  // Artifact Canvas State
  const [activeArtifact, setActiveArtifact] = useState<ArtifactData | null>(null);

  // Model & Persona State
  const [selectedModel, setSelectedModel] = useState<AIModel>(AVAILABLE_MODELS[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [activePersona, setActivePersona] = useState<PersonaConfig>(PERSONA_PRESETS[0]);

  // Search & Edit state
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");

  // Voice Interaction States
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Thumbs reactions
  const [reactions, setReactions] = useState<{ [msgId: string]: "up" | "down" }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        textareaRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsModelDropdownOpen(false);
        setIsUploadModalOpen(false);
        setIsKnowledgeBaseOpen(false);
        setIsSettingsOpen(false);
        setIsShortcutsOpen(false);
        setShowSlashMenu(false);
      }
    };
    window.addEventListener("keydown", handleKeyDownGlobal);
    return () => window.removeEventListener("keydown", handleKeyDownGlobal);
  }, []);

  // Monitor Slash command trigger
  useEffect(() => {
    if (input.trim() === "/" || (input.startsWith("/") && !input.includes(" "))) {
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  }, [input]);

  // Load conversations from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("yash_ai_conversations");
      if (saved) {
        const parsed: Conversation[] = JSON.parse(saved);
        if (parsed.length > 0) {
          setConversations(parsed);
          setCurrentId(parsed[0].id);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load conversations", e);
    }

    const initialId = Date.now().toString();
    const newConv: Conversation = {
      id: initialId,
      title: "New chat",
      messages: [],
      updatedAt: Date.now(),
    };
    setConversations([newConv]);
    setCurrentId(initialId);
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      try {
        localStorage.setItem("yash_ai_conversations", JSON.stringify(conversations));
      } catch (e) {
        console.error("Failed to save conversations", e);
      }
    }
  }, [conversations]);

  const activeConversation =
    conversations.find((c) => c.id === currentId) || conversations[0];
  const messages = activeConversation?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Handle Textarea Auto-Resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        220
      )}px`;
    }
  }, [input]);

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newConv: Conversation = {
      id: newId,
      title: "New chat",
      messages: [],
      updatedAt: Date.now(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentId(newId);
    setInput("");
  };

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  const handleClearAllChats = () => {
    const freshId = Date.now().toString();
    const fallback: Conversation = {
      id: freshId,
      title: "New chat",
      messages: [],
      updatedAt: Date.now(),
    };
    setConversations([fallback]);
    setCurrentId(freshId);
    try {
      localStorage.removeItem("yash_ai_conversations");
    } catch (e) {
      // ignore
    }
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (filtered.length === 0) {
        const fallback: Conversation = {
          id: Date.now().toString(),
          title: "New chat",
          messages: [],
          updatedAt: Date.now(),
        };
        setCurrentId(fallback.id);
        return [fallback];
      }
      if (currentId === id) {
        setCurrentId(filtered[0].id);
      }
      return filtered;
    });
  };

  const startRenameChat = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTitleId(conv.id);
    setEditingTitleValue(conv.title);
  };

  const saveRenameChat = (id: string) => {
    if (!editingTitleValue.trim()) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: editingTitleValue.trim() } : c))
    );
    setEditingTitleId(null);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Magic Wand Prompt Enhancer
  const enhancePrompt = () => {
    if (!input.trim()) return;
    const current = input.trim();
    const enhanced = `Act as an expert technical specialist. Provide an in-depth, production-grade implementation and analytical solution for: "${current}". Include complete code with strict typing, edge-case mitigation, architectural diagrams where helpful, and performance optimization notes.`;
    setInput(enhanced);
  };

  // Speech Recognition (Dictation)
  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is supported natively in Google Chrome and Microsoft Edge.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e: any) => {
        console.error("Speech error", e);
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Text to Speech
  const toggleSpeak = (text: string, id: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }

    if (speakingMsgId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/```[\s\S]*?```/g, "Code block omitted.")
      .replace(/[#*`>_-]/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Stop Generation
  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  };

  // Export Chat
  const exportChat = (format: "markdown" | "json") => {
    if (messages.length === 0) return;
    let dataUri = "";
    const cleanTitle = (activeConversation.title || "conversation")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");
    let filename = `yash-ai-${cleanTitle}`;

    if (format === "markdown") {
      let md = `# ${activeConversation.title}\n*Exported from Yash AI on ${new Date().toLocaleString()}*\n*Model: ${selectedModel.name} | Persona: ${activePersona.name}*\n\n---\n\n`;
      messages.forEach((m) => {
        const author = m.role === "user" ? "### 👤 User" : `### ✦ Yash AI (${m.modelUsed || selectedModel.name})`;
        md += `${author} (${m.timestamp})\n\n${m.content}\n\n---\n\n`;
      });
      dataUri = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
      filename += ".md";
    } else {
      dataUri =
        "data:application/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(activeConversation, null, 2));
      filename += ".json";
    }

    const link = document.createElement("a");
    link.setAttribute("href", dataUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sendMessage = async (queryText: string) => {
    if (!queryText.trim() || isStreaming) return;

    setShowSlashMenu(false);
    const userMsgId = Date.now().toString();
    const assistantMsgId = (Date.now() + 1).toString();

    const userMessage: Message = {
      id: userMsgId,
      role: "user",
      content: queryText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const initialAssistantMessage: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      modelUsed: selectedModel.name,
    };

    const isFirstMessage = messages.length === 0;
    const newTitle = isFirstMessage
      ? queryText.trim().slice(0, 30) + (queryText.trim().length > 30 ? "..." : "")
      : activeConversation.title;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === currentId) {
          return {
            ...c,
            title: newTitle,
            updatedAt: Date.now(),
            messages: [...c.messages, userMessage, initialAssistantMessage],
          };
        }
        return c;
      })
    );

    setInput("");
    setIsStreaming(true);
    sounds.playSend();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let completedCleanly = false;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const response = await fetch(`${apiUrl}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          query: queryText,
          use_rag: useRag,
          model: selectedModel.id,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
        throw new Error(errJson.detail || `Server status ${response.status}`);
      }

      if (!response.body) throw new Error("No response stream available");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === currentId) {
              const updatedMsgs = [...c.messages];
              const lastMsg = updatedMsgs[updatedMsgs.length - 1];
              if (lastMsg && lastMsg.role === "assistant") {
                lastMsg.content += chunk;
              }
              return { ...c, messages: updatedMsgs };
            }
            return c;
          })
        );
      }
      completedCleanly = true;
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Stream aborted by user");
      } else {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === currentId) {
              const updatedMsgs = [...c.messages];
              const lastMsg = updatedMsgs[updatedMsgs.length - 1];
              if (lastMsg && lastMsg.role === "assistant") {
                lastMsg.content = `[Notice: Could not connect to Yash AI backend API at http://localhost:8000. Start backend using \`python run.py\`]\n\nDetails: ${err.message}`;
              }
              return { ...c, messages: updatedMsgs };
            }
            return c;
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
      if (completedCleanly) {
        sounds.playReceive();
      }
    }
  };

  const handleRegenerate = () => {
    if (messages.length < 2 || isStreaming) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === currentId) {
            const trimmed = c.messages.slice(0, -1);
            return { ...c, messages: trimmed };
          }
          return c;
        })
      );
      sendMessage(lastUserMsg.content);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedConversations = filteredConversations.filter((c) => c.isPinned);
  const regularConversations = filteredConversations.filter((c) => !c.isPinned);

  return (
    <div className="relative flex h-screen w-full bg-[#0a0a0c] text-[#e3e3e3] font-sans overflow-hidden antialiased selection:bg-indigo-500/30 selection:text-white">
      {/* Dynamic Ambient AntiGravity Canvas Background */}
      <AntiGravityCanvas />

      {/* Upload Document Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {/* Knowledge Base Manager Modal */}
      <KnowledgeBaseModal
        isOpen={isKnowledgeBaseOpen}
        onClose={() => setIsKnowledgeBaseOpen(false)}
        onOpenUpload={() => setIsUploadModalOpen(true)}
      />

      {/* Settings & Persona Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activePersona={activePersona}
        onSelectPersona={setActivePersona}
        onClearAllChats={handleClearAllChats}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Collapsible Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0 -translate-x-full"
        } transition-all duration-300 ease-in-out bg-[#111215]/95 backdrop-blur-xl border-r border-[#22242a] flex flex-col justify-between shrink-0 overflow-hidden relative z-20 shadow-2xl`}
      >
        <div className="flex flex-col h-full p-3 overflow-hidden">
          {/* Top Brand Bar */}
          <div className="space-y-3 pb-2">
            <div className="flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 text-xs">
                  ✦
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                    Yash AI
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono">
                      2.0
                    </span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#1f2127] text-[#a0a4a8] hover:text-white transition"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className="flex w-full items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#1c1e24] to-[#252831] hover:from-[#252831] hover:to-[#2c303b] text-white text-xs font-medium transition shadow-md border border-[#2d303a] group"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400 group-hover:rotate-90 transition-transform duration-300" />
                <span>New chat</span>
              </div>
              <span className="text-[10px] text-[#6d7178] font-mono">Ctrl+K</span>
            </button>

            {/* Search History Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#6d7178] absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-[#16181d] border border-[#262830] text-xs text-white placeholder-[#6d7178] focus:outline-none focus:border-indigo-500/60 transition"
              />
            </div>
          </div>

          {/* Conversations History */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 mt-2 custom-scrollbar">
            {/* Pinned Section */}
            {pinnedConversations.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] font-semibold tracking-wider uppercase text-amber-400/80 px-3 py-1 flex items-center gap-1.5">
                  <Pin className="w-3 h-3" />
                  <span>Pinned</span>
                </div>
                {pinnedConversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    currentId={currentId}
                    editingTitleId={editingTitleId}
                    editingTitleValue={editingTitleValue}
                    onSelect={() => setCurrentId(conv.id)}
                    onTogglePin={(e) => handleTogglePin(conv.id, e)}
                    onStartRename={(e) => startRenameChat(conv, e)}
                    onSaveRename={() => saveRenameChat(conv.id)}
                    onDelete={(e) => handleDeleteChat(conv.id, e)}
                    setEditingTitleValue={setEditingTitleValue}
                  />
                ))}
              </div>
            )}

            {/* Recent Section */}
            <div className="space-y-1">
              <div className="text-[10px] font-semibold tracking-wider uppercase text-[#6d7178] px-3 py-1">
                Recent
              </div>
              {regularConversations.length === 0 && pinnedConversations.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-[#6d7178]">
                  No conversations found
                </div>
              ) : (
                regularConversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    currentId={currentId}
                    editingTitleId={editingTitleId}
                    editingTitleValue={editingTitleValue}
                    onSelect={() => setCurrentId(conv.id)}
                    onTogglePin={(e) => handleTogglePin(conv.id, e)}
                    onStartRename={(e) => startRenameChat(conv, e)}
                    onSaveRename={() => saveRenameChat(conv.id)}
                    onDelete={(e) => handleDeleteChat(conv.id, e)}
                    setEditingTitleValue={setEditingTitleValue}
                  />
                ))
              )}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="border-t border-[#22242a] pt-3 space-y-2 mt-auto">
            {messages.length > 0 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => exportChat("markdown")}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#16181d] hover:bg-[#20222a] text-[11px] text-[#a0a4a8] hover:text-white border border-[#262830] transition"
                  title="Export conversation as Markdown"
                >
                  <Download className="w-3 h-3 text-indigo-400" />
                  <span>Export MD</span>
                </button>
                <button
                  onClick={() => exportChat("json")}
                  className="flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-[#16181d] hover:bg-[#20222a] text-[11px] text-[#a0a4a8] hover:text-white border border-[#262830] transition"
                  title="Export conversation as JSON"
                >
                  <span>JSON</span>
                </button>
              </div>
            )}

            {/* Knowledge Base & Upload Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsKnowledgeBaseOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-xl bg-[#16181d] hover:bg-[#20222a] text-[#a0a4a8] hover:text-white border border-[#262830] transition shadow-sm"
                title="View and manage indexed documents"
              >
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>Knowledge Base</span>
              </button>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="p-2 rounded-xl bg-[#16181d] hover:bg-[#20222a] text-[#a0a4a8] hover:text-white border border-[#262830] transition shadow-sm"
                title="Upload document (RAG)"
              >
                <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            </div>

            {/* User Profile Tile */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#14151a] border border-[#202228] text-xs">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-[11px] shadow-sm">
                Y
              </div>
              <div className="truncate flex-1">
                <p className="text-[11px] font-semibold text-white truncate">Yashwanth</p>
                <p className="text-[10px] text-indigo-400/80 font-mono">
                  {activePersona.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area (Chat + Split Artifact Canvas) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Stage */}
        <main
          className={`flex flex-col h-full relative overflow-hidden bg-[#0c0d10]/80 backdrop-blur-2xl z-10 transition-all duration-300 ${
            activeArtifact ? "w-full lg:w-[55%]" : "w-full"
          }`}
        >
          {/* Top Header */}
          <header className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-[#22242a]/60 shrink-0 bg-[#0e0f13]/60 backdrop-blur-md">
            <div className="flex items-center gap-3">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-1.5 rounded-lg hover:bg-[#1c1e24] text-[#a0a4a8] hover:text-white transition"
                  title="Open sidebar"
                >
                  <PanelLeft className="w-4 h-4" />
                </button>
              )}

              {/* Model Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#171920] hover:bg-[#1f222b] border border-[#292c36] text-xs font-medium text-white transition shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-semibold">{selectedModel.name}</span>
                    <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                      {selectedModel.badge}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6d7178]" />
                </button>

                {/* Dropdown Menu */}
                {isModelDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsModelDropdownOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-[#16181e] border border-[#2b2e38] shadow-2xl z-40 p-2 space-y-1 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#6d7178] border-b border-[#22242b]">
                        Select Intelligence Engine
                      </div>
                      {AVAILABLE_MODELS.map((model) => {
                        const Icon = model.icon;
                        const isSelected = selectedModel.id === model.id;
                        return (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model);
                              setIsModelDropdownOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-3 ${
                              isSelected
                                ? "bg-indigo-500/15 border border-indigo-500/30 text-white"
                                : "hover:bg-[#1f222a] text-[#a0a4a8] hover:text-white"
                            }`}
                          >
                            <div className={`p-2 rounded-lg bg-[#22252e] ${model.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-xs text-white">
                                  {model.name}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#252833] text-indigo-300 font-mono">
                                  {model.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#6d7178] mt-0.5 line-clamp-2 leading-tight">
                                {model.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Header Right Actions: Shortcuts, Settings & RAG Pill */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsShortcutsOpen(true)}
                className="p-2 rounded-xl bg-[#171920] hover:bg-[#1f222b] text-[#a0a4a8] hover:text-white border border-[#292c36] transition shadow-sm"
                title="Keyboard Shortcuts (Ctrl+/)"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-xl bg-[#171920] hover:bg-[#1f222b] text-[#a0a4a8] hover:text-white border border-[#292c36] transition shadow-sm"
                title="Intelligence Settings & Persona"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setUseRag(!useRag)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition shadow-sm ${
                  useRag
                    ? "bg-indigo-500/15 border-indigo-500/50 text-indigo-300"
                    : "bg-[#171920] border-[#292c36] text-[#6d7178]"
                }`}
                title="Toggle Knowledge Retrieval from your uploaded documents"
              >
                <Zap className="w-3 h-3 text-indigo-400" />
                <span>RAG: {useRag ? "ACTIVE" : "BYPASS"}</span>
              </button>
            </div>
          </header>

          {/* Message Container / Hero Welcome Screen */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="max-w-3xl mx-auto h-full flex flex-col justify-center pb-12">
                <div className="space-y-3 mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Anti-Gravity Intelligence Core 2.0
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                      Hello, Yashwanth
                    </span>
                  </h1>
                  <p className="text-xl sm:text-2xl font-medium text-[#6d7178]">
                    What would you like to build or explore today?
                  </p>
                </div>

                {/* Starter Prompt Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {STARTER_PROMPTS.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => sendMessage(item.prompt)}
                        className="p-4 rounded-2xl bg-[#14151b]/80 hover:bg-[#1a1c24] border border-[#242630] hover:border-indigo-500/40 text-left transition flex flex-col justify-between h-32 group shadow-lg backdrop-blur-sm"
                      >
                        <p className="text-xs text-[#a0a4a8] group-hover:text-white line-clamp-2 leading-relaxed">
                          {item.prompt}
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[11px] font-medium text-[#6d7178]">
                            {item.title}
                          </span>
                          <div className={`p-2 rounded-xl ${item.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-6 pb-6">
                {messages.map((msg, index) => {
                  const isAssistant = msg.role === "assistant";
                  const isLastMsg = index === messages.length - 1;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3.5 group ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {isAssistant && (
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shrink-0 text-xs shadow-lg shadow-indigo-500/20 mt-1">
                          ✦
                        </div>
                      )}

                      <div
                        className={`max-w-[88%] sm:max-w-[82%] rounded-2xl ${
                          msg.role === "user"
                            ? "bg-[#1c1e26] text-white px-4 py-3 rounded-tr-sm border border-[#2d303c] shadow-md"
                            : "bg-transparent text-[#e3e3e3] px-0 py-1"
                        }`}
                      >
                        {msg.content ? (
                          isAssistant ? (
                            <MarkdownRenderer
                              content={msg.content}
                              onOpenArtifact={(art: ArtifactData) => setActiveArtifact(art)}
                            />
                          ) : (
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                              {msg.content}
                            </div>
                          )
                        ) : (
                          <div className="flex items-center gap-2 py-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse [animation-delay:0.2s]"></span>
                            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse [animation-delay:0.4s]"></span>
                            <span className="text-xs text-[#6d7178] ml-1 font-mono">
                              Synthesizing...
                            </span>
                          </div>
                        )}

                        {/* Actions on Assistant Messages */}
                        {isAssistant && msg.content && (
                          <div className="flex items-center justify-between mt-3 pt-2 text-[#6d7178] border-t border-[#22242a]/30">
                            <div className="flex items-center gap-1.5">
                              {/* Copy Message */}
                              <button
                                onClick={() => copyToClipboard(msg.content, msg.id)}
                                className="p-1.5 rounded-lg hover:bg-[#1a1c24] hover:text-white transition"
                                title="Copy response"
                              >
                                {copiedId === msg.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Read Aloud (TTS) */}
                              <button
                                onClick={() => toggleSpeak(msg.content, msg.id)}
                                className={`p-1.5 rounded-lg transition ${
                                  speakingMsgId === msg.id
                                    ? "bg-indigo-500/20 text-indigo-400"
                                    : "hover:bg-[#1a1c24] hover:text-white"
                                }`}
                                title={speakingMsgId === msg.id ? "Stop voice" : "Read aloud"}
                              >
                                {speakingMsgId === msg.id ? (
                                  <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                                ) : (
                                  <Volume2 className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Regenerate Response */}
                              {isLastMsg && !isStreaming && (
                                <button
                                  onClick={handleRegenerate}
                                  className="p-1.5 rounded-lg hover:bg-[#1a1c24] hover:text-white transition"
                                  title="Regenerate response"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Thumbs Feedback */}
                              <button
                                onClick={() =>
                                  setReactions((prev) => ({
                                    ...prev,
                                    [msg.id]: prev[msg.id] === "up" ? ("" as any) : "up",
                                  }))
                                }
                                className={`p-1.5 rounded-lg transition ${
                                  reactions[msg.id] === "up"
                                    ? "text-emerald-400 bg-emerald-500/10"
                                    : "hover:bg-[#1a1c24] hover:text-white"
                                }`}
                                title="Helpful"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() =>
                                  setReactions((prev) => ({
                                    ...prev,
                                    [msg.id]: prev[msg.id] === "down" ? ("" as any) : "down",
                                  }))
                                }
                                className={`p-1.5 rounded-lg transition ${
                                  reactions[msg.id] === "down"
                                    ? "text-rose-400 bg-rose-500/10"
                                    : "hover:bg-[#1a1c24] hover:text-white"
                                }`}
                                title="Unhelpful"
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Telemetry Badge */}
                            <span className="text-[10px] font-mono text-[#545761]">
                              ✦ {msg.modelUsed || selectedModel.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Gemini / ChatGPT Floating Input Bar with Slash Commands */}
          <div className="p-4 sm:p-6 pt-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/90 to-transparent shrink-0 relative">
            <div className="max-w-3xl mx-auto relative">
              {/* Slash Command Autocomplete Popover */}
              {showSlashMenu && (
                <div className="absolute bottom-full mb-3 left-0 right-0 max-w-lg bg-[#14161d] border border-[#2b2e3c] rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#6d7178] border-b border-[#22242c] flex items-center justify-between">
                    <span>Quick Commands</span>
                    <span className="font-mono text-[9px] text-slate-500">ESC to dismiss</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {SLASH_COMMANDS.map((item) => (
                      <button
                        key={item.command}
                        onClick={() => {
                          setInput(item.prompt);
                          setShowSlashMenu(false);
                          textareaRef.current?.focus();
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-[#1f222b] transition flex items-center justify-between text-xs group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20 text-[11px]">
                            {item.command}
                          </span>
                          <div>
                            <p className="font-semibold text-white group-hover:text-indigo-300 transition">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-[#6d7178] truncate max-w-xs">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Real-time Voice Audio Visualizer */}
              <VoiceVisualizer isListening={isListening} onStop={toggleListening} />

              <form
                onSubmit={handleSubmit}
                className={`relative flex flex-col bg-[#14161c]/90 backdrop-blur-xl border ${
                  isListening
                    ? "border-rose-500/80 shadow-rose-500/20 shadow-2xl"
                    : "border-[#282a35] hover:border-[#3a3d4c] focus-within:border-indigo-500/80"
                } rounded-3xl p-3 shadow-2xl transition duration-200`}
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isListening
                      ? "Listening to your voice..."
                      : "Ask Yash AI anything, or type '/' for quick commands..."
                  }
                  disabled={isStreaming}
                  className="w-full bg-transparent text-sm text-white placeholder-[#6d7178] focus:outline-none resize-none px-2 max-h-48 leading-relaxed"
                />

                <div className="flex items-center justify-between pt-2 px-1">
                  <div className="flex items-center gap-1.5">
                    {/* Upload Document Pill */}
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(true)}
                      className="p-2 rounded-full hover:bg-[#20222a] text-[#a0a4a8] hover:text-white transition"
                      title="Upload document to knowledge base (RAG)"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    {/* Speech to text Mic Button */}
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`p-2 rounded-full transition ${
                        isListening
                          ? "bg-rose-500 text-white animate-pulse"
                          : "hover:bg-[#20222a] text-[#a0a4a8] hover:text-white"
                      }`}
                      title={isListening ? "Stop listening" : "Voice input"}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    {/* Magic Wand Prompt Enhancer */}
                    {input.trim() && (
                      <button
                        type="button"
                        onClick={enhancePrompt}
                        className="p-2 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition"
                        title="Enhance & polish prompt with AI architecture"
                      >
                        <Wand2 className="w-4 h-4" />
                      </button>
                    )}

                    {/* RAG Context Button */}
                    <button
                      type="button"
                      onClick={() => setUseRag(!useRag)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition flex items-center gap-1 ${
                        useRag
                          ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-medium"
                          : "bg-transparent border-[#2d303a] text-[#6d7178]"
                      }`}
                    >
                      <Zap className="w-3 h-3" />
                      RAG
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {isStreaming ? (
                      <button
                        type="button"
                        onClick={stopGeneration}
                        className="p-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition flex items-center justify-center"
                        title="Stop generating"
                      >
                        <Square className="w-4 h-4 fill-rose-300" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!input.trim()}
                        className="p-2 rounded-full bg-white hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-white text-black transition shadow-md flex items-center justify-center"
                        title="Send prompt"
                      >
                        <Send className="w-3.5 h-3.5 fill-black" />
                      </button>
                    )}
                  </div>
                </div>
              </form>

              <div className="flex items-center justify-between text-[11px] text-[#6d7178] mt-2 px-2">
                <div className="flex items-center gap-3">
                  <span>
                    Persona: <span className="text-slate-300">{activePersona.name}</span>
                  </span>
                  {input.trim() && (
                    <span className="font-mono text-[10px] text-slate-500">
                      {input.trim().length} chars • {input.trim().split(/\s+/).length} words
                    </span>
                  )}
                </div>
                <span>Yash AI can make mistakes. Verify critical facts.</span>
              </div>
            </div>
          </div>
        </main>

        {/* Interactive Split-View Artifact Canvas (Claude Artifacts / ChatGPT Canvas style) */}
        {activeArtifact && (
          <div className="hidden lg:block w-[45%] h-full">
            <ArtifactCanvas
              artifact={activeArtifact}
              onClose={() => setActiveArtifact(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationItem({
  conv,
  currentId,
  editingTitleId,
  editingTitleValue,
  onSelect,
  onTogglePin,
  onStartRename,
  onSaveRename,
  onDelete,
  setEditingTitleValue,
}: {
  conv: Conversation;
  currentId: string;
  editingTitleId: string | null;
  editingTitleValue: string;
  onSelect: () => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onStartRename: (e: React.MouseEvent) => void;
  onSaveRename: () => void;
  onDelete: (e: React.MouseEvent) => void;
  setEditingTitleValue: (val: string) => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition ${
        currentId === conv.id
          ? "bg-[#1f222b] text-white font-medium border border-indigo-500/30 shadow-sm"
          : "text-[#a0a4a8] hover:bg-[#171920] hover:text-white"
      }`}
    >
      <div className="flex items-center gap-2.5 truncate flex-1 mr-2">
        <MessageSquare className="w-3.5 h-3.5 shrink-0 text-indigo-400/80" />
        {editingTitleId === conv.id ? (
          <input
            type="text"
            value={editingTitleValue}
            onChange={(e) => setEditingTitleValue(e.target.value)}
            onBlur={onSaveRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveRename();
            }}
            autoFocus
            className="bg-[#121316] text-white px-1 py-0.5 rounded text-xs border border-indigo-500/50 w-full focus:outline-none"
          />
        ) : (
          <span className="truncate">{conv.title}</span>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
        <button
          onClick={onTogglePin}
          className={`p-1 transition ${
            conv.isPinned ? "text-amber-400" : "hover:text-amber-300 text-[#6d7178]"
          }`}
          title={conv.isPinned ? "Unpin chat" : "Pin chat"}
        >
          {conv.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
        </button>
        <button
          onClick={onStartRename}
          className="p-1 hover:text-indigo-300 text-[#6d7178] transition"
          title="Rename"
        >
          <Edit2 className="w-3 h-3" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 hover:text-rose-400 text-[#6d7178] transition"
          title="Delete chat"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
