"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatbotSidebar } from "@/components/ChatbotSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Mic, MicOff, Plus, Paperclip, Image as ImageIcon, X, Sparkles, Send } from "lucide-react";
import TextToSpeech from "@/components/TextToSpeech";
import ReactMarkdown from "react-markdown";


type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[]; //array of chat messages
};

const STORAGE_KEY = "chatbot.conversations";
const ACTIVE_KEY = "chatbot.activeId";

function generateId(prefix: string = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

export default function ChatbotPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);

  // Attachments state
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);


  const starterPrompts = [
    "Summarize this product: AI CRM for sales teams",
    "Give me 5 marketing ideas for a B2B fintech startup",
    "Draft a polite follow-up email to a potential client",
    "Explain EBITDA margin like I'm new to finance",
  ];

  // Load from DB
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await fetch("/api/chat/conversations");
        // Tell TypeScript what the expected shape of the data is
        const data: { conversations: Conversation[] } = await res.json();

        if (data?.conversations) {
          const fixedConversations = data.conversations.map(conv => ({
            ...conv,
            title:
              conv.title === "New Chat" &&
              Array.isArray(conv.messages) &&
              conv.messages.length > 0 &&
              conv.messages[0]?.content
                ? conv.messages[0].content.slice(0, 30)
                : conv.title,
          }));

          setConversations(fixedConversations);
          setActiveId(fixedConversations[0]?.id ?? null);
        }
      } catch (error) {
        console.error("Failed to load conversations from DB:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, []);

  const activeConversation = useMemo(() => {
    const conv = conversations.find(c => c.id === activeId);
    if (!conv) return null;
    const sortedMessages = Array.isArray(conv.messages)
      ? [...conv.messages].sort((a, b) => a.createdAt - b.createdAt)
      : [];
    return {
      ...conv,
      messages: sortedMessages,
    };
  }, [conversations, activeId]);

  async function handleNewChat() {
    try {
      const defaultTitle = "New Chat";

      const res = await fetch("/api/chat/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: defaultTitle }),
      });

      const data = await res.json();

      if (res.ok && data.conversation) {
        setConversations(prev => {
          const exists = prev.some(c => c.id === data.conversation.id);
          return exists ? prev : [data.conversation, ...prev];
        });
        setActiveId(data.conversation.id);
        setInput("");
        setTimeout(() => inputRef.current?.focus(), 0);
      } else {
        console.error("Failed to create conversation:", data.error);
      }
    } catch (err) {
      console.error("Error creating conversation:", err);
    }
  }

  async function handleDeleteConversation(id: string) {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setActiveId(remaining[0]?.id ?? null);
    }
    try {
      await fetch(`/api/chat/delete?conversationId=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  }

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setInput("");

    const messageId = generateId("user");
    const assistantId = generateId("assistant");

    const now = Date.now();

    const userMessage: ChatMessage = {
      id: messageId,
      role: "user",
      content: trimmed,
      createdAt: now,
    };

    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: now + 1,
    };

    // Optimistically add user and empty assistant message
    setConversations(prev => {
      const updated = prev.map(conv => {
        if (conv.id === activeId) {
          return {
            ...conv,
            messages: [...(conv.messages ?? []), userMessage, assistantMessage],
          };
        }
        return conv;
      });
      return updated;
    });

    // Start streaming
    setTypingMessageId(assistantId);
    let streamedContent = "";
    const updatedConversation = await assistantReplyFromGoogle(trimmed, activeId, (chunk) => {
      streamedContent += chunk;
      setConversations(prev =>
        prev.map(conv => {
          if (conv.id === activeId) {
            return {
              ...conv,
              messages: conv.messages.map(msg =>
                msg.id === assistantId ? { ...msg, content: streamedContent } : msg
              ),
            };
          }
          return conv;
        })
      );
    });

    if (updatedConversation) {
      const sortedMessages = [...(updatedConversation.messages || [])].sort(
        (a, b) => a.createdAt - b.createdAt
      );
      const firstMessageContent = sortedMessages[0]?.content ?? "New Chat";
      const newTitle = firstMessageContent.slice(0, 30);

      setConversations(prev => {
        const others = prev.filter(c => c.id !== updatedConversation.id);
        const updatedConv = { ...updatedConversation, messages: sortedMessages, title: newTitle };
        return [updatedConv, ...others];
      });

      setActiveId(updatedConversation.id);

      await fetch("/api/chat/update-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: updatedConversation.id, title: newTitle }),
      });
    }

    setTypingMessageId(null);
    setIsSending(false);
  }

  const assistantReplyFromGoogle = async (
    message: string,
    conversationId: string | null,
    onStreamChunk?: (chunk: string) => void
  ): Promise<Conversation | null> => {
    try {
      const res = await fetch("/api/chat/ask-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversationId }),
      });

      if (!res.body) {
        throw new Error("No response body for streaming");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let assistantMessage = "";
      let newConversation: Conversation | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantMessage += chunk;

        // Push streamed chunk to UI
        onStreamChunk?.(chunk);
      }

      // Once stream is done, refetch full updated conversation
      const finalRes = await fetch("/api/chat/conversations");
      const finalData: { conversations: Conversation[] } = await finalRes.json();

      newConversation = finalData.conversations.find(c => c.id === conversationId) ?? null;

      return newConversation;
    } catch (err) {
      console.error("Streaming failed:", err);
      return null;
    }
  };

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // Attachments handlers
  function onClickAddFiles() {
    fileInputRef.current?.click();
  }

  function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setAttachments(prev => [...prev, ...files].slice(0, 10));
    e.target.value = ""; // reset so same file can be re-selected
  }

  function removeAttachment(index: number) {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }

  // Voice handlers
  function drawWaveform() {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      const dpr = (window as any).devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const desiredWidth = Math.floor(rect.width * dpr);
      const desiredHeight = Math.floor(rect.height * dpr);
      if (canvas.width !== desiredWidth || canvas.height !== desiredHeight) {
        canvas.width = desiredWidth;
        canvas.height = desiredHeight;
      }

      analyser.getByteTimeDomainData(dataArray);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // background: solid white
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // waveform
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#374151"; // gray-700
      ctx.beginPath();

      const sliceWidth = (width * 1.0) / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; // 0..2
        const y = (v * height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(render);
    };
    animationFrameRef.current = requestAnimationFrame(render);
  }

  async function startAudioVisualization() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      source.connect(analyser);
      drawWaveform();
    } catch {
      // ignore
    }
  }

  function stopAudioVisualization() {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    analyserRef.current = null;
  }

  function toggleRecording() {
    const SpeechRecognition: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (!isRecording) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript.trim()) {
          setInput(prev => (prev ? prev + " " : "") + transcript.trim());
        }
      };
      recognition.onerror = () => {
        setIsRecording(false);
      };
      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      // start visualizer
      startAudioVisualization();
    } else {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsRecording(false);
      stopAudioVisualization();
    }
  }


  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <ChatbotSidebar
          conversations={conversations}
          activeId={activeId}
          onNewChat={handleNewChat}
          onSelectConversation={setActiveId}
          onDeleteConversation={handleDeleteConversation}
        />

        {/* Main chat area */}
        <main className="flex min-w-0 flex-1 flex-col ml-4">
          <div className="flex items-center justify-between border-b pl-16 pr-4 py-2 bg-gradient-to-r from-background to-muted/30">
            <div className="flex items-center gap-6">
              <SidebarTrigger className="h-10 w-10" />
              <div className="text-xl font-semibold tracking-tight">Chatbot</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border px-2 py-1 text-[10px] font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Model: Default
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="mx-auto w-full max-w-3xl">
              {activeConversation?.messages.length ? (
                <div className="flex flex-col gap-6">
                  {activeConversation.messages.map(msg => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex w-full items-start gap-3",
                        msg.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>AI</AvatarFallback>
                          </Avatar>
                          <div className="flex items-start gap-2">
                            <div
                              className={cn(
                                "prose prose-sm max-w-[80%] rounded-2xl border bg-accent px-4 py-3 text-sm leading-relaxed shadow-sm dark:prose-invert",
                              )}
                            >
                              <ReactMarkdown>
                                {typingMessageId === msg.id ? msg.content + "▍" : msg.content}
                              </ReactMarkdown>
                            </div>
                            <TextToSpeech text={msg.content} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className={cn(
                              "prose prose-sm max-w-[80%] rounded-2xl border px-4 py-3 text-sm leading-relaxed text-primary-foreground shadow-sm dark:prose-invert",
                              "bg-primary",
                            )}
                          >
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mx-auto max-w-3xl py-16 flex min-h-[60vh] flex-col items-center justify-center">
                  <div className="mb-10 text-center">
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">How can I help you today?</h1>
                    <p className="mt-2 text-lg text-muted-foreground">Try one of these to get started</p>
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {starterPrompts.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInput(p)}
                        className="group rounded-2xl border p-6 text-left text-lg transition-colors hover:bg-accent/60"
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-md bg-primary/10 p-2.5 text-primary">
                            <Sparkles className="h-5 w-5" />
                          </div>
                          <div className="flex-1 leading-relaxed text-foreground/90">
                            {p}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="sticky bottom-6 border-t-0 bg-transparent px-3 pb-4">
            <div className="mx-auto w-full max-w-3xl space-y-2">
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, i) => (
                    <div key={`${file.name}-${i}`} className="flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
                      <Paperclip className="h-3 w-3" />
                      <span className="max-w-[200px] truncate">{file.name}</span>
                      <button className="opacity-70 hover:opacity-100" onClick={() => removeAttachment(i)} aria-label="Remove attachment">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mx-auto flex w-full items-center gap-4 rounded-full border p-4 shadow-md bg-card/70">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={onClickAddFiles} aria-label="Add attachments">
                    <Plus className="h-5 w-5" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.txt,.doc,.docx"
                    multiple
                    className="hidden"
                    onChange={onFilesSelected}
                  />
                </div>

                {isRecording ? (
                  <div className="relative flex-1 overflow-hidden rounded-md">
                    <canvas
                      ref={canvasRef}
                      className="h-[56px] w-full"
                    />
                  </div>
                ) : (
                  <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="min-h-[56px] max-h-56 resize-none border-0 bg-transparent px-2 text-lg shadow-none focus:shadow-none focus-visible:ring-0 focus:ring-0 focus-visible:outline-none"
                  rows={1}
                />
                )}

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => {}} aria-label="Autocomplete">
                    <Sparkles className="h-5 w-5" />
                  </Button>
                  <div className="flex items-center">
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleRecording}
                        aria-label="Toggle voice"
                      >
                        {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </Button>
                      {isRecording && (
                        <span className="pointer-events-none absolute -inset-1 rounded-full ring-2 ring-primary/40 animate-pulse" />
                      )}
                    </div>
                    {/* no text chip while recording */}
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={(!!input.trim() === false && attachments.length === 0) || isSending}
                    className="shrink-0 rounded-full h-11 w-11"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}