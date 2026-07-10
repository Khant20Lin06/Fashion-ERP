"use client"

import { useRef, useState } from "react"
import Image from "next/image"
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
import { GripVertical, ImagePlus, Star, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ProductImage } from "../types"

type ImageUploaderProps = {
  images: ProductImage[]
  onChange: (images: ProductImage[]) => void
  label?: string
}

function SortableImage({
  image,
  onSetPrimary,
  onRemove,
}: {
  image: ProductImage
  onSetPrimary: (id: string) => void
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-lg border bg-muted",
        isDragging && "z-10 opacity-70"
      )}
    >
      <Image src={image.url} alt="Product" fill className="object-cover" unoptimized />

      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="absolute left-1.5 top-1.5 flex size-6 cursor-grab items-center justify-center rounded-md bg-background/80 text-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="size-3.5" />
      </button>

      {image.isPrimary && (
        <Badge className="absolute right-1.5 top-1.5 gap-1">
          <Star className="size-3" /> Primary
        </Badge>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
        {!image.isPrimary && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-6 px-2 text-xs"
            onClick={() => onSetPrimary(image.id)}
          >
            Set primary
          </Button>
        )}
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="ml-auto size-6"
          onClick={() => onRemove(image.id)}
          aria-label="Remove image"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

/** Drag-and-drop multi-image uploader with primary-image selection and reordering. */
export function ImageUploader({ images, onChange, label = "Gallery Images" }: ImageUploaderProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const newImages: ProductImage[] = Array.from(files).map((file, index) => ({
      id: `img-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      isPrimary: images.length === 0 && index === 0,
      sortOrder: images.length + index,
    }))
    onChange([...images, ...newImages])
  }

  function handleSetPrimary(id: string) {
    onChange(images.map((img) => ({ ...img, isPrimary: img.id === id })))
  }

  function handleRemove(id: string) {
    const remaining = images.filter((img) => img.id !== id)
    if (remaining.length > 0 && !remaining.some((img) => img.isPrimary)) {
      remaining[0] = { ...remaining[0], isPrimary: true }
    }
    onChange(remaining)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = images.findIndex((img) => img.id === active.id)
    const newIndex = images.findIndex((img) => img.id === over.id)
    onChange(arrayMove(images, oldIndex, newIndex).map((img, index) => ({ ...img, sortOrder: index })))
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{label}</p>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDraggingOver(true)
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDraggingOver(false)
          addFiles(e.dataTransfer.files)
        }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          isDraggingOver ? "border-primary bg-primary/5" : "border-input hover:bg-accent/50"
        )}
      >
        <ImagePlus className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drag & drop images here, or <span className="text-primary underline">browse</span>
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {images.map((image) => (
                <SortableImage key={image.id} image={image} onSetPrimary={handleSetPrimary} onRemove={handleRemove} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
