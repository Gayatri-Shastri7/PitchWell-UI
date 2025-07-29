"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AIInput } from "@/components/ui/ai-input";
import { ChatBubble, Message } from "@/components/ui/chat-bubble";
import { WelcomeScreen } from "@/components/ui/welcome-screen";
import { PipelineBuilder } from "@/components/ui/pipeline-builder";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Settings, 
  Workflow, 
  MessageSquare, 
  Sparkles,
  Brain,
  Zap
} from "lucide-react";
import { ChainOfThought } from "@/components/chain-of-thought";
import { Node, Edge } from "@xyflow/react";

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPipelineBuilderOpen, setIsPipelineBuilderOpen] = useState(false);
  const [currentPipeline, setCurrentPipeline] = useState<{ nodes: Node[], edges: Edge[], name?: string } | null>(null);
  const [savedPipelines, setSavedPipelines] = useState<{ name: string, nodes: Node[], edges: Edge[] }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showChainOfThought, setShowChainOfThought] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string, model: string) => {
    // Hide welcome screen when first message is sent
    setShowWelcome(false);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Show chain of thought
    setShowChainOfThought(userMessage.id);

    // Chain of thought will handle the response generation
  };

  const handleChainOfThoughtComplete = (responseContent: string) => {
    setShowChainOfThought(null);
    // Add typing message
    const typingMessage: Message = {
      id: Date.now().toString(),
      role: "assistant", 
      content: responseContent,
      timestamp: new Date(),
      isTyping: true,
    };

    setMessages(prev => [...prev, typingMessage]);

    // After typing completes, replace with final message
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === typingMessage.id 
            ? { ...msg, isTyping: false }
            : msg
        )
      );
      setIsLoading(false);
    }, responseContent.length * 30); // Typing speed
  };

  const handleSavePipeline = (nodes: Node[], edges: Edge[], name: string) => {
    const newPipeline = { name, nodes, edges };
    setSavedPipelines(prev => [...prev, newPipeline]);
    setCurrentPipeline(newPipeline);
    
    // Simulate saving to backend
    const pipelineData = JSON.stringify({ name, nodes, edges }, null, 2);
    const blob = new Blob([pipelineData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\s+/g, '-').toLowerCase()}-pipeline.json`;
    a.click();
    URL.revokeObjectURL(url);

    // Add system message
    const systemMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `Pipeline "${name}" saved successfully! Your custom pipeline contains ${nodes.length} models and ${edges.length} connections. You can now select it from the model dropdown.`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, systemMessage]);
  };

  const handleRunPipeline = (nodes: Node[], edges: Edge[]) => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `Pipeline execution started! Running ${nodes.length} models in sequence. This would typically involve API calls to your FastAPI backend to execute each model in the defined order.`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, systemMessage]);
  };

  return (
    <div className={cn("flex flex-col h-screen bg-background", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Team 12 Custom Chat Builder</h1>
          {currentPipeline && (
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs">
              <Zap className="w-3 h-3" />
              {currentPipeline.name || "Custom Pipeline"} Active
            </div>
          )}
        </div>

        <Dialog open={isPipelineBuilderOpen} onOpenChange={setIsPipelineBuilderOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Workflow className="w-4 h-4" />
              Pipeline Builder
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0">
            <DialogHeader className="p-6 pb-2 border-b">
              <DialogTitle>Visual Model Pipeline Builder</DialogTitle>
            </DialogHeader>
            <div className="h-[calc(90vh-80px)] w-full">
              <PipelineBuilder
                onSavePipeline={handleSavePipeline}
                onRunPipeline={handleRunPipeline}
                className="h-full"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full h-full">
          {showWelcome && messages.length === 0 ? (
            <WelcomeScreen 
              onSendMessage={handleSendMessage}
              onOpenPipelineBuilder={() => setIsPipelineBuilderOpen(true)}
            />
          ) : (
            <>
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <div key={message.id}>
                    <ChatBubble message={message} />
                    {showChainOfThought === message.id && message.role === "user" && (
                      <div className="px-4 py-2">
                        <ChainOfThought 
                          message={message.content}
                          model="GPT-4 Turbo"
                          onComplete={handleChainOfThoughtComplete}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <AIInput
          onSendMessage={handleSendMessage}
          savedPipelines={savedPipelines}
          onSelectPipeline={setCurrentPipeline}
        />
      </div>
    </div>
  );
}