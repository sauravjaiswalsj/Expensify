"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useExpenseData } from "@/lib/expense-data-context";
import { aiApi } from "@/lib/api";
import { type Expense } from "@/types";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

function parseExpenseDate(expense: Expense): Date | null {
  const raw = expense.date || expense.createdAt || expense.updatedAt;
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function currencySymbol(code?: string) {
  if (code === "USD") return "$";
  if (code === "EUR") return "EUR ";
  if (code === "GBP") return "GBP ";
  return "₹";
}

function isInsightPrompt(input: string): boolean {
  const normalized = input.toLowerCase();
  const insightTerms = [
    "insight",
    "insighnt",
    "spend",
    "spending",
    "expense",
    "expenses",
    "transaction",
    "transactions",
    "category",
    "categories",
    "budget",
    "saving",
    "save",
    "reduce",
    "recent",
    "latest",
    "trend",
    "pattern",
    "where is my money",
    "money going",
    "financial",
    "cost",
    "costs",
  ];

  return insightTerms.some((term) => normalized.includes(term));
}

async function requestAiInsight(input: string, expenses: Expense[]): Promise<string | null> {
  if (!isInsightPrompt(input)) return null;
  const insight = await aiApi.insight(input);
  return insight?.reply || buildInsightReply(input, expenses);
}

function buildInsightReply(input: string, expenses: Expense[]): string {
  const total = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const topCategory = Object.entries(
    expenses.reduce<Record<string, number>>((acc, item) => {
      const key = item.category || "Uncategorized";
      acc[key] = (acc[key] ?? 0) + (item.amount || 0);
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1])[0];

  const recent = [...expenses]
    .sort((a, b) => (parseExpenseDate(b)?.getTime() ?? 0) - (parseExpenseDate(a)?.getTime() ?? 0))
    .slice(0, 3);

  const lower = input.toLowerCase();
  const asksAboutTopSpend =
    lower.includes("category") ||
    lower.includes("spend most") ||
    lower.includes("spending the most") ||
    lower.includes("spending most") ||
    lower.includes("where am i spending") ||
    lower.includes("where is my money");

  if (expenses.length === 0) {
    return "I don't have any expense data yet. Add a few transactions and I can start surfacing patterns, heavy categories, and recent changes.";
  }

  if (asksAboutTopSpend) {
    return `Your highest category right now is ${topCategory?.[0] ?? "Uncategorized"}, contributing about ${currencySymbol(expenses[0]?.currency)}${(topCategory?.[1] ?? 0).toFixed(2)} of tracked spend.`;
  }

  if (lower.includes("recent") || lower.includes("latest")) {
    const recentLine = recent
      .map((item) => `${item.category || "Uncategorized"} ${currencySymbol(item.currency)}${(item.amount || 0).toFixed(2)}`)
      .join(", ");
    return `Your most recent transactions are ${recentLine}.`;
  }

  if (lower.includes("save") || lower.includes("reduce") || lower.includes("cut")) {
    return `A practical place to start is ${topCategory?.[0] ?? "your top category"}. Since your tracked total is ${currencySymbol(expenses[0]?.currency)}${total.toFixed(2)}, even a small reduction there would have the most visible effect.`;
  }

  if (lower.includes("bad") || lower.includes("problem") || lower.includes("issue")) {
    return `Your spending is not automatically bad, but ${topCategory?.[0] ?? "your top category"} is taking the biggest share at ${currencySymbol(expenses[0]?.currency)}${(topCategory?.[1] ?? 0).toFixed(2)} out of ${currencySymbol(expenses[0]?.currency)}${total.toFixed(2)} tracked. That is the first place I would review for repeat purchases or anything that no longer feels worth it.`;
  }

  return `Here’s the quick picture: you’ve logged ${expenses.length} expenses totaling ${currencySymbol(expenses[0]?.currency)}${total.toFixed(2)}. Your heaviest category is ${topCategory?.[0] ?? "Uncategorized"}. Ask about recent activity, top categories, or ways to reduce spend and I’ll tailor the next insight.`;
}

export default function ChatPage() {
  const { expenses } = useExpenseData();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi, I'm your expense copilot. Ask me about spend patterns, recent transactions, or where your money is going.",
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  const quickPrompts = useMemo(
    () => [
      "Where am I spending the most?",
      "Show my recent activity",
      "How can I reduce spend?",
    ],
    []
  );

  async function submitPrompt(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed || isThinking) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsThinking(true);

    try {
      const aiReply = await requestAiInsight(trimmed, expenses);
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now() + 1}`,
        role: "assistant",
        text: aiReply ?? buildInsightReply(trimmed, expenses),
      };
      setMessages((current) => [...current, assistantMessage]);
    } catch {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now() + 1}`,
        role: "assistant",
        text: buildInsightReply(trimmed, expenses),
      };
      setMessages((current) => [...current, assistantMessage]);
    } finally {
      setIsThinking(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void submitPrompt(input);
  }

  return (
    <div className="animate-fade-in-up space-y-6 pb-12">
      <section
        className="surface-panel overflow-hidden p-0"
        style={{
          background:
            "linear-gradient(140deg, color-mix(in srgb, var(--bg-secondary) 96%, transparent), color-mix(in srgb, var(--bg-surface) 88%, transparent))",
        }}
      >
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6 sm:p-8">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{
                borderColor: "color-mix(in srgb, var(--accent-cyan) 28%, var(--border-primary))",
                color: "var(--accent-cyan)",
                backgroundColor: "color-mix(in srgb, var(--accent-cyan) 10%, transparent)",
              }}
            >
              AI chat
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--text-primary)" }}>
              Ask for spending insights
            </h1>
            <p className="mt-2 max-w-2xl text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>
              Use the chat tab to explore your expenses conversationally and get fast, contextual guidance from the
              data already on the page.
            </p>
          </div>

          <div
            className="border-t p-6 sm:p-8 lg:border-l lg:border-t-0"
            style={{ borderColor: "var(--border-primary)" }}
          >
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Quick prompts
            </h2>
            <div className="mt-4 space-y-3">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void submitPrompt(prompt)}
                  disabled={isThinking}
                  className="w-full rounded-2xl border px-4 py-3 text-left text-sm transition"
                  style={{
                    borderColor: "var(--border-primary)",
                    backgroundColor: "color-mix(in srgb, var(--bg-surface) 76%, transparent)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="surface-panel flex min-h-[620px] flex-col p-0 overflow-hidden">
          <div className="border-b px-6 py-4" style={{ borderColor: "var(--border-primary)" }}>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Conversation
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Ask for expense-aware responses.
            </p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === "user" ? "ml-auto" : ""
                }`}
                style={{
                  backgroundColor:
                    message.role === "user"
                      ? "color-mix(in srgb, var(--accent-cyan) 18%, transparent)"
                      : "color-mix(in srgb, var(--bg-surface) 82%, transparent)",
                  color: "var(--text-primary)",
                  border: `1px solid ${
                    message.role === "user"
                      ? "color-mix(in srgb, var(--accent-cyan) 20%, var(--border-primary))"
                      : "var(--border-primary)"
                  }`,
                }}
              >
                {message.text}
              </div>
            ))}
            {isThinking ? (
              <div
                className="max-w-[85%] rounded-2xl border px-4 py-3 text-sm leading-6"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--bg-surface) 82%, transparent)",
                  borderColor: "var(--border-primary)",
                  color: "var(--text-muted)",
                }}
              >
                Thinking through your expenses...
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="border-t px-6 py-4" style={{ borderColor: "var(--border-primary)" }}>
            <div className="flex gap-3">
              <input
                className="input-field"
                placeholder="Ask about your spend, categories, or recent activity..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isThinking}
              />
              <button type="submit" className="btn-primary px-5" disabled={isThinking}>
                {isThinking ? "Thinking" : "Send"}
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-6">
          <div className="surface-panel p-6">
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Insight snapshot
            </h2>
            <div className="mt-4 space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "color-mix(in srgb, var(--bg-surface) 74%, transparent)",
                }}
              >
                Transactions loaded: <span style={{ color: "var(--text-primary)" }}>{expenses.length}</span>
              </div>
              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "color-mix(in srgb, var(--bg-surface) 74%, transparent)",
                }}
              >
                Best use: ask about top categories, latest activity, and ways to trim recurring spend.
              </div>
            </div>
          </div>

          <div className="surface-panel p-6">
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Assistant status</h2>
            <p className="mt-3 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
              Insight prompts use your saved expense data to answer with concise guidance. General prompts keep the fast
              local response.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
