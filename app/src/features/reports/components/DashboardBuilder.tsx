"use client"

import { useState } from "react"
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Plus, RotateCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useReportStore } from "../stores/report.store"
import { DashboardWidgetRenderer } from "./DashboardWidgetRenderer"
import type { DashboardWidget, WidgetType } from "../types"

const availableWidgetTypes: { type: WidgetType; title: string; colSpan: DashboardWidget["colSpan"] }[] = [
  { type: "kpi_revenue", title: "Total Revenue", colSpan: 1 },
  { type: "kpi_profit", title: "Gross Profit", colSpan: 1 },
  { type: "kpi_orders", title: "Total Orders", colSpan: 1 },
  { type: "kpi_customers", title: "Customer Growth", colSpan: 1 },
  { type: "revenue_chart", title: "Revenue Trend", colSpan: 2 },
  { type: "profit_chart", title: "Profit Trend", colSpan: 2 },
  { type: "inventory_chart", title: "Stock Distribution", colSpan: 2 },
  { type: "customer_chart", title: "Customer Growth", colSpan: 2 },
  { type: "purchase_chart", title: "Purchase Trend", colSpan: 2 },
  { type: "top_products", title: "Top Products", colSpan: 2 },
  { type: "top_customers", title: "Top Customers", colSpan: 2 },
]

const colSpanClass: Record<DashboardWidget["colSpan"], string> = {
  1: "col-span-1",
  2: "col-span-1 sm:col-span-2",
  3: "col-span-1 sm:col-span-2 xl:col-span-3",
  4: "col-span-1 sm:col-span-2 xl:col-span-4",
}

function SortableWidget({ widget, onRemove }: { widget: DashboardWidget; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("group relative", colSpanClass[widget.colSpan], isDragging && "z-10 opacity-70")}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="absolute left-1.5 top-1.5 z-10 flex size-6 cursor-grab items-center justify-center rounded-md bg-background/80 text-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove widget"
        className="absolute right-1.5 top-1.5 z-10 flex size-6 items-center justify-center rounded-md bg-background/80 text-destructive opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
      >
        <X className="size-3.5" />
      </button>
      <DashboardWidgetRenderer widget={widget} />
    </div>
  )
}

/** Drag-and-drop custom dashboard builder — add/remove/reorder widgets, layout persisted via Zustand. */
export function DashboardBuilder() {
  const { dashboardWidgets, setDashboardWidgets, resetDashboardWidgets } = useReportStore()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const [isEditing, setIsEditing] = useState(false)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = dashboardWidgets.findIndex((w) => w.id === active.id)
    const newIndex = dashboardWidgets.findIndex((w) => w.id === over.id)
    setDashboardWidgets(arrayMove(dashboardWidgets, oldIndex, newIndex))
  }

  function handleAddWidget(type: WidgetType) {
    const template = availableWidgetTypes.find((w) => w.type === type)
    if (!template) return
    setDashboardWidgets([
      ...dashboardWidgets,
      { id: `widget-${crypto.randomUUID()}`, type: template.type, title: template.title, colSpan: template.colSpan },
    ])
  }

  function handleRemoveWidget(id: string) {
    setDashboardWidgets(dashboardWidgets.filter((w) => w.id !== id))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isEditing ? "Drag widgets to reorder, or add/remove below." : "Your saved custom dashboard layout."}
        </p>
        <div className="flex gap-2">
          {isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus /> Add Widget
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {availableWidgetTypes.map((widget) => (
                  <DropdownMenuItem key={widget.type} onClick={() => handleAddWidget(widget.type)}>
                    {widget.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {isEditing && (
            <Button variant="outline" size="sm" onClick={resetDashboardWidgets}>
              <RotateCcw /> Reset
            </Button>
          )}
          <Button size="sm" onClick={() => setIsEditing((v) => !v)}>
            {isEditing ? "Done" : "Customize Dashboard"}
          </Button>
        </div>
      </div>

      {isEditing ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={dashboardWidgets.map((w) => w.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {dashboardWidgets.map((widget) => (
                <SortableWidget key={widget.id} widget={widget} onRemove={() => handleRemoveWidget(widget.id)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardWidgets.map((widget) => (
            <div key={widget.id} className={colSpanClass[widget.colSpan]}>
              <DashboardWidgetRenderer widget={widget} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
