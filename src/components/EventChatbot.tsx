import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  event: {
    title: string;
    description?: string;
    date: string;
    time?: string;
    location: string;
    is_online?: boolean;
    meeting_platform?: string;
    organizer: string;
    ticket_types?: Array<{ name: string; price: number; available: number }>;
  };
}

const EventChatbot = ({ event }: Props) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const ticketInfo = event.ticket_types?.map((t) => `${t.name}: $${t.price} (${t.available} left)`).join(", ");
      const { data, error } = await supabase.functions.invoke("ai-event-tools", {
        body: {
          action: "event_chatbot",
          question: q,
          eventTitle: event.title,
          eventDescription: event.description,
          eventDate: event.date,
          eventTime: event.time,
          eventLocation: event.location,
          isOnline: event.is_online,
          meetingPlatform: event.meeting_platform,
          organizer: event.organizer,
          ticketTypes: ticketInfo,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border bg-card shadow-2xl flex flex-col overflow-hidden" style={{ height: "480px" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-primary/5">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold">Event Assistant</p>
            <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{event.title}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center space-y-2 pt-8">
            <Bot className="h-10 w-10 text-primary/40 mx-auto" />
            <p className="text-sm text-muted-foreground">Ask me anything about this event!</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {["What time does it start?", "Where is the venue?", "Are tickets available?"].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="text-[11px] px-2.5 py-1 rounded-full border hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && <Bot className="h-5 w-5 text-primary shrink-0 mt-0.5" />}
            <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}>
              {msg.content}
            </div>
            {msg.role === "user" && <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <Bot className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="bg-muted rounded-xl px-3 py-2">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about this event..."
          className="text-sm rounded-full"
          disabled={loading}
        />
        <Button size="icon" className="rounded-full shrink-0" onClick={send} disabled={!input.trim() || loading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EventChatbot;
