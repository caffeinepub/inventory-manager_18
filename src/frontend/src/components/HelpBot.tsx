import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAllItems } from "../hooks/useQueries";

interface Message {
  id: number;
  role: "bot" | "user";
  text: string;
}

function getRuleBasedResponse(
  input: string,
  items: { name: string; stockQuantity: bigint; category: string }[],
): string {
  const q = input.toLowerCase().trim();

  const stockMatch = items.find((item) => q.includes(item.name.toLowerCase()));
  if (stockMatch) {
    const qty = Number(stockMatch.stockQuantity);
    return qty > 0
      ? `\u2705 **${stockMatch.name}** is currently **In Stock** with ${qty} unit(s) available!`
      : `\u274c **${stockMatch.name}** is currently **Out of Stock**. Please check back later or click "Notify Me" on the product page.`;
  }

  if (
    q.includes("timing") ||
    q.includes("time") ||
    q.includes("open") ||
    q.includes("hour") ||
    q.includes("close") ||
    q.includes("\u0938\u092e\u092f")
  ) {
    return "\ud83d\udd50 Store Hours: **Monday to Saturday, 9:00 AM \u2013 9:00 PM**. We are closed on Sundays and public holidays.";
  }

  if (
    q.includes("order") ||
    q.includes("tracking") ||
    q.includes("status") ||
    q.includes("\u0911\u0930\u094d\u0921\u0930")
  ) {
    return "\ud83d\udce6 To track your order, go to **My Account** \u2192 **Order History**. For urgent queries, WhatsApp us at +91 99846 06371.";
  }

  if (
    q.includes("return") ||
    q.includes("refund") ||
    q.includes("exchange") ||
    q.includes("\u0935\u093e\u092a\u0938\u0940")
  ) {
    return "\ud83d\udd04 We offer a **7-day return policy** on all items. Items must be unused and in original packaging. Contact us via WhatsApp to initiate a return.";
  }

  if (
    q.includes("how") &&
    (q.includes("order") || q.includes("buy") || q.includes("purchase"))
  ) {
    return "\ud83d\uded2 To place an order: 1) Browse inventory, 2) Click on any item, 3) Click **Place Order**, 4) Fill your name, phone & address. Your invoice will be generated automatically!";
  }

  if (
    q.includes("payment") ||
    q.includes("pay") ||
    q.includes("upi") ||
    q.includes("\u092d\u0941\u0917\u0924\u093e\u0928")
  ) {
    return "\ud83d\udcb3 We accept **UPI, Cash on Delivery, and Bank Transfer**. Payment details will be shared after order confirmation.";
  }

  if (
    q.includes("deliver") ||
    q.includes("shipping") ||
    q.includes("\u0921\u093f\u0932\u0940\u0935\u0930\u0940")
  ) {
    return "\ud83d\ude9a Standard delivery: **2\u20135 working days**. Express delivery available in select areas. Contact us for more details.";
  }

  if (q.includes("gst") || q.includes("tax") || q.includes("\u0915\u0930")) {
    return "\ud83e\uddfe GST is calculated automatically on each product (0%, 5%, 12%, or 18% depending on category). You can see the full GST breakdown on each product page and your invoice.";
  }

  if (
    q.includes("categor") ||
    q.includes("type") ||
    q.includes("kind") ||
    q.includes("\u0936\u094d\u0930\u0947\u0923\u0940")
  ) {
    const cats = [...new Set(items.map((i) => i.category))].slice(0, 6);
    return cats.length > 0
      ? `\ud83d\udce6 We stock items across these categories: **${cats.join(", ")}** and more. Browse the full inventory to explore!`
      : "\ud83d\udce6 We carry a wide range of products. Browse the inventory page to explore all categories!";
  }

  if (
    q.includes("contact") ||
    q.includes("phone") ||
    q.includes("whatsapp") ||
    q.includes("\u0938\u0902\u092a\u0930\u094d\u0915")
  ) {
    return "\ud83d\udcde You can reach us via:\n\u2022 **WhatsApp:** +91 99846 06371\n\u2022 **Email:** raiayush212280@gmail.com\n\u2022 **LinkedIn:** Ayush Rai";
  }

  if (
    q.includes("loyalty") ||
    q.includes("point") ||
    q.includes("discount") ||
    q.includes("\u092a\u0949\u0907\u0902\u091f")
  ) {
    return "\u2b50 Earn **1 loyalty point per \u20b9100** spent. Redeem 100 points for \u20b910 off your next order! Check your points in **My Account**.";
  }

  if (
    q.includes("hello") ||
    q.includes("hi") ||
    q.includes("hey") ||
    q === "?"
  ) {
    return "\ud83d\udc4b Hello! How can I help you today? Ask me about stock availability, store timings, orders, or anything else!";
  }

  return '\ud83e\udd14 I didn\'t quite understand that. Try asking about:\n\u2022 **Stock availability** (e.g., "Is Sony Alpha in stock?")\n\u2022 **Store timings**\n\u2022 **How to place an order**\n\u2022 **Return policy**\n\u2022 **Contact info**';
}

export default function HelpBot() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [nextId, setNextId] = useState(2);
  const [showGreeting, setShowGreeting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: items } = useAllItems();

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: 1, role: "bot", text: t("helpbot.greeting") }]);
    }
  }, [open, messages.length, t]);

  // Auto-show greeting bubble on page load
  useEffect(() => {
    const showTimer = setTimeout(() => setShowGreeting(true), 1000);
    const hideTimer = setTimeout(() => setShowGreeting(false), 6000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const userMsg: Message = { id: nextId, role: "user", text };
    setNextId((n) => n + 1);
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 600));
    const response = getRuleBasedResponse(text, items ?? []);
    setMessages((prev) => [
      ...prev,
      { id: nextId + 1, role: "bot", text: response },
    ]);
    setNextId((n) => n + 2);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
      data-ocid="helpbot.panel"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ duration: 0.2 }}
            className="w-80 bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: "480px" }}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {t("helpbot.title")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="opacity-80 hover:opacity-100 transition-opacity"
                data-ocid="helpbot.close_button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {msg.role === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[210px] text-xs px-3 py-2 rounded-xl leading-relaxed whitespace-pre-line ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted/60 text-foreground rounded-tl-none"}`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-muted/60 text-muted-foreground text-xs px-3 py-2 rounded-xl rounded-tl-none">
                    <span className="animate-pulse">
                      {t("helpbot.thinking")}
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="p-3 border-t border-border flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("helpbot.placeholder")}
                className="text-xs h-8 flex-1"
                data-ocid="helpbot.input"
              />
              <Button
                size="sm"
                className="h-8 w-8 p-0 bg-primary text-primary-foreground"
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                data-ocid="helpbot.send_button"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Greeting bubble */}
      {showGreeting && !open && (
        <div className="absolute bottom-16 right-0 mb-2 w-52 bg-white dark:bg-card border border-border rounded-xl shadow-lg px-4 py-3 text-sm text-foreground font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            type="button"
            onClick={() => setShowGreeting(false)}
            className="absolute top-1.5 right-2 text-muted-foreground hover:text-foreground transition-colors text-xs"
            aria-label="Dismiss"
          >
            ✕
          </button>
          <p>How can I help you today? 👋</p>
          <div className="absolute -bottom-2 right-5 w-3 h-3 bg-white dark:bg-card border-r border-b border-border rotate-45" />
        </div>
      )}

      <motion.button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setShowGreeting(false);
        }}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-ocid="helpbot.open_modal_button"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
