"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import JsBarcode from "jsbarcode"
import {
  Printer,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
  Settings2,
  Trash2,
  Tag,
  Eye,
  Sliders,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/format"
import { useAllProductsFull } from "../hooks/useProducts"
import type { Product, ProductVariant } from "../types"

export type PrintableItem = {
  id: string
  productName: string
  brandName?: string
  sku: string
  barcode: string
  size?: string
  color?: string
  price: number
  stockQuantity: number
  quantity: number // Number of labels to print
}

type BatchBarcodePrinterProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialProductIds?: string[]
}

type TagTemplate = "thermal" | "a4"

type TagOptions = {
  showBrand: boolean
  showProductName: boolean
  showVariant: boolean
  showPrice: boolean
}

function BarcodeSvg({
  value,
  template,
}: {
  value: string
  template: TagTemplate
}) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !value) return
    try {
      JsBarcode(svgRef.current, value, {
        format: "CODE128",
        width: template === "thermal" ? 1.3 : 1.1,
        height: template === "thermal" ? 28 : 24,
        displayValue: true,
        fontSize: template === "thermal" ? 9 : 8,
        margin: 1,
        textMargin: 1,
      })
    } catch {
      // Ignore barcode formatting error
    }
  }, [value, template])

  if (!value) {
    return <span className="text-[9px] text-muted-foreground">No Barcode</span>
  }

  return <svg ref={svgRef} className="max-w-full h-auto" />
}

export function BatchBarcodePrinter({
  open,
  onOpenChange,
  initialProductIds = [],
}: BatchBarcodePrinterProps) {
  const { data: products = [], isLoading } = useAllProductsFull()

  const [search, setSearch] = useState("")
  const [selectedItems, setSelectedItems] = useState<Map<string, PrintableItem>>(
    new Map()
  )
  const [template, setTemplate] = useState<TagTemplate>("thermal")
  const [batchQtyInput, setBatchQtyInput] = useState("1")
  const [tagOptions, setTagOptions] = useState<TagOptions>({
    showBrand: true,
    showProductName: true,
    showVariant: true,
    showPrice: true,
  })

  // Flatten all products & variants into selectable candidate list
  const candidateItems = useMemo<PrintableItem[]>(() => {
    const list: PrintableItem[] = []
    for (const prod of products) {
      if (prod.variants && prod.variants.length > 0) {
        for (const v of prod.variants) {
          list.push({
            id: v.id,
            productName: prod.name,
            brandName: prod.brandName,
            sku: v.sku,
            barcode: v.barcode || v.sku,
            size: v.attributes?.size,
            color: v.attributes?.color,
            price: v.sellingPrice || prod.pricing?.sellingPrice || 0,
            stockQuantity: v.stockQuantity ?? 0,
            quantity: 1,
          })
        }
      } else {
        list.push({
          id: prod.id,
          productName: prod.name,
          brandName: prod.brandName,
          sku: prod.sku,
          barcode: prod.sku,
          price: prod.pricing?.sellingPrice || 0,
          stockQuantity: prod.stockQuantity ?? 0,
          quantity: 1,
        })
      }
    }
    return list
  }, [products])

  // Prepopulate if initialProductIds passed
  useEffect(() => {
    if (initialProductIds.length > 0 && candidateItems.length > 0) {
      const initialMap = new Map<string, PrintableItem>()
      for (const item of candidateItems) {
        // match either product id or variant id
        if (
          initialProductIds.includes(item.id) ||
          products.some(
            (p) =>
              initialProductIds.includes(p.id) &&
              p.variants?.some((v) => v.id === item.id)
          )
        ) {
          initialMap.set(item.id, { ...item, quantity: 1 })
        }
      }
      if (initialMap.size > 0) {
        setSelectedItems(initialMap)
      }
    }
  }, [initialProductIds, candidateItems, products])

  // Filter candidates by search term
  const filteredCandidates = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return candidateItems
    return candidateItems.filter((item) => {
      return (
        item.productName.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        (item.brandName && item.brandName.toLowerCase().includes(q)) ||
        (item.size && item.size.toLowerCase().includes(q)) ||
        (item.color && item.color.toLowerCase().includes(q))
      )
    })
  }, [candidateItems, search])

  const toggleSelect = (item: PrintableItem) => {
    setSelectedItems((prev) => {
      const next = new Map(prev)
      if (next.has(item.id)) {
        next.delete(item.id)
      } else {
        next.set(item.id, { ...item, quantity: 1 })
      }
      return next
    })
  }

  const selectAllFiltered = () => {
    setSelectedItems((prev) => {
      const next = new Map(prev)
      for (const item of filteredCandidates) {
        if (!next.has(item.id)) {
          next.set(item.id, { ...item, quantity: 1 })
        }
      }
      return next
    })
  }

  const clearSelection = () => {
    setSelectedItems(new Map())
  }

  const updateQuantity = (id: string, qty: number) => {
    const safeQty = Math.max(1, Math.min(999, qty))
    setSelectedItems((prev) => {
      const next = new Map(prev)
      const existing = next.get(id)
      if (existing) {
        next.set(id, { ...existing, quantity: safeQty })
      }
      return next
    })
  }

  const applyBatchQuantity = () => {
    const num = parseInt(batchQtyInput, 10)
    if (isNaN(num) || num < 1) return
    setSelectedItems((prev) => {
      const next = new Map(prev)
      for (const [key, val] of next.entries()) {
        next.set(key, { ...val, quantity: num })
      }
      return next
    })
  }

  const matchStockQuantities = () => {
    setSelectedItems((prev) => {
      const next = new Map(prev)
      for (const [key, val] of next.entries()) {
        const qty = Math.max(1, val.stockQuantity || 1)
        next.set(key, { ...val, quantity: qty })
      }
      return next
    })
  }

  // Expanded list of labels to render based on `quantity`
  const printableTagList = useMemo(() => {
    const list: PrintableItem[] = []
    for (const item of selectedItems.values()) {
      for (let i = 0; i < item.quantity; i++) {
        list.push(item)
      }
    }
    return list
  }, [selectedItems])

  const totalTags = printableTagList.length

  const handlePrint = () => {
    if (totalTags === 0) return
    window.print()
  }

  return (
    <>
      {/* Print Stylesheet injected into DOM */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media screen {
          #printable-tags-container {
            display: none !important;
          }
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-tags-container,
          #printable-tags-container * {
            visibility: visible !important;
          }
          #printable-tags-container {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }

          /* Thermal 50mm x 30mm layout */
          @page {
            ${
              template === "thermal"
                ? "size: 50mm 30mm; margin: 0;"
                : "size: A4 portrait; margin: 8mm 6mm;"
            }
          }

          .print-thermal-tag {
            width: 50mm;
            height: 30mm;
            padding: 2mm 2.5mm;
            box-sizing: border-box;
            page-break-after: always;
            break-after: page;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            overflow: hidden;
            background: #fff;
            color: #000;
          }

          /* A4 Sheet 3x8 layout */
          .print-a4-sheet {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-auto-rows: 33mm;
            column-gap: 3mm;
            row-gap: 2mm;
            page-break-inside: auto;
            width: 100%;
          }

          .print-a4-tag {
            height: 33mm;
            padding: 2mm 3mm;
            box-sizing: border-box;
            page-break-inside: avoid;
            break-inside: avoid;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            text-align: center;
            border: 1px dashed #d1d5db;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            overflow: hidden;
            background: #fff;
            color: #000;
          }
        }
      `,
        }}
      />

      {/* Actual Hidden DOM rendered for window.print() */}
      <div id="printable-tags-container" aria-hidden="true">
        {template === "thermal" ? (
          <div>
            {printableTagList.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="print-thermal-tag">
                <div style={{ width: "100%", lineHeight: 1.1 }}>
                  {tagOptions.showBrand && item.brandName && (
                    <div style={{ fontSize: "7pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {item.brandName}
                    </div>
                  )}
                  {tagOptions.showProductName && (
                    <div style={{ fontSize: "7.5pt", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.productName}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "center", width: "100%", margin: "1px 0" }}>
                  <BarcodeSvg value={item.barcode} template="thermal" />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", width: "100%", fontSize: "7.5pt", borderTop: "0.5px solid #e5e7eb", paddingTop: "1px" }}>
                  {tagOptions.showVariant && (
                    <div style={{ fontWeight: "600", textAlign: "left" }}>
                      {[item.size, item.color].filter(Boolean).join(" / ") || item.sku}
                    </div>
                  )}
                  {tagOptions.showPrice && (
                    <div style={{ fontWeight: "bold", marginLeft: "auto", textAlign: "right" }}>
                      {formatCurrency(item.price)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="print-a4-sheet">
            {printableTagList.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="print-a4-tag">
                <div style={{ width: "100%", lineHeight: 1.1 }}>
                  {tagOptions.showBrand && item.brandName && (
                    <div style={{ fontSize: "7pt", fontWeight: "bold", textTransform: "uppercase" }}>
                      {item.brandName}
                    </div>
                  )}
                  {tagOptions.showProductName && (
                    <div style={{ fontSize: "8pt", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.productName}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                  <BarcodeSvg value={item.barcode} template="a4" />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", width: "100%", fontSize: "7.5pt", borderTop: "0.5px solid #e5e7eb", paddingTop: "2px" }}>
                  {tagOptions.showVariant && (
                    <div style={{ fontWeight: "600" }}>
                      {[item.size, item.color].filter(Boolean).join(" / ") || item.sku}
                    </div>
                  )}
                  {tagOptions.showPrice && (
                    <div style={{ fontWeight: "bold", marginLeft: "auto" }}>
                      {formatCurrency(item.price)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Screen Interactive Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Tag className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg">
                    Fashion Barcode & Price Tag Studio
                  </DialogTitle>
                  <DialogDescription>
                    Generate and batch-print clothing price tags for Thermal roll or A4 sticker sheets.
                  </DialogDescription>
                </div>
              </div>
              <Badge variant="secondary" className="font-mono text-sm px-3 py-1">
                {totalTags} {totalTags === 1 ? "label" : "labels"} queued
              </Badge>
            </div>
          </DialogHeader>

          <Tabs defaultValue="select" className="flex-1 flex flex-col min-h-0">
            <div className="px-6 border-b bg-muted/30">
              <TabsList className="bg-transparent h-11 p-0 gap-4">
                <TabsTrigger
                  value="select"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-3"
                >
                  <Layers className="size-4 mr-2" />
                  1. Select Items ({selectedItems.size})
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-3"
                >
                  <Sliders className="size-4 mr-2" />
                  2. Layout & Template
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-3"
                >
                  <Eye className="size-4 mr-2" />
                  3. Live Preview ({totalTags})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: SELECT ITEMS */}
            <TabsContent value="select" className="flex-1 min-h-0 flex flex-col p-6 gap-4 m-0">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search product, SKU, size, color..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={selectAllFiltered}
                    className="text-xs h-8"
                  >
                    <CheckSquare className="size-3.5 mr-1" />
                    Select All ({filteredCandidates.length})
                  </Button>
                  {selectedItems.size > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearSelection}
                      className="text-xs h-8 text-destructive"
                    >
                      <Trash2 className="size-3.5 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Batch Quantity Adjusters */}
              {selectedItems.size > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 border text-xs">
                  <span className="font-medium text-muted-foreground">
                    Batch Quantity for {selectedItems.size} selected items:
                  </span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      className="w-16 h-7 text-xs font-mono text-center"
                      value={batchQtyInput}
                      onChange={(e) => setBatchQtyInput(e.target.value)}
                    />
                    <Button size="sm" variant="outline" className="h-7 text-xs px-2.5" onClick={applyBatchQuantity}>
                      Apply All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2.5 gap-1 text-primary border-primary/40"
                      onClick={matchStockQuantities}
                    >
                      <Sparkles className="size-3" />
                      Match On-Hand Stock
                    </Button>
                  </div>
                </div>
              )}

              {/* Items List */}
              <ScrollArea className="flex-1 border rounded-lg">
                <div className="divide-y">
                  {isLoading ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      Loading products and variants...
                    </div>
                  ) : filteredCandidates.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No matching products found.
                    </div>
                  ) : (
                    filteredCandidates.map((item) => {
                      const isSelected = selectedItems.has(item.id)
                      const currentSelected = selectedItems.get(item.id)

                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-3 transition-colors hover:bg-muted/40 ${
                            isSelected ? "bg-primary/5" : ""
                          }`}
                        >
                          <div
                            className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 mr-4"
                            onClick={() => toggleSelect(item)}
                          >
                            <button
                              type="button"
                              className="text-primary hover:opacity-80 shrink-0"
                            >
                              {isSelected ? (
                                <CheckSquare className="size-5 text-primary" />
                              ) : (
                                <Square className="size-5 text-muted-foreground" />
                              )}
                            </button>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">
                                  {item.productName}
                                </span>
                                {item.brandName && (
                                  <Badge variant="outline" className="text-[10px] h-4 px-1.5 uppercase font-medium">
                                    {item.brandName}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <span className="font-mono">{item.sku}</span>
                                {(item.size || item.color) && (
                                  <span>
                                    · {[item.size, item.color].filter(Boolean).join(" / ")}
                                  </span>
                                )}
                                <span>· Stock: {item.stockQuantity}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <span className="font-mono text-sm font-semibold text-right">
                              {formatCurrency(item.price)}
                            </span>

                            {isSelected && currentSelected ? (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    updateQuantity(item.id, currentSelected.quantity - 1)
                                  }
                                >
                                  -
                                </Button>
                                <Input
                                  type="number"
                                  min="1"
                                  max="999"
                                  className="w-12 h-7 text-xs font-mono text-center p-0"
                                  value={currentSelected.quantity}
                                  onChange={(e) =>
                                    updateQuantity(
                                      item.id,
                                      parseInt(e.target.value, 10) || 1
                                    )
                                  }
                                />
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    updateQuantity(item.id, currentSelected.quantity + 1)
                                  }
                                >
                                  +
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => toggleSelect(item)}
                              >
                                Select
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* TAB 2: LAYOUT & TEMPLATE */}
            <TabsContent value="settings" className="flex-1 min-h-0 p-6 space-y-6 m-0 overflow-y-auto">
              <div>
                <Label className="text-base font-semibold">Print Template & Paper Size</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Select the label format for your thermal roll printer or standard office A4 sticker sheet.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <div
                    onClick={() => setTemplate("thermal")}
                    className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${
                      template === "thermal"
                        ? "border-primary bg-primary/5 shadow-xs"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">Thermal Roll (50 × 30 mm)</span>
                      {template === "thermal" && (
                        <Badge variant="default" className="text-xs">Selected</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Standard clothing tag / adhesive barcode sticker for barcode label printers (Xprinter, Zebra, TSC, Gprinter). 1 label per print cycle.
                    </p>
                  </div>

                  <div
                    onClick={() => setTemplate("a4")}
                    className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${
                      template === "a4"
                        ? "border-primary bg-primary/5 shadow-xs"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">A4 Sticker Sheet (3 × 8 Grid)</span>
                      {template === "a4" && (
                        <Badge variant="default" className="text-xs">Selected</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Standard A4 laser / inkjet adhesive paper containing 24 labels per page (approx. 70mm × 33mm each).
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-base font-semibold">Label Content Options</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Control which information is printed on each clothing tag.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="text-sm font-medium">Brand Name</div>
                      <div className="text-xs text-muted-foreground">e.g. GUCCI, ZARA, LOCAL</div>
                    </div>
                    <Switch
                      checked={tagOptions.showBrand}
                      onCheckedChange={(c) =>
                        setTagOptions((prev) => ({ ...prev, showBrand: c }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="text-sm font-medium">Product Name</div>
                      <div className="text-xs text-muted-foreground">Product description line</div>
                    </div>
                    <Switch
                      checked={tagOptions.showProductName}
                      onCheckedChange={(c) =>
                        setTagOptions((prev) => ({ ...prev, showProductName: c }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="text-sm font-medium">Size & Color Attributes</div>
                      <div className="text-xs text-muted-foreground">e.g. M / RED or SKU</div>
                    </div>
                    <Switch
                      checked={tagOptions.showVariant}
                      onCheckedChange={(c) =>
                        setTagOptions((prev) => ({ ...prev, showVariant: c }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="text-sm font-medium">Selling Price in MMK</div>
                      <div className="text-xs text-muted-foreground">Highlighted price at bottom right</div>
                    </div>
                    <Switch
                      checked={tagOptions.showPrice}
                      onCheckedChange={(c) =>
                        setTagOptions((prev) => ({ ...prev, showPrice: c }))
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: LIVE PREVIEW */}
            <TabsContent value="preview" className="flex-1 min-h-0 p-6 flex flex-col gap-4 m-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Live Tag Preview</h3>
                  <p className="text-xs text-muted-foreground">
                    This is how your tags will appear on {template === "thermal" ? "50x30mm thermal paper" : "A4 sheet"}.
                  </p>
                </div>
                <Badge variant="outline">
                  Showing {Math.min(12, printableTagList.length)} of {totalTags} labels
                </Badge>
              </div>

              <ScrollArea className="flex-1 border rounded-lg bg-muted/20 p-4">
                {printableTagList.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No items selected yet. Go back to "Select Items" and choose products to print.
                  </div>
                ) : template === "thermal" ? (
                  <div className="flex flex-wrap gap-4 justify-center">
                    {printableTagList.slice(0, 12).map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        className="w-[190px] h-[114px] p-2 bg-white text-black border shadow-xs rounded-sm flex flex-col justify-between items-center text-center select-none"
                      >
                        <div className="w-full">
                          {tagOptions.showBrand && item.brandName && (
                            <div className="text-[9px] font-bold tracking-wider uppercase truncate">
                              {item.brandName}
                            </div>
                          )}
                          {tagOptions.showProductName && (
                            <div className="text-[10px] font-semibold truncate leading-tight">
                              {item.productName}
                            </div>
                          )}
                        </div>

                        <div className="my-0.5">
                          <BarcodeSvg value={item.barcode} template="thermal" />
                        </div>

                        <div className="w-full flex justify-between items-baseline text-[9px] pt-1 border-t border-gray-200">
                          {tagOptions.showVariant && (
                            <span className="font-semibold truncate max-w-[90px]">
                              {[item.size, item.color].filter(Boolean).join(" / ") || item.sku}
                            </span>
                          )}
                          {tagOptions.showPrice && (
                            <span className="font-bold ml-auto text-black">
                              {formatCurrency(item.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {printableTagList.slice(0, 12).map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        className="h-[120px] p-2 bg-white text-black border border-dashed shadow-xs rounded-sm flex flex-col justify-between items-center text-center select-none"
                      >
                        <div className="w-full">
                          {tagOptions.showBrand && item.brandName && (
                            <div className="text-[9px] font-bold tracking-wider uppercase truncate">
                              {item.brandName}
                            </div>
                          )}
                          {tagOptions.showProductName && (
                            <div className="text-[10px] font-semibold truncate leading-tight">
                              {item.productName}
                            </div>
                          )}
                        </div>

                        <div className="my-0.5">
                          <BarcodeSvg value={item.barcode} template="a4" />
                        </div>

                        <div className="w-full flex justify-between items-baseline text-[9px] pt-1 border-t border-gray-200">
                          {tagOptions.showVariant && (
                            <span className="font-semibold truncate max-w-[100px]">
                              {[item.size, item.color].filter(Boolean).join(" / ") || item.sku}
                            </span>
                          )}
                          {tagOptions.showPrice && (
                            <span className="font-bold ml-auto text-black">
                              {formatCurrency(item.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <DialogFooter className="p-4 border-t bg-muted/20 flex sm:justify-between items-center">
            <div className="text-xs text-muted-foreground font-medium">
              Ready to print: <strong className="text-foreground">{totalTags}</strong> tags on{" "}
              <strong>{template === "thermal" ? "Thermal Roll" : "A4 Sheet"}</strong>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button
                onClick={handlePrint}
                disabled={totalTags === 0}
                className="gap-2 bg-primary text-primary-foreground font-medium"
              >
                <Printer className="size-4" />
                Print {totalTags > 0 ? `(${totalTags})` : ""}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
