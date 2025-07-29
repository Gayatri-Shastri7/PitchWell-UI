"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileAnalyzer } from "@/components/file-analyzer";
import { PIIDetector } from "@/components/pii-detector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  Paperclip,
  Settings2,
  Mic,
  Upload,
  Shield
} from "lucide-react";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;

      const newHeight = Math.max(
        minHeight,
        Math.min(
          textarea.scrollHeight,
          maxHeight ?? Number.POSITIVE_INFINITY
        )
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

const AI_MODELS = [
  "GPT-4 Turbo",
  "Llama 3 70B",
  "Google Gemma 3 (2T)",
  "Qwen 2.5-Max (72B)",
  "DeepSeek V3 (67B / 37B active)",
  "Mistral 8x22B (MoE)",
  "Claude 3.7 Sonnet",
  "Phi-3 (14B)",
  "OpenChat / Hermes",
  "Command R+"
];

const MODEL_ICONS: Record<string, React.ReactNode> = {
  "GPT-4 Turbo": <Bot className="w-4 h-4" />,
  "Llama 3 70B": <Bot className="w-4 h-4" />,
  "Google Gemma 3 (2T)": <Bot className="w-4 h-4" />,
  "Qwen 2.5-Max (72B)": <Bot className="w-4 h-4" />,
  "DeepSeek V3 (67B / 37B active)": <Bot className="w-4 h-4" />,
  "Mistral 8x22B (MoE)": <Bot className="w-4 h-4" />,
  "Claude 3.7 Sonnet": <Bot className="w-4 h-4" />,
  "Phi-3 (14B)": <Bot className="w-4 h-4" />,
  "OpenChat / Hermes": <Bot className="w-4 h-4" />,
  "Command R+": <Bot className="w-4 h-4" />,
};

interface SavedPipeline {
  name: string;
  nodes: any[];
  edges: any[];
}

interface AIInputProps {
  onSendMessage: (message: string, model: string) => void;
  savedPipelines?: SavedPipeline[];
  onSelectPipeline?: (pipeline: SavedPipeline) => void;
  className?: string;
}

export function AIInput({ onSendMessage, savedPipelines = [], onSelectPipeline, className }: AIInputProps) {
  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 72,
    maxHeight: 300,
  });
  const [selectedModel, setSelectedModel] = useState("GPT-4 Turbo");
  const [isFileAnalyzerOpen, setIsFileAnalyzerOpen] = useState(false);
  const [maskedValue, setMaskedValue] = useState("");
  const [hasPII, setHasPII] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && value.trim()) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!value.trim()) return;
    // Use masked value if PII was detected, otherwise use original
    const messageToSend = hasPII ? maskedValue : value.trim();
    onSendMessage(messageToSend, selectedModel);
    setValue("");
    setMaskedValue("");
    setHasPII(false);
    adjustHeight(true);
  };

  const handlePIIDetection = (masked: string, detections: any[]) => {
    setMaskedValue(masked);
    setHasPII(detections.length > 0);
  };

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
  };

  const handlePipelineSelect = (pipeline: SavedPipeline) => {
    setSelectedModel(pipeline.name);
    onSelectPipeline?.(pipeline);
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-4", className)}>
      {/* PII Detection for user input */}
      {value.trim() && (
        <PIIDetector 
          text={value} 
          onMaskedTextChange={handlePIIDetection}
        />
      )}
      
      <div className="bg-chat-input-bg border border-chat-border rounded-3xl p-4 shadow-sm">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${selectedModel}...`}
            className="resize-none border-0 bg-transparent px-0 py-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 min-h-[24px] max-h-[200px] text-base leading-6"
          />
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-chat-border">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 gap-2 text-sm font-normal rounded-full px-3 hover:bg-muted">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedModel}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2"
                      >
                        {MODEL_ICONS[selectedModel]}
                        <span>{selectedModel}</span>
                        <ChevronDown className="w-4 h-4 opacity-50" />
                      </motion.div>
                    </AnimatePresence>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-[200px]">
                  {AI_MODELS.map((model) => (
                    <DropdownMenuItem
                      key={model}
                      onClick={() => handleModelSelect(model)}
                      className="flex items-center gap-2 text-sm"
                    >
                      {MODEL_ICONS[model]}
                      <span>{model}</span>
                      {selectedModel === model && <Check className="w-4 h-4 ml-auto" />}
                    </DropdownMenuItem>
                  ))}
                    {savedPipelines.length > 0 && (
                      <>
                        <div className="border-t my-1" />
                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Custom Pipelines</div>
                        {savedPipelines.map((pipeline) => (
                          <DropdownMenuItem
                            key={pipeline.name}
                            onClick={() => handlePipelineSelect(pipeline)}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Bot className="w-4 h-4" />
                            <span>{pipeline.name}</span>
                            {selectedModel === pipeline.name && <Check className="w-4 h-4 ml-auto" />}
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                </DropdownMenuContent>
              </DropdownMenu>

            </div>

            <div className="flex items-center gap-2">
              <Dialog open={isFileAnalyzerOpen} onOpenChange={setIsFileAnalyzerOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full hover:bg-muted"
                    aria-label="Attach file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      File Security Analysis
                    </DialogTitle>
                  </DialogHeader>
                   <FileAnalyzer onAnalysisComplete={(result) => {
                     if (result.allowed && result.originalContent) {
                       setIsFileAnalyzerOpen(false);
                       // Add file content to the chat
                       const fileMessage = `**File uploaded successfully!**\n\n**Filename:** ${result.fileName || 'unknown'}\n**File Type:** ${result.fileType}\n\n**Content:**\n\n${result.originalContent}`;
                       onSendMessage(fileMessage, selectedModel);
                     }
                   }} />
                </DialogContent>
              </Dialog>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-muted"
                aria-label="Voice input"
              >
                <Mic className="w-4 h-4" />
              </Button>

              <Button
                onClick={handleSend}
                disabled={!value.trim()}
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
                aria-label="Send message"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}