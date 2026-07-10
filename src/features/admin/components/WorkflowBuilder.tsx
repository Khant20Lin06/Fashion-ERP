"use client"

import { useState } from "react"
import { DndContext, useDraggable, type DragEndEvent } from "@dnd-kit/core"
import { Bell, CheckCircle2, GitBranch, Play, Plus, Save, Trash2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WorkflowNode } from "@/components/admin/WorkflowNode"
import { useSaveWorkflow } from "../hooks/useWorkflow"
import type { Workflow, WorkflowEdge, WorkflowNode as WorkflowNodeData, WorkflowNodeType } from "../types"

const nodeTypeOptions: { type: WorkflowNodeType; label: string; icon: typeof Play }[] = [
  { type: "trigger", label: "Trigger", icon: Play },
  { type: "condition", label: "Condition", icon: GitBranch },
  { type: "approval", label: "Approval Step", icon: CheckCircle2 },
  { type: "action", label: "Action", icon: Zap },
  { type: "notification", label: "Notification", icon: Bell },
]

function DraggableNode({
  node,
  selected,
  onSelect,
}: {
  node: WorkflowNodeData
  selected: boolean
  onSelect: () => void
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: node.id })
  const style = {
    position: "absolute" as const,
    left: node.x + (transform?.x ?? 0),
    top: node.y + (transform?.y ?? 0),
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab touch-none active:cursor-grabbing">
      <WorkflowNode label={node.label} type={node.type} selected={selected} onClick={onSelect} />
    </div>
  )
}

type WorkflowBuilderProps = {
  workflow: Workflow
}

/** Drag-and-drop workflow builder canvas — position Trigger/Condition/Approval/Action/Notification nodes freely. */
export function WorkflowBuilder({ workflow }: WorkflowBuilderProps) {
  const [nodes, setNodes] = useState<WorkflowNodeData[]>(workflow.nodes)
  const [edges, setEdges] = useState<WorkflowEdge[]>(workflow.edges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined)
  const saveWorkflow = useSaveWorkflow(workflow.id)

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event
    setNodes((prev) =>
      prev.map((node) => (node.id === active.id ? { ...node, x: node.x + delta.x, y: node.y + delta.y } : node))
    )
  }

  function handleAddNode(type: WorkflowNodeType) {
    const template = nodeTypeOptions.find((n) => n.type === type)
    if (!template) return
    const newNode: WorkflowNodeData = {
      id: `node-${crypto.randomUUID()}`,
      type,
      label: template.label,
      x: 40,
      y: 40 + nodes.length * 90,
    }
    setNodes((prev) => [...prev, newNode])
  }

  function handleDeleteSelected() {
    if (!selectedNodeId) return
    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId))
    setEdges((prev) => prev.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId))
    setSelectedNodeId(undefined)
  }

  function handleSave() {
    saveWorkflow.mutate({ nodes, edges })
  }

  const nodeCenter = (node: WorkflowNodeData) => ({ x: node.x + 80, y: node.y + 24 })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus /> Add Node
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {nodeTypeOptions.map((option) => (
              <DropdownMenuItem key={option.type} onClick={() => handleAddNode(option.type)}>
                <option.icon /> {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDeleteSelected} disabled={!selectedNodeId}>
            <Trash2 /> Delete Selected
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saveWorkflow.isPending}>
            <Save /> Save Workflow
          </Button>
        </div>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="relative h-[420px] w-full overflow-auto rounded-lg border bg-muted/20">
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {edges.map((edge) => {
              const source = nodes.find((n) => n.id === edge.source)
              const target = nodes.find((n) => n.id === edge.target)
              if (!source || !target) return null
              const from = nodeCenter(source)
              const to = nodeCenter(target)
              return (
                <line
                  key={edge.id}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="var(--border)"
                  strokeWidth={2}
                  markerEnd="url(#arrow)"
                />
              )
            })}
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="var(--border)" />
              </marker>
            </defs>
          </svg>
          {nodes.map((node) => (
            <DraggableNode
              key={node.id}
              node={node}
              selected={node.id === selectedNodeId}
              onSelect={() => setSelectedNodeId(node.id)}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}
