"use client";

import * as React from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ModelNode, ModelNodeData } from "./model-node";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import {
  Plus,
  Save,
  Play,
  Download,
  Upload,
  Trash2,
  Copy,
  FolderOpen,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Input } from "./input";
import { Label } from "./label";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const nodeTypes = {
  modelNode: ModelNode,
};

const initialNodes: Node[] = [
  {
    id: "input-node",
    type: "modelNode", 
    position: { x: 100, y: 200 },
    data: {
      label: "Input",
      modelType: "custom",
      status: "idle",
      config: { format: "text" },
      inputTags: [],
      outputTags: ["input_data"],
      isIONode: true,
      nodeType: "input"
    } as ModelNodeData,
  },
  {
    id: "output-node",
    type: "modelNode",
    position: { x: 500, y: 200 },
    data: {
      label: "Output", 
      modelType: "custom",
      status: "idle",
      config: { format: "text" },
      inputTags: ["output_data"],
      outputTags: [],
      isIONode: true,
      nodeType: "output"
    } as ModelNodeData,
  },
];

const initialEdges: Edge[] = [];

const modelTemplates = [
  { id: "gpt4-turbo", label: "GPT-4 Turbo", type: "llm" },
  { id: "llama-70b", label: "Llama 3 70B", type: "llm" },
  { id: "gemma-3", label: "Google Gemma 3 (2T)", type: "llm" },
  { id: "qwen-max", label: "Qwen 2.5-Max (72B)", type: "llm" },
  { id: "deepseek-v3", label: "DeepSeek V3 (67B / 37B active)", type: "llm" },
  { id: "mistral-8x22b", label: "Mistral 8x22B (MoE)", type: "llm" },
  { id: "claude-sonnet", label: "Claude 3.7 Sonnet", type: "llm" },
  { id: "phi-3", label: "Phi-3 (14B)", type: "llm" },
  { id: "openchat", label: "OpenChat / Hermes", type: "llm" },
  { id: "command-r", label: "Command R+", type: "llm" },
  { id: "embedding", label: "Text Embeddings", type: "embedding" },
  { id: "vision", label: "Vision Model", type: "vision" },
  { id: "custom", label: "Custom Model", type: "custom" },
];

const dataFormats = ["text", "image", "video", "audio"];

interface PipelineBuilderProps {
  className?: string;
  onSavePipeline?: (nodes: Node[], edges: Edge[], name: string) => void;
  onLoadPipeline?: (nodes: Node[], edges: Edge[]) => void;
  onRunPipeline?: (nodes: Node[], edges: Edge[]) => void;
}

export function PipelineBuilder({
  className,
  onSavePipeline,
  onLoadPipeline,
  onRunPipeline,
}: PipelineBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);
  const [pipelineName, setPipelineName] = React.useState("");
  const { toast } = useToast();

  const onConnect = React.useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "hsl(var(--primary))",
            },
            style: { stroke: "hsl(var(--primary))" },
          },
          eds
        )
      ),
    [setEdges]
  );

  const addNode = React.useCallback(
    (template: typeof modelTemplates[0]) => {
      const newNode: Node = {
        id: `${Date.now()}`,
        type: "modelNode",
        position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
        data: {
          label: template.label,
          modelType: template.type as ModelNodeData["modelType"],
          status: "idle",
          config: { temperature: 0.7, max_tokens: 1000 },
          inputTags: ["text"],
          outputTags: ["response"],
        } as ModelNodeData,
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const clearCanvas = React.useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [setNodes, setEdges]);

  const duplicateNode = React.useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        const newNode = {
          ...node,
          id: `${Date.now()}`,
          position: { x: node.position.x + 50, y: node.position.y + 50 },
        };
        setNodes((nds) => [...nds, newNode]);
      }
    },
    [nodes, setNodes]
  );

  const deleteNode = React.useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    },
    [setNodes, setEdges]
  );

  const runPipeline = React.useCallback(() => {
    // Simulate pipeline execution
    const nodeIds = nodes.map((node) => node.id);
    
    nodeIds.forEach((id, index) => {
      setTimeout(() => {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === id
              ? { ...node, data: { ...(node.data as ModelNodeData), status: "running" } as ModelNodeData }
              : node
          )
        );
        
        setTimeout(() => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === id
                ? { ...node, data: { ...(node.data as ModelNodeData), status: "completed" } as ModelNodeData }
                : node
            )
          );
          
          // Show completion toast for the last node
          if (index === nodeIds.length - 1) {
            setTimeout(() => {
              toast({
                title: "Pipeline Completed",
                description: "All nodes have finished executing successfully.",
                variant: "default",
              });
            }, 100);
          }
        }, 2000);
      }, index * 1000);
    });

    if (onRunPipeline) {
      onRunPipeline(nodes, edges);
    }
  }, [nodes, edges, setNodes, onRunPipeline, toast]);

  return (
    <div className={cn("h-full flex flex-col bg-background", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Model
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {modelTemplates.map((template) => (
                <DropdownMenuItem
                  key={template.id}
                  onClick={() => addNode(template)}
                >
                  {template.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={clearCanvas}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="pipeline-name" className="text-sm whitespace-nowrap">Name:</Label>
            <Input
              id="pipeline-name"
              placeholder="My Custom Pipeline"
              value={pipelineName}
              onChange={(e) => setPipelineName(e.target.value)}
              className="w-40 h-8"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (pipelineName.trim()) {
                  try {
                    onSavePipeline?.(nodes, edges, pipelineName.trim());
                    toast({
                      title: "Pipeline Saved",
                      description: `Pipeline "${pipelineName.trim()}" has been saved successfully.`,
                      variant: "default",
                    });
                  } catch (error) {
                    toast({
                      title: "Save Failed",
                      description: "Failed to save pipeline. Please try again.",
                      variant: "destructive",
                    });
                  }
                }
              }}
              disabled={!pipelineName.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              try {
                const pipelineData = JSON.stringify({ 
                  name: pipelineName || "Exported Pipeline",
                  nodes, 
                  edges,
                  timestamp: new Date().toISOString()
                }, null, 2);
                const blob = new Blob([pipelineData], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${(pipelineName || "pipeline").replace(/\s+/g, '-').toLowerCase()}.json`;
                a.click();
                URL.revokeObjectURL(url);
                toast({
                  title: "Pipeline Exported",
                  description: "Pipeline has been downloaded as JSON file.",
                  variant: "default",
                });
              } catch (error) {
                toast({
                  title: "Export Failed",
                  description: "Failed to export pipeline. Please try again.",
                  variant: "destructive",
                });
              }
            }}
            disabled={nodes.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".json";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    try {
                      const data = JSON.parse(e.target?.result as string);
                      setNodes(data.nodes || initialNodes);
                      setEdges(data.edges || initialEdges);
                      setPipelineName(data.name || "Imported Pipeline");
                      onLoadPipeline?.(data.nodes || [], data.edges || []);
                      toast({
                        title: "Pipeline Loaded",
                        description: `Pipeline "${data.name || "Imported Pipeline"}" has been loaded successfully.`,
                        variant: "default",
                      });
                    } catch (error) {
                      console.error("Failed to load pipeline:", error);
                      toast({
                        title: "Load Failed",
                        description: "Failed to load pipeline. Please check the file format.",
                        variant: "destructive",
                      });
                    }
                  };
                  reader.readAsText(file);
                }
              };
              input.click();
            }}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Load
          </Button>

          <Button
            size="sm"
            onClick={runPipeline}
            disabled={nodes.length === 0}
          >
            <Play className="w-4 h-4 mr-2" />
            Run Pipeline
          </Button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background h-full w-full"
        >
          <Background color="hsl(var(--muted))" gap={16} />
          <Controls className="bg-secondary border-border" />
          <MiniMap
            className="bg-secondary border border-border"
            nodeColor="hsl(var(--primary))"
            maskColor="hsl(var(--background) / 0.8)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}