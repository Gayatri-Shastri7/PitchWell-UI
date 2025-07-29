"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Code, 
  Brain, 
  MessageSquare,
  ArrowRight,
  Workflow
} from "lucide-react";

interface WelcomeScreenProps {
  onSendMessage: (content: string, model: string) => void;
  onOpenPipelineBuilder: () => void;
  className?: string;
}

const suggestions = [
  {
    icon: Code,
    title: "Write Code",
    description: "Help me write a Python function",
    prompt: "Help me write a Python function that calculates the fibonacci sequence"
  },
  {
    icon: Brain,
    title: "Explain Concepts",
    description: "Explain machine learning basics",
    prompt: "Explain the basics of machine learning and neural networks in simple terms"
  },
  {
    icon: Workflow,
    title: "Build Pipeline",
    description: "Create a custom model pipeline",
    action: "pipeline"
  },
  {
    icon: MessageSquare,
    title: "General Chat",
    description: "Ask me anything",
    prompt: "What are the latest developments in AI technology?"
  }
];

export function WelcomeScreen({ onSendMessage, onOpenPipelineBuilder, className }: WelcomeScreenProps) {
  const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
    if (suggestion.action === "pipeline") {
      onOpenPipelineBuilder();
    } else if (suggestion.prompt) {
      onSendMessage(suggestion.prompt, "Claude 3.5 Sonnet");
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center min-h-full p-8", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto"
      >
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl font-semibold text-foreground mb-2"
          >
            How can I help you today?
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-muted-foreground text-lg"
          >
            I can help you with coding, explanations, analysis, and building custom AI pipelines.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto"
        >
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            >
              <Button
                variant="outline"
                className={cn(
                  "h-auto p-4 w-full text-left flex items-start gap-3",
                  "hover:border-primary hover:bg-primary/5 transition-all duration-200",
                  "group"
                )}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <suggestion.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground mb-1">
                    {suggestion.title}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {suggestion.description}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}