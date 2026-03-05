import { useState, useEffect, useRef } from "react";

export type AgentType = "scout" | "coordinator" | "logistics" | "human";

export interface AgentEvent {
  id: string;
  agent: AgentType;
  message: string;
  timestamp: Date;
}

export interface HumanTask {
  id: string;
  title: string;
  description: string;
  status: "pending" | "accepted" | "rejected";
}

export interface ChatMessage {
  from: "bot" | "user";
  text: string;
}

// ── mock data generators ──

const scoutMessages = [
  "New surplus detected: Sunrise Bakery, 3 sandwiches (expires today)",
  "Scanning Green Grocer… 5 fruit boxes available (best before tomorrow)",
  "Corner Café flagged: 8 pastries unsold, closing in 30 min",
  "Farmer's Market stall #12: 2 kg mixed veg, free for pickup",
  "Supermart Express: 12 ready-meals near expiry, high priority",
];

const coordinatorMessages = [
  "Matching surplus #201… urgency scores: 0.92 (NGO), 0.78 (individual)",
  "Optimal match found: surplus #201 → Community Kitchen (0.5 km away)",
  "Re-routing surplus #198 — original recipient unavailable",
  "Batch matching 3 surpluses to 2 food banks, ETA 15 min",
  "Conflict detected: 2 recipients claim same surplus, escalating to human",
];

const logisticsMessages = [
  "WhatsApp sent to +447911123456: Food alert with code NOURISH7",
  "Telegram notification delivered to @foodbank_east",
  "User replied on WhatsApp: 'On my way!'",
  "Pickup confirmed for surplus #198, code NOURISH3 used",
  "SMS fallback sent — WhatsApp delivery failed for +447800111222",
];

const humanMessages = [
  "Task #456 resolved: clarified food listing (5 items, mixed)",
  "Supervisor approved match: surplus #201 → Community Kitchen",
  "Flagged listing rejected: insufficient detail from scout",
  "Override: re-assigned surplus #198 to closer recipient",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let eventCounter = 0;
export function generateEvent(): AgentEvent {
  const agents: AgentType[] = ["scout", "coordinator", "logistics", "human"];
  const agent = randomFrom(agents);
  const msgMap: Record<AgentType, string[]> = {
    scout: scoutMessages,
    coordinator: coordinatorMessages,
    logistics: logisticsMessages,
    human: humanMessages,
  };
  return {
    id: `evt-${++eventCounter}`,
    agent,
    message: randomFrom(msgMap[agent]),
    timestamp: new Date(),
  };
}

const defaultTasks: HumanTask[] = [
  { id: "t1", title: "Clarify food listing", description: 'Sunrise Bakery: "3 unsold sandwiches, best before today"', status: "pending" },
  { id: "t2", title: "Approve match", description: "Surplus #123 → Food Bank (urgency 0.52)", status: "pending" },
  { id: "t3", title: "Verify quantity", description: "Corner Café reports 8 pastries — photo unclear", status: "pending" },
];

// ── hooks ──

export function useEventFeed(interval = 3000) {
  const [events, setEvents] = useState<AgentEvent[]>(() => {
    const initial: AgentEvent[] = [];
    for (let i = 0; i < 4; i++) initial.push(generateEvent());
    return initial;
  });

  useEffect(() => {
    const id = setInterval(() => {
      setEvents((prev) => [...prev, generateEvent()]);
    }, interval);
    return () => clearInterval(id);
  }, [interval]);

  const clear = () => setEvents([]);
  return { events, clear };
}

export function useHumanTasks() {
  const [tasks, setTasks] = useState<HumanTask[]>(defaultTasks);

  const respond = (taskId: string, decision: "accepted" | "rejected") => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: decision } : t)));
  };

  // Simulate new tasks arriving
  useEffect(() => {
    const id = setInterval(() => {
      const newTasks: HumanTask[] = [
        { id: `t-${Date.now()}`, title: "Review edge case", description: `Surplus #${Math.floor(Math.random() * 900 + 100)} needs manual review`, status: "pending" },
      ];
      setTasks((prev) => {
        const pending = prev.filter((t) => t.status === "pending");
        if (pending.length < 3) return [...prev, ...newTasks];
        return prev;
      });
    }, 15000);
    return () => clearInterval(id);
  }, []);

  return { tasks, respond };
}

export function useImpactCounters() {
  const [meals, setMeals] = useState(1247);
  const [co2, setCo2] = useState(3.2);
  const [people, setPeople] = useState(89);

  useEffect(() => {
    const id = setInterval(() => {
      setMeals((m) => m + Math.floor(Math.random() * 3));
      setCo2((c) => +(c + Math.random() * 0.01).toFixed(2));
      setPeople((p) => p + (Math.random() > 0.7 ? 1 : 0));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return { meals, co2, people };
}

const chatResponses: Record<string, string> = {
  hungry: "🍱 I found a bakery 5 min away with 3 unsold sandwiches. Use code NOURISH5 to pick up free. Expires in 30 min!",
  food: "🥗 2 spots nearby have surplus: reply '1' for Bakery Lane (sandwiches) or '2' for Green Grocer (fruit boxes).",
  help: "I can help you find free surplus meals, report food waste, or connect with food banks. Say 'hungry' to start!",
  status: "📊 Your last pickup (NOURISH3) was confirmed. Next alert coming soon!",
  "1": "🥖 Bakery Lane it is! Head to 42 High Street. Show code NOURISH7 at the counter. You have 25 min.",
  "2": "🍎 Green Grocer confirmed! Go to 8 Market Square. Code NOURISH9, expires in 40 min.",
  thanks: "You're welcome! Every meal rescued makes a difference. 🌱",
};

const defaultChatReply = "I understand! Try 'hungry', 'food', 'help', or 'status' to interact with me.";

export function useAgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: "bot", text: "🍱 Free food alert! Sunrise Bakery has 3 sandwiches. Code: NOURISH5. Pick up before 8pm today." },
  ]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { from: "user", text }]);
    const key = text.trim().toLowerCase();
    const reply = chatResponses[key] || defaultChatReply;
    setTimeout(() => {
      setMessages((m) => [...m, { from: "bot", text: reply }]);
    }, 600);
  };

  return { messages, send };
}
