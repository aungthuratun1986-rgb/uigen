"use client";

import { Message } from "ai";
import { cn } from "@/lib/utils";
import { User, Bot, Loader2 } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

const SUGGESTIONS = [
  { emoji: "🎨", label: "Login form",  prompt: "Create a login form with email and password fields" },
  { emoji: "🧭", label: "Navbar",      prompt: "Build a responsive navigation bar with a logo and links" },
  { emoji: "🃏", label: "Card UI",     prompt: "Design a product card with image, title, price, and button" },
  { emoji: "✨", label: "Button set",  prompt: "Create a set of stylish buttons: primary, secondary, and danger" },
];

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onSuggestionClick?: (prompt: string) => void;
}

export function MessageList({ messages, isLoading, onSuggestionClick }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 animate-pulse-glow"
          style={{
            background: "linear-gradient(135deg, var(--accent-from), var(--accent-to))",
          }}
        >
          <span className="text-3xl text-white font-bold">◈</span>
        </div>

        <h2
          className="text-xl font-bold mb-2"
          style={{ color: "var(--foreground)" }}
        >
          What will you build today?
        </h2>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
          AI-powered React component generator
        </p>

        {/* Suggestion chips */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              onClick={() => onSuggestionClick?.(s.prompt)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all hover:scale-[1.03] hover:shadow-lg"
              style={{
                backgroundColor: "var(--surface-elevated)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              <span className="text-base">{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-6">
      <div className="space-y-5 max-w-4xl mx-auto w-full">
        {messages.map((message, idx) => (
          <div
            key={message.id || message.content}
            className={cn(
              "flex gap-3 animate-fadeInUp",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
            style={{ animationDelay: `${idx * 30}ms` }}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0 mt-1">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-from), var(--accent-to))",
                  }}
                >
                  <Bot className="h-4 w-4 text-white" />
                </div>
              </div>
            )}

            <div
              className={cn(
                "flex flex-col gap-2 max-w-[85%]",
                message.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn("rounded-2xl px-4 py-3")}
                style={
                  message.role === "user"
                    ? {
                        background:
                          "linear-gradient(135deg, var(--accent-from), var(--accent-to))",
                        color: "#ffffff",
                      }
                    : {
                        backgroundColor: "var(--surface-elevated)",
                        border: "1px solid rgba(139,92,246,0.2)",
                        color: "var(--foreground)",
                      }
                }
              >
                <div className="text-sm">
                  {message.parts ? (
                    <>
                      {message.parts.map((part, partIndex) => {
                        switch (part.type) {
                          case "text":
                            return message.role === "user" ? (
                              <span key={partIndex} className="whitespace-pre-wrap">
                                {part.text}
                              </span>
                            ) : (
                              <MarkdownRenderer
                                key={partIndex}
                                content={part.text}
                                className="prose-sm"
                              />
                            );
                          case "reasoning":
                            return (
                              <div
                                key={partIndex}
                                className="mt-3 p-3 rounded-md"
                                style={{
                                  backgroundColor: "rgba(139,92,246,0.08)",
                                  border: "1px solid rgba(139,92,246,0.2)",
                                }}
                              >
                                <span
                                  className="text-xs font-medium block mb-1"
                                  style={{ color: "var(--accent-from)" }}
                                >
                                  Reasoning
                                </span>
                                <span className="text-sm" style={{ color: "var(--muted)" }}>
                                  {part.reasoning}
                                </span>
                              </div>
                            );
                          case "tool-invocation":
                            const tool = part.toolInvocation;
                            return (
                              <div
                                key={partIndex}
                                className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg text-xs font-mono"
                                style={{
                                  backgroundColor: "rgba(139,92,246,0.1)",
                                  border: "1px solid rgba(139,92,246,0.2)",
                                  color: "var(--muted)",
                                }}
                              >
                                {tool.state === "result" && tool.result ? (
                                  <>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span>{tool.toolName}</span>
                                  </>
                                ) : (
                                  <>
                                    <Loader2
                                      className="w-3 h-3 animate-spin"
                                      style={{ color: "var(--accent-from)" }}
                                    />
                                    <span>{tool.toolName}</span>
                                  </>
                                )}
                              </div>
                            );
                          case "source":
                            return (
                              <div key={partIndex} className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
                                Source: {JSON.stringify(part.source)}
                              </div>
                            );
                          case "step-start":
                            return partIndex > 0 ? (
                              <hr
                                key={partIndex}
                                className="my-3"
                                style={{ borderColor: "var(--border)" }}
                              />
                            ) : null;
                          default:
                            return null;
                        }
                      })}
                      {isLoading &&
                        message.role === "assistant" &&
                        messages.indexOf(message) === messages.length - 1 && (
                          <div
                            className="flex items-center gap-2 mt-3"
                            style={{ color: "var(--muted)" }}
                          >
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span className="text-sm">Generating...</span>
                          </div>
                        )}
                    </>
                  ) : message.content ? (
                    message.role === "user" ? (
                      <span className="whitespace-pre-wrap">{message.content}</span>
                    ) : (
                      <MarkdownRenderer content={message.content} className="prose-sm" />
                    )
                  ) : isLoading &&
                    message.role === "assistant" &&
                    messages.indexOf(message) === messages.length - 1 ? (
                    <div
                      className="flex items-center gap-2"
                      style={{ color: "var(--muted)" }}
                    >
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-sm">Generating...</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {message.role === "user" && (
              <div className="flex-shrink-0 mt-1">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-from), var(--accent-to))",
                  }}
                >
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
