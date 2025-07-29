"use client";

import * as React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { Bot, Settings, Play, Pause, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "./button";
import { EditableNodeTag } from "./editable-node-tag";
import { Input } from "./input";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

export interface ModelNodeData extends Record<string, unknown> {
  label: string;
  modelType: "llm" | "embedding" | "vision" | "audio" | "custom";
  status: "idle" | "running" | "completed" | "error";
  config?: Record<string, any>;
  inputTags?: string[];
  outputTags?: string[];
  isIONode?: boolean;
  nodeType?: "input" | "output";
}

const modelTypeIcons = {
  llm: Bot,
  embedding: Bot,
  vision: Bot,
  audio: Bot,
  custom: Bot,
};

const statusColors = {
  idle: "border-border bg-secondary",
  running: "border-primary bg-primary/10 animate-pulse",
  completed: "border-ai-success bg-ai-success/10",
  error: "border-destructive bg-destructive/10",
};

export function ModelNode({ data, selected, id }: NodeProps & { data: ModelNodeData }) {
  const Icon = data.isIONode ? (data.nodeType === "input" ? ArrowRight : ArrowLeft) : modelTypeIcons[data.modelType];
  const [isConfigOpen, setIsConfigOpen] = React.useState(false);
  const [localData, setLocalData] = React.useState(data);

  // Special styling for I/O nodes
  const ioNodeStyles = data.isIONode 
    ? data.nodeType === "input"
      ? "border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-800"
      : "border-blue-300 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800"
    : "";

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border-2 bg-background p-4 shadow-lg transition-all",
        data.isIONode ? ioNodeStyles : statusColors[data.status],
        selected && "ring-2 ring-primary ring-offset-2",
        "hover:shadow-xl"
      )}
    >
      {/* Input Handle - only show for non-input nodes */}
      {data.nodeType !== "input" && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 border-2 border-primary bg-background"
        />
      )}

      {/* Node Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn(
            "w-5 h-5",
            data.isIONode 
              ? data.nodeType === "input" ? "text-green-600" : "text-blue-600"
              : "text-primary"
          )} />
          <span className="font-medium text-sm">{data.label}</span>
        </div>
        <div className="flex items-center gap-1">
          {!data.isIONode && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsConfigOpen(!isConfigOpen)}
            >
              <Settings className="w-3 h-3" />
            </Button>
          )}
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              data.status === "running" && "bg-primary",
              data.status === "completed" && "bg-ai-success",
              data.status === "error" && "bg-destructive",
              data.status === "idle" && "bg-muted"
            )}
          />
        </div>
      </div>

      {/* Input Tags / Format Selection */}
      {data.isIONode ? (
        <div className="space-y-2 mb-2">
          <div className="text-xs text-muted-foreground">Format:</div>
          <Select 
            value={localData.config?.format || "text"} 
            onValueChange={(value) => setLocalData(prev => ({ 
              ...prev, 
              config: { ...prev.config, format: value } 
            }))}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-1 mb-2">
          <div className="text-xs text-muted-foreground">Input:</div>
          <div className="flex flex-wrap gap-1">
            {(localData.inputTags || ["text"]).map((tag, idx) => (
              <EditableNodeTag
                key={`input-${idx}`}
                value={tag}
                variant="input"
                onValueChange={(value) => {
                  const newTags = [...(localData.inputTags || ["text"])];
                  newTags[idx] = value;
                  setLocalData(prev => ({ ...prev, inputTags: newTags }));
                }}
                placeholder="input type"
              />
            ))}
          </div>
        </div>
      )}

      {/* Node Content */}
      {!data.isIONode && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Type: {localData.modelType.toUpperCase()}
          </div>
          
          {localData.status === "running" && (
            <div className="text-xs text-primary font-medium">
              Processing...
            </div>
          )}
          
          {localData.status === "completed" && (
            <div className="text-xs text-ai-success font-medium">
              ✓ Completed
            </div>
          )}
          
          {localData.status === "error" && (
            <div className="text-xs text-destructive font-medium">
              ✗ Error
            </div>
          )}
        </div>
      )}

      {/* Output Tags */}
      {!data.isIONode && (
        <div className="space-y-1 mt-2">
          <div className="text-xs text-muted-foreground">Output:</div>
          <div className="flex flex-wrap gap-1">
            {(localData.outputTags || ["response"]).map((tag, idx) => (
              <EditableNodeTag
                key={`output-${idx}`}
                value={tag}
                variant="output"
                onValueChange={(value) => {
                  const newTags = [...(localData.outputTags || ["response"])];
                  newTags[idx] = value;
                  setLocalData(prev => ({ ...prev, outputTags: newTags }));
                }}
                placeholder="output type"
              />
            ))}
          </div>
        </div>
      )}

      {/* Configuration Panel */}
      {isConfigOpen && !data.isIONode && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          <div className="text-xs text-muted-foreground mb-2">Configuration</div>
          <div className="space-y-2">
            <div>
              <Label htmlFor={`temp-${id}`} className="text-xs">Temperature</Label>
              <Input
                id={`temp-${id}`}
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={localData.config?.temperature || 0.7}
                onChange={(e) => setLocalData(prev => ({
                  ...prev,
                  config: { ...prev.config, temperature: parseFloat(e.target.value) }
                }))}
                className="h-6 text-xs"
              />
            </div>
            <div>
              <Label htmlFor={`tokens-${id}`} className="text-xs">Max Tokens</Label>
              <Input
                id={`tokens-${id}`}
                type="number"
                value={localData.config?.max_tokens || 1000}
                onChange={(e) => setLocalData(prev => ({
                  ...prev,
                  config: { ...prev.config, max_tokens: parseInt(e.target.value) }
                }))}
                className="h-6 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Output Handle - only show for non-output nodes */}
      {data.nodeType !== "output" && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 border-2 border-primary bg-background"
        />
      )}
    </div>
  );
}