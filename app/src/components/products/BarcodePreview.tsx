"use client"

import { useEffect, useRef } from "react"
import JsBarcode from "jsbarcode"

type BarcodePreviewProps = {
  value: string
  width?: number
  height?: number
  className?: string
}

/** Renders a scannable barcode (Code128) from a numeric/alphanumeric value. */
export function BarcodePreview({ value, width = 2, height = 60, className }: BarcodePreviewProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !value) return
    try {
      JsBarcode(svgRef.current, value, {
        format: "CODE128",
        width,
        height,
        displayValue: true,
        fontSize: 13,
        margin: 8,
      })
    } catch {
      // Invalid barcode value (e.g. mid-typing) — leave the previous render in place.
    }
  }, [value, width, height])

  if (!value) {
    return (
      <div className="flex h-[76px] items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
        No barcode value
      </div>
    )
  }

  return <svg ref={svgRef} className={className} role="img" aria-label={`Barcode ${value}`} />
}
