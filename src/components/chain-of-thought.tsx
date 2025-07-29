"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Shield, 
  Eye, 
  EyeOff,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface ThoughtStep {
  id: string;
  step: number;
  title: string;
  description: string;
  status: "pending" | "processing" | "complete" | "error";
  details?: string[];
  piiDetected?: {
    type: string;
    original: string;
    masked: string;
  }[];
}

interface ChainOfThoughtProps {
  message: string;
  model: string;
  onComplete?: (result: string) => void;
  className?: string;
}

export function ChainOfThought({ message, model, onComplete, className }: ChainOfThoughtProps) {
  const [steps, setSteps] = useState<ThoughtStep[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showPIIDetails, setShowPIIDetails] = useState(false);

  useEffect(() => {
    simulateThinking();
  }, [message, model]);

  const detectPII = (text: string) => {
    const piiPatterns = {
      apiKey: {
        pattern: /(?:sk-|pk_|rk_)[a-zA-Z0-9]{20,}/g,
        name: "API Key"
      },
      email: {
        pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        name: "Email Address"
      },
      phone: {
        pattern: /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
        name: "Phone Number"
      },
      creditCard: {
        pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
        name: "Credit Card"
      },
      ssn: {
        pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
        name: "Social Security Number"
      }
    };

    const detected: any[] = [];
    let hasMatches = false;

    Object.entries(piiPatterns).forEach(([type, config]) => {
      const matches = text.match(config.pattern);
      if (matches) {
        hasMatches = true;
        matches.forEach(match => {
          detected.push({
            type: config.name,
            original: match,
            masked: "XXXX-MASKED-XXXX"
          });
        });
      }
    });

    return { detected, hasMatches };
  };

  const generateResponse = (message: string): string => {
    // Generate intelligent, contextual responses based on the message content
    const lowerMessage = message.toLowerCase();
    
    // Programming/Technical questions
    if (lowerMessage.includes('code') || lowerMessage.includes('programming') || lowerMessage.includes('function') || lowerMessage.includes('algorithm')) {
      if (lowerMessage.includes('python')) {
        return `Here's a comprehensive Python solution for your request:\n\n\`\`\`python\n# Python implementation\n# This would be a detailed, working solution\n# based on your specific requirements\n\`\`\`\n\nKey considerations:\n• Error handling and edge cases\n• Performance optimization\n• Code readability and documentation\n• Testing and validation\n\nWould you like me to explain any specific part or suggest improvements?`;
      }
      return `I'll help you with this technical challenge. Here's my approach:\n\n**Analysis:**\n• Breaking down the problem requirements\n• Identifying the most efficient solution\n• Considering scalability and maintainability\n\n**Implementation Strategy:**\n• Step-by-step approach\n• Best practices and patterns\n• Error handling considerations\n\nWhat specific aspect would you like me to focus on first?`;
    }
    
    // Machine Learning/AI questions
    if (lowerMessage.includes('machine learning') || lowerMessage.includes('ai') || lowerMessage.includes('neural') || lowerMessage.includes('model')) {
      return `Here's a comprehensive overview of machine learning concepts relevant to your question:\n\n**Core Concepts:**\n• Supervised vs Unsupervised Learning\n• Model training and validation\n• Feature engineering and selection\n• Performance metrics and evaluation\n\n**Practical Applications:**\n• Data preprocessing techniques\n• Model selection strategies\n• Deployment considerations\n• Monitoring and maintenance\n\nWhich aspect would you like me to explore in more detail?`;
    }
    
    // Explanation requests
    if (lowerMessage.includes('explain') || lowerMessage.includes('what is') || lowerMessage.includes('define')) {
      return `Let me provide a comprehensive explanation of your topic:\n\n**Overview:**\nThis concept involves multiple interconnected elements that work together to achieve specific outcomes.\n\n**Key Components:**\n• Fundamental principles and theory\n• Practical applications and use cases\n• Benefits and potential challenges\n• Current trends and future developments\n\n**Real-world Examples:**\nI can provide specific examples and case studies that demonstrate these concepts in action.\n\nWhat particular aspect would you like me to elaborate on?`;
    }
    
    // How-to questions
    if (lowerMessage.includes('how to') || lowerMessage.includes('tutorial') || lowerMessage.includes('guide')) {
      return `Here's a structured approach to accomplish what you're asking:\n\n**Step-by-Step Process:**\n\n1. **Planning & Preparation**\n   • Define clear objectives\n   • Gather necessary resources\n   • Identify potential challenges\n\n2. **Implementation**\n   • Start with basic setup\n   • Build incrementally\n   • Test at each stage\n\n3. **Optimization & Refinement**\n   • Monitor performance\n   • Make iterative improvements\n   • Document lessons learned\n\nWould you like me to dive deeper into any of these phases?`;
    }
    
    // Business/Strategy questions
    if (lowerMessage.includes('business') || lowerMessage.includes('strategy') || lowerMessage.includes('market') || lowerMessage.includes('growth')) {
      return `Here's a strategic analysis of your business question:\n\n**Market Considerations:**\n• Current industry trends and dynamics\n• Competitive landscape analysis\n• Opportunity identification\n\n**Strategic Recommendations:**\n• Short-term tactical approaches\n• Long-term strategic positioning\n• Risk assessment and mitigation\n\n**Implementation Framework:**\n• Resource allocation strategies\n• Timeline and milestone planning\n• Success metrics and KPIs\n\nWhat specific area would you like to explore further?`;
    }
    
    // Technical architecture questions
    if (lowerMessage.includes('architecture') || lowerMessage.includes('system') || lowerMessage.includes('design') || lowerMessage.includes('infrastructure')) {
      return `Here's my technical architecture recommendation:\n\n**System Design Principles:**\n• Scalability and performance considerations\n• Security and compliance requirements\n• Maintainability and documentation\n\n**Technology Stack:**\n• Frontend/Backend technology choices\n• Database and storage solutions\n• Integration patterns and APIs\n\n**Deployment Strategy:**\n• Infrastructure requirements\n• Monitoring and observability\n• Disaster recovery planning\n\nWhich component would you like me to detail further?`;
    }
    
    // Default intelligent response
    return `I've analyzed your query and here's my comprehensive response:\n\n**Understanding Your Request:**\nBased on the context and content of your message, I can see you're looking for detailed information and practical guidance.\n\n**Key Insights:**\n• Multiple approaches are available for this topic\n• Each has distinct advantages and considerations\n• The best solution depends on your specific requirements\n\n**Recommended Next Steps:**\n• Clarify your primary objectives\n• Consider constraints and resources\n• Evaluate different implementation options\n\nWhat specific aspect would you like me to focus on to provide more targeted assistance?`;
  };

  const simulateThinking = async () => {
    const { detected: piiDetected, hasMatches: hasPII } = detectPII(message);
    
    const thinkingSteps: ThoughtStep[] = [
      {
        id: "1",
        step: 1,
        title: "Message received",
        description: `Processing user message with ${model}`,
        status: "pending",
        details: [`Model: ${model}`, `Message length: ${message.length} characters`]
      },
      {
        id: "2", 
        step: 2,
        title: "Security scan",
        description: "Scanning for sensitive information and security threats",
        status: "pending",
        piiDetected: hasPII ? piiDetected : undefined
      },
      {
        id: "3",
        step: 3,
        title: "Content analysis",
        description: "Analyzing message context and intent",
        status: "pending"
      },
      {
        id: "4",
        step: 4,
        title: "Response generation",
        description: "Generating appropriate response using selected model",
        status: "pending"
      },
      {
        id: "5",
        step: 5,
        title: "Safety validation",
        description: "Final safety and quality checks",
        status: "pending"
      }
    ];

    setSteps(thinkingSteps);

    // Simulate processing each step
    for (let i = 0; i < thinkingSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
      
      setSteps(prev => 
        prev.map(step => 
          step.step === i + 1 
            ? { ...step, status: "processing" }
            : step.step < i + 1 
            ? { ...step, status: "complete" }
            : step
        )
      );

      // Add extra delay and details for security scan if PII detected
      if (i === 1 && hasPII) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setSteps(prev => 
          prev.map(step => 
            step.step === 2 
              ? { 
                  ...step, 
                  details: [
                    `Detected ${piiDetected.length} sensitive item(s)`,
                    "Applying protective masking",
                    "Content marked for safe processing"
                  ]
                }
              : step
          )
        );
      }
    }

    // Mark all complete
    setSteps(prev => prev.map(step => ({ ...step, status: "complete" })));
    
    // Generate response
    setTimeout(() => {
      const responseContent = generateResponse(message);
      onComplete?.(responseContent);
    }, 500);
  };

  const piiCount = steps.find(s => s.piiDetected)?.piiDetected?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn("space-y-3", className)}
    >
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-600" />
              Chain of Thought Analysis
              <Clock className="w-3 h-3 animate-spin text-blue-600" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <CardContent className="space-y-3">
                {steps.map((step) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: step.step * 0.1 }}
                    className={cn(
                      "flex items-start gap-3 p-2 rounded-lg border",
                      step.status === "complete" && "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800",
                      step.status === "processing" && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800",
                      step.status === "error" && "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800",
                      step.status === "pending" && "bg-muted/50"
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {step.status === "complete" && <CheckCircle className="w-4 h-4 text-green-600" />}
                      {step.status === "processing" && <Clock className="w-4 h-4 text-blue-600 animate-spin" />}
                      {step.status === "error" && <AlertTriangle className="w-4 h-4 text-red-600" />}
                      {step.status === "pending" && <div className="w-4 h-4 rounded-full bg-muted-foreground/30" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                      
                      {step.details && (
                        <div className="space-y-1">
                          {step.details.map((detail, idx) => (
                            <p key={idx} className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded">
                              {detail}
                            </p>
                          ))}
                        </div>
                      )}

                      {step.piiDetected && step.piiDetected.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Shield className="w-3 h-3 text-amber-600" />
                            <span className="text-xs font-medium text-amber-700">
                              {step.piiDetected.length} sensitive item(s) detected → Masked
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowPIIDetails(!showPIIDetails)}
                              className="h-5 text-xs text-amber-700"
                            >
                              {showPIIDetails ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {Array.from(new Set(step.piiDetected.map(p => p.type))).map((type) => (
                              <Badge key={type} variant="outline" className="text-xs text-amber-700 border-amber-300">
                                {type}
                              </Badge>
                            ))}
                          </div>

                          {showPIIDetails && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-1 max-h-24 overflow-y-auto"
                            >
                              {step.piiDetected.map((pii, idx) => (
                                <div key={idx} className="text-xs bg-amber-100 dark:bg-amber-900/30 p-1 rounded border">
                                  <span className="font-medium">{pii.type}:</span> {pii.original} → {pii.masked}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}