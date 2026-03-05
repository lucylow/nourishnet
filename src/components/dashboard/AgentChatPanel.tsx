import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "@/lib/agents";

interface Props {
  messages: ChatMessage[];
  onSend: (text: string) => void;
}

const AgentChatPanel = ({ messages, onSend }: Props) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="font-bold text-foreground flex items-center gap-2 text-sm mb-4">
        <MessageCircle className="h-4 w-4 text-accent" /> Chat with Logistics Agent
      </h3>
      <div className="space-y-3 max-h-[220px] overflow-y-auto mb-4 bg-secondary/30 rounded-xl p-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.from === "bot"
                ? "bg-secondary rounded-2xl rounded-bl-sm px-3 py-2 max-w-[85%] text-sm text-secondary-foreground"
                : "bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-3 py-2 max-w-[85%] ml-auto text-sm"
            }
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Try 'hungry' or 'status'..."
          className="flex-1 px-4 py-2.5 rounded-full border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button size="icon" onClick={handleSend}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2">Simulated via FLock (Gemma 2B)</p>
    </div>
  );
};

export default AgentChatPanel;
