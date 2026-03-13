"use client";

import { ChangeEvent, FormEvent, KeyboardEvent, useRef } from "react";
import { Send } from "lucide-react";

interface MessageInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function MessageInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: MessageInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) form.requestSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative p-4"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <div className="relative max-w-4xl mx-auto">
        <div
          className="rounded-2xl transition-all"
          style={{
            backgroundColor: "var(--surface-elevated)",
            border: "1px solid var(--border)",
            boxShadow: input ? "0 0 0 2px rgba(139,92,246,0.2)" : "none",
          }}
        >
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Describe the React component you want to create..."
            disabled={isLoading}
            className="w-full min-h-[80px] max-h-[200px] pl-4 pr-14 py-3.5 bg-transparent resize-none focus:outline-none text-[15px] placeholder:text-[var(--muted)] rounded-2xl"
            style={{ color: "var(--foreground)" }}
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-3 bottom-3 p-2.5 rounded-xl transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
          style={
            isLoading || !input.trim()
              ? { backgroundColor: "var(--surface)", color: "var(--muted)" }
              : {
                  background:
                    "linear-gradient(135deg, var(--accent-from), var(--accent-to))",
                  color: "#ffffff",
                  boxShadow: "0 0 12px rgba(139,92,246,0.4)",
                }
          }
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
