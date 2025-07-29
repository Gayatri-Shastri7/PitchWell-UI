"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle,
  Lock,
  Brain
} from "lucide-react";

interface PIIDetection {
  type: string;
  original: string;
  masked: string;
  position: { start: number; end: number };
}

interface PIIDetectorProps {
  text: string;
  onMaskedTextChange?: (maskedText: string, detections: PIIDetection[]) => void;
  className?: string;
}

const PII_PATTERNS = {
  openaiKey: {
    pattern: /(sk-[a-zA-Z0-9]{48})/g,
    name: "OpenAI API Key",
    maskChar: "x"
  },
  apiKey: {
    pattern: /(?:api[_-]?key|token|secret|password)[:\s=]+([a-zA-Z0-9_\-+/=]{20,})/gi,
    name: "API Key/Token",
    maskChar: "x"
  },
  email: {
    pattern: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    name: "Email Address",
    maskChar: "X"
  },
  phone: {
    pattern: /((?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/g,
    name: "Phone Number",
    maskChar: "X"
  },
  creditCard: {
    pattern: /(\b(?:\d{4}[-\s]?){3}\d{4}\b)/g,
    name: "Credit Card",
    maskChar: "X"
  },
  ssn: {
    pattern: /(\b\d{3}-\d{2}-\d{4}\b)/g,
    name: "Social Security Number",
    maskChar: "X"
  },
  ipAddress: {
    pattern: /(\b(?:\d{1,3}\.){3}\d{1,3}\b)/g,
    name: "IP Address",
    maskChar: "X"
  },
  awsKey: {
    pattern: /(AKIA[0-9A-Z]{16})/g,
    name: "AWS Access Key",
    maskChar: "X"
  },
  githubToken: {
    pattern: /(ghp_[a-zA-Z0-9]{36})/g,
    name: "GitHub Token",
    maskChar: "x"
  }
};

export function PIIDetector({ text, onMaskedTextChange, className }: PIIDetectorProps) {
  const [detections, setDetections] = useState<PIIDetection[]>([]);
  const [maskedText, setMaskedText] = useState(text);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    analyzeText(text);
  }, [text]);

  const analyzeText = async (inputText: string) => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const found: PIIDetection[] = [];
    let processedText = inputText;
    let offset = 0;

    // Sort patterns by position to handle overlapping matches
    const allMatches: Array<{
      type: string;
      match: RegExpExecArray;
      name: string;
      maskChar: string;
    }> = [];

    Object.entries(PII_PATTERNS).forEach(([type, config]) => {
      const regex = new RegExp(config.pattern.source, config.pattern.flags);
      let match;
      
      while ((match = regex.exec(inputText)) !== null) {
        allMatches.push({
          type,
          match,
          name: config.name,
          maskChar: config.maskChar
        });
      }
    });

    // Sort by position
    allMatches.sort((a, b) => a.match.index - b.match.index);

    // Process matches and create masked text
    allMatches.forEach(({ type, match, name, maskChar }) => {
      const original = match[1] || match[0];
      const startPos = match.index + offset;
      const endPos = startPos + original.length;
      
      // Create mask preserving some structure for readability
      let masked;
      if (type === 'email') {
        const [localPart, domain] = original.split('@');
        masked = `${localPart.charAt(0)}${'X'.repeat(Math.max(1, localPart.length - 2))}${localPart.charAt(localPart.length - 1)}@${domain}`;
      } else if (type === 'phone') {
        masked = `XXX-XXX-${original.slice(-4)}`;
      } else if (type === 'creditCard') {
        masked = `XXXX-XXXX-XXXX-${original.slice(-4)}`;
      } else {
        // For API keys and other sensitive data, mask more aggressively
        const visibleChars = Math.min(4, Math.floor(original.length * 0.2));
        masked = original.slice(0, visibleChars) + 'X'.repeat(Math.max(4, original.length - visibleChars));
      }

      found.push({
        type: name,
        original,
        masked,
        position: { start: startPos, end: endPos }
      });

      // Replace in processed text
      const beforeMask = processedText.substring(0, startPos);
      const afterMask = processedText.substring(endPos);
      processedText = beforeMask + masked + afterMask;
      
      // Adjust offset for length difference
      offset += masked.length - original.length;
    });

    setDetections(found);
    setMaskedText(processedText);
    setIsAnalyzing(false);
    
    onMaskedTextChange?.(processedText, found);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
              <CardContent className="py-3">
                <div className="flex items-center gap-2 text-blue-600">
                  <Brain className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-medium">Analyzing for sensitive information...</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <Shield className="h-4 w-4 text-amber-600" />
              <AlertDescription className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Sensitive information detected and masked for your safety
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      {detections.length} potential security issue(s) found
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOriginal(!showOriginal)}
                    className="text-amber-700 hover:text-amber-800 dark:text-amber-300"
                  >
                    {showOriginal ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Hide Original
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Show Original
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Detected:</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(detections.map(d => d.type))).map((type) => (
                      <Badge key={type} variant="outline" className="text-amber-700 border-amber-300">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                {showOriginal && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Original values:</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {detections.map((detection, idx) => (
                        <div key={idx} className="text-xs bg-amber-100 dark:bg-amber-900/30 p-2 rounded border">
                          <span className="font-medium">{detection.type}:</span> {detection.original}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {detections.length === 0 && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <span className="font-medium text-green-800 dark:text-green-200">
                No sensitive information detected
              </span>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your input appears to be safe for processing.
              </p>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Masked Text Preview */}
      {detections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lock className="w-4 h-4" />
              Processed Text (Sensitive Data Masked)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-3 rounded border text-sm">
              <pre className="whitespace-pre-wrap font-mono">{maskedText}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}