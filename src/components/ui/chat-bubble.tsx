"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { ShiningText } from "./shining-text";
import { TypingText } from "./typing-text";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isThinking?: boolean;
  isTyping?: boolean;
}

interface ChatBubbleProps {
  message: Message;
  className?: string;
}

export function ChatBubble({ message, className }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const isThinking = message.isThinking;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group flex w-full px-4 py-4",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      <div className={cn(
        "flex gap-3 max-w-[80%]",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium",
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            )}
          >
            {isUser ? <User size={14} /> : <Bot size={14} />}
          </div>
        </div>

        {/* Message Content */}
        <div className={cn(
          "rounded-2xl px-4 py-3 max-w-full",
          isUser 
            ? "bg-primary text-primary-foreground ml-2"
            : "bg-muted text-foreground mr-2"
        )}>
          <div className="text-sm leading-relaxed">
            {isThinking ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShiningText text="AI is thinking..." />
                <div className="flex gap-1">
                  <div className="thinking-dots h-1 w-1 rounded-full bg-current"></div>
                  <div className="thinking-dots h-1 w-1 rounded-full bg-current"></div>
                  <div className="thinking-dots h-1 w-1 rounded-full bg-current"></div>
                </div>
              </div>
            ) : message.isTyping ? (
              <TypingText text={message.content} speed={30} />
            ) : (
              <div className="whitespace-pre-wrap">{message.content}</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}