import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { ChatMsg, streamChat } from "@/lib/stream-chat";
import { toast } from "@/hooks/use-toast";

const AIChatbot = () => {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMsg = { role: "user", content: text };
    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = "";

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        onDelta: upsert,
        onDone: () => setIsLoading(false),
        onError: (err) => {
          toast({ title: "AI Error", description: err, variant: "destructive" });
          setIsLoading(false);
        },
      });
    } catch {
      toast({ title: "Connection Error", description: "Could not reach AI service.", variant: "destructive" });
      setIsLoading(false);
    }
  };

  const suggestions = [
    "Generate a recipe from 12kg chicken + 8kg tomatoes",
    "What waste will happen tomorrow at Bakery #127?",
    "Show me shelter nutrition gaps and recipe matches",
    "How does the 5-agent pipeline work?",
    "I'm hungry — find me nearby surplus food",
    "Explain the dynamic pricing waterfall",
  ];

  return (
    <section id="ai-chat" className="container mx-auto my-16">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Powered by Lovable AI
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-display mb-2">
            Talk to NourishNet AI
          </h2>
          <p className="text-muted-foreground">
            Ask about food rescue, waste prediction, shelter needs, or how our agents work.
          </p>
        </div>

        {/* Chat Window */}
        <div className="bg-card border border-border rounded-3xl shadow-lg overflow-hidden">
          {/* Messages */}
          <div ref={scrollRef} className="h-[420px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground text-sm max-w-sm">
                  I'm your AI food rescue assistant. Ask me anything about waste prevention, surplus matching, or nutrition gaps.
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); }}
                      className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                  m.role === "user" ? "bg-primary" : "bg-accent"
                }`}>
                  {m.role === "user"
                    ? <User className="h-4 w-4 text-primary-foreground" />
                    : <Bot className="h-4 w-4 text-accent-foreground" />
                  }
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary text-secondary-foreground rounded-bl-sm"
                }`}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert [&_p]:mb-1.5 [&_p:last-child]:mb-0">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : m.content}
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-xl bg-accent flex items-center justify-center">
                  <Bot className="h-4 w-4 text-accent-foreground" />
                </div>
                <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Ask about food rescue, waste prediction, shelters..."
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
              <Button
                size="icon"
                onClick={send}
                disabled={isLoading || !input.trim()}
                className="h-11 w-11 rounded-xl"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Streaming AI responses powered by Gemini · NourishNet Agent System
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIChatbot;
