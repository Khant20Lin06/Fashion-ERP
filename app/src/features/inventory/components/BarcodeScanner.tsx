"use client"

import { useEffect, useRef, useState } from "react"
import { ScanBarcode, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { WarehouseSelector } from "@/components/inventory/WarehouseSelector"
import { InventoryCard } from "@/components/inventory/InventoryCard"
import { useSkuLookup } from "../hooks/useStockMovement"
import type { InventoryItem } from "../types"

const SCAN_KEYSTROKE_GAP_MS = 40

/**
 * Barcode Scanner interface. USB/Bluetooth "keyboard wedge" scanners emit
 * keystrokes faster than any human can type, terminated by Enter — this
 * listens globally for that pattern and treats it as a completed scan,
 * with no camera or native scanning library required. A manual input
 * covers camera-less desktops and quick manual SKU lookups.
 */
export function BarcodeScanner() {
  const [manualValue, setManualValue] = useState("")
  const [warehouseId, setWarehouseId] = useState<string | undefined>(undefined)
  const [result, setResult] = useState<InventoryItem | undefined>(undefined)
  const [notFoundSku, setNotFoundSku] = useState<string | undefined>(undefined)
  const lookup = useSkuLookup()
  const bufferRef = useRef("")
  const lastKeyTimeRef = useRef(0)

  function handleScan(sku: string) {
    if (!sku) return
    setNotFoundSku(undefined)
    lookup.mutate(sku, {
      onSuccess: (item) => {
        if (item) {
          setResult(item as InventoryItem)
        } else {
          setResult(undefined)
          setNotFoundSku(sku)
        }
      },
    })
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return

      const now = Date.now()
      if (now - lastKeyTimeRef.current > SCAN_KEYSTROKE_GAP_MS) {
        bufferRef.current = ""
      }
      lastKeyTimeRef.current = now

      if (e.key === "Enter") {
        if (bufferRef.current.length >= 4) {
          handleScan(bufferRef.current)
        }
        bufferRef.current = ""
        return
      }

      if (e.key.length === 1) {
        bufferRef.current += e.key
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    handleScan(manualValue.trim())
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ScanBarcode className="size-4" /> Barcode Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Scan a barcode with a USB/Bluetooth scanner, or type a SKU/barcode manually below.
          </p>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <Input
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value)}
              placeholder="Enter SKU or barcode…"
              className="font-mono"
              autoFocus
            />
            <Button type="submit" disabled={!manualValue || lookup.isPending}>
              <Search /> Lookup
            </Button>
          </form>

          <div className="max-w-xs space-y-1.5">
            <p className="text-sm font-medium">Warehouse (for stock check)</p>
            <WarehouseSelector value={warehouseId} onChange={setWarehouseId} placeholder="Any warehouse" />
          </div>
        </CardContent>
      </Card>

      {notFoundSku && (
        <EmptyState title="Product not found" description={`No product matches "${notFoundSku}".`} />
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scan Result</CardTitle>
          </CardHeader>
          <CardContent>
            <InventoryCard item={result} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
