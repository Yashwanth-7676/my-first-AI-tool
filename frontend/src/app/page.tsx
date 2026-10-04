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
} from "lucide-react";
import { DocumentUploadModal } from "../components/DocumentUploadModal";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

const STARTER_PROMPTS = [
  {
    icon: Lightbulb,
    title: "Explain a concept",
    prompt: "Explain how neural networks learn in simple and intuitive terms.",
    color: "text-amber-400 bg-amber-500/10",
  },
  {
    icon: Code,
    title: "Write & debug code",
    prompt: "Write a high-performance Python FastAPI endpoint with async database queries.",
    color: "text-emerald-400 bg-emerald-500/10",
  },
  {
    icon: Compass,
    title: "Explore ideas",
    prompt: "Brainstorm 5 innovative AI startup ideas using Retrieval Augmented Generation (RAG).",
    color: "text-sky-400 bg-sky-500/10",
  },
  {
    icon: FileText,
    title: "Draft content",
    prompt: "Draft an engaging pitch email to investors for an AI productivity platform.",
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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Yash AI 2.0 Pro");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    // Default first conversation
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
        200
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendMessage = async (queryText: string) => {
    if (!queryText.trim() || isStreaming) return;

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
    };

    // Update title if it's the first message
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

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const response = await fetch(`${apiUrl}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText, use_rag: useRag }),
      });

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
    } catch (err: any) {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === currentId) {
            const updatedMsgs = [...c.messages];
            const lastMsg = updatedMsgs[updatedMsgs.length - 1];
            if (lastMsg && lastMsg.role === "assistant") {
              lastMsg.content = `[Notice: Could not connect to backend server at http://localhost:8000. Make sure to run \`python run.py\` to start the API server.]\n\nError details: ${err.message}`;
            }
            return { ...c, messages: updatedMsgs };
          }
          return c;
        })
      );
    } finally {
      setIsStreaming(false);
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

  return (
    <div className="flex h-screen w-full bg-[#131314] text-[#e3e3e3] font-sans overflow-hidden antialiased">
      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {/* Collapsible Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0 -translate-x-full"
        } transition-all duration-300 ease-in-out bg-[#1e1f20] border-r border-[#2d2e30] flex flex-col justify-between shrink-0 overflow-hidden relative z-20`}
      >
        <div className="flex flex-col h-full p-3 overflow-hidden">
          {/* Top Actions */}
          <div className="space-y-3 pb-2">
            <div className="flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md text-xs">
                  ✦
                </div>
                <span className="font-semibold text-sm tracking-tight text-white">
                  Yash AI
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#2d2e30] text-[#c4c7c5] hover:text-white transition"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className="flex w-full items-center gap-2 px-3 py-2.5 rounded-full bg-[#282a2c] hover:bg-[#333538] text-white text-xs font-medium transition shadow-sm border border-[#3c4043]"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>New chat</span>
            </button>
          </div>

          {/* Conversations History */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 mt-2">
            <div className="text-[11px] font-medium text-[#8e918f] px-3 py-1">Recent</div>
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setCurrentId(conv.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition ${
                  currentId === conv.id
                    ? "bg-[#282a2c] text-white font-medium"
                    : "text-[#c4c7c5] hover:bg-[#282a2c]/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 text-[#8e918f]" />
                  <span className="truncate">{conv.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteChat(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-[#8e918f] transition"
                  title="Delete chat"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="border-t border-[#2d2e30] pt-3 space-y-2 mt-auto">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-[#c4c7c5] hover:bg-[#282a2c] hover:text-white transition"
            >
              <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
              <span>Upload Document (RAG)</span>
            </button>

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#131314]/80 text-xs">
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white text-[10px]">
                Y
              </div>
              <div className="truncate flex-1">
                <p className="text-[11px] font-medium text-white truncate">Yashwanth</p>
                <p className="text-[10px] text-[#8e918f]">Pro Member</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Stage */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#131314]">
        {/* Top Header */}
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-[#2d2e30]/40 shrink-0">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white transition"
                title="Open sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            {/* Model Selector (Gemini style) */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-[#282a2c] text-xs font-medium text-white transition">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {selectedModel}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8e918f]" />
              </button>
            </div>
          </div>

          {/* RAG Context Retrieval Pill */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setUseRag(!useRag)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition ${
                useRag
                  ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-300"
                  : "bg-[#282a2c] border-[#3c4043] text-[#8e918f]"
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>RAG Context: {useRag ? "ON" : "OFF"}</span>
            </button>
          </div>
        </header>

        {/* Message Container / Hero Welcome Screen */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 ? (
            /* Gemini-style Hero Welcome View */
            <div className="max-w-3xl mx-auto h-full flex flex-col justify-center pb-12">
              <div className="space-y-3 mb-10">
                <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                    Hello, Yashwanth
                  </span>
                </h1>
                <p className="text-2xl sm:text-3xl font-medium text-[#444746]">
                  How can I help you today?
                </p>
              </div>

              {/* Starter Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STARTER_PROMPTS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => sendMessage(item.prompt)}
                      className="p-4 rounded-2xl bg-[#1e1f20] hover:bg-[#282a2c] border border-[#2d2e30] hover:border-[#3c4043] text-left transition flex flex-col justify-between h-32 group shadow-sm"
                    >
                      <p className="text-xs text-[#c4c7c5] group-hover:text-white line-clamp-2 leading-relaxed">
                        {item.prompt}
                      </p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] font-medium text-[#8e918f]">
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
            /* Chat Stream View (ChatGPT / Gemini style) */
            <div className="max-w-3xl mx-auto space-y-6 pb-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 group ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shrink-0 text-xs shadow-md mt-0.5">
                      ✦
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#282a2c] text-white rounded-tr-sm shadow-sm"
                        : "bg-transparent text-[#e3e3e3] px-0 py-1"
                    }`}
                  >
                    {msg.content ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      <div className="flex items-center gap-1.5 py-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse [animation-delay:0.4s]"></span>
                      </div>
                    )}

                    {/* Actions on Assistant Messages (Copy, Thumbs, Feedback) */}
                    {msg.role === "assistant" && msg.content && (
                      <div className="flex items-center gap-2 mt-3 pt-2 text-[#8e918f]">
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="p-1 rounded-md hover:bg-[#282a2c] hover:text-white transition"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          className="p-1 rounded-md hover:bg-[#282a2c] hover:text-white transition"
                          title="Good response"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1 rounded-md hover:bg-[#282a2c] hover:text-white transition"
                          title="Bad response"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Gemini / ChatGPT Floating Input Bar */}
        <div className="p-4 sm:p-6 pt-0 bg-gradient-to-t from-[#131314] via-[#131314] to-transparent shrink-0">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="relative flex flex-col bg-[#1e1f20] hover:bg-[#222325] focus-within:bg-[#222325] border border-[#3c4043]/60 focus-within:border-indigo-500/70 rounded-3xl p-3 shadow-2xl transition duration-200"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Yash AI anything..."
                disabled={isStreaming}
                className="w-full bg-transparent text-sm text-white placeholder-[#8e918f] focus:outline-none resize-none px-2 max-h-48 leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2 px-1">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(true)}
                    className="p-2 rounded-full hover:bg-[#2d2e30] text-[#c4c7c5] hover:text-white transition"
                    title="Upload document to knowledge base (RAG)"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseRag(!useRag)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition flex items-center gap-1 ${
                      useRag
                        ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-medium"
                        : "bg-transparent border-[#3c4043] text-[#8e918f]"
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    RAG
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isStreaming || !input.trim()}
                  className="p-2 rounded-full bg-white hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-white text-black transition shadow-md flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5 fill-black" />
                </button>
              </div>
            </form>

            <p className="text-[11px] text-center text-[#8e918f] mt-2">
              Yash AI can make mistakes. Verify important info.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
