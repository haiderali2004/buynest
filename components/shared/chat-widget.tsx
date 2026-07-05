"use client";

import * as React from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject: "Live chat", message }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Couldn't send your message. Please try again.");
        return;
      }

      setSent(true);
    } catch {
      setError("Couldn't send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex w-80 flex-col border border-border bg-paper shadow-lg sm:w-96">
          <div className="flex items-center justify-between bg-bottle px-4 py-3">
            <p className="font-display text-sm text-paper">BuyNest support</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-paper/80 hover:text-paper"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3 p-4">
            <div className="max-w-[85%] self-start rounded-sm bg-secondary px-3 py-2 text-sm text-foreground">
              Hi! We typically reply within a few hours. Leave a message and we&rsquo;ll follow up
              by email.
            </div>

            {sent ? (
              <div className="max-w-[85%] self-start rounded-sm bg-secondary px-3 py-2 text-sm text-foreground">
                Thanks — we&rsquo;ve got your message and will be in touch soon.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-9 border border-input bg-paper px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                />
                <input
                  type="email"
                  required
                  placeholder="Your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-9 border border-input bg-paper px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                />
                <textarea
                  required
                  rows={3}
                  placeholder="How can we help?"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="resize-none border border-input bg-paper px-3 py-2 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                />
                {error && <p className="text-xs text-clay">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 bg-bottle px-3 py-2 text-sm text-paper hover:bg-bottle/90 disabled:opacity-60"
                >
                  <Send className="size-3.5" />
                  {submitting ? "Sending…" : "Send"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Close chat" : "Open chat"}
        className={cn(
          "flex size-12 items-center justify-center rounded-full bg-bottle text-paper shadow-lg transition-transform hover:scale-105",
        )}
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </button>
    </div>
  );
}

export { ChatWidget };
