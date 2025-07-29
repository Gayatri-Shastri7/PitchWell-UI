"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Badge } from "./badge";
import { Button } from "./button";
import { Edit3, Check, X } from "lucide-react";

interface EditableNodeTagProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  variant?: "input" | "output";
}

export function EditableNodeTag({ 
  value, 
  onValueChange, 
  placeholder = "Enter tag...", 
  className,
  variant = "input"
}: EditableNodeTagProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onValueChange(editValue.trim() || placeholder);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-6 text-xs min-w-16 w-auto"
          autoFocus
          onBlur={handleSave}
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0"
          onClick={handleSave}
        >
          <Check className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0"
          onClick={handleCancel}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <Badge
      variant={variant === "input" ? "secondary" : "default"}
      className={cn(
        "text-xs cursor-pointer hover:bg-muted-foreground/20 transition-colors group",
        variant === "input" && "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
        variant === "output" && "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
        className
      )}
      onClick={() => setIsEditing(true)}
    >
      <span className="group-hover:opacity-80">{value || placeholder}</span>
      <Edit3 className="w-2 h-2 ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />
    </Badge>
  );
}