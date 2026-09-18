"use client"

import { useState } from "react"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BatchBarcodePrinter } from "./BatchBarcodePrinter"

export function BatchPrintButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-1.5">
        <Printer className="size-4" />
        Print Price Tags
      </Button>
      <BatchBarcodePrinter open={open} onOpenChange={setOpen} />
    </>
  )
}
