"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, ArrowRight, AlertTriangle } from "lucide-react";
import type { BranchTransfer } from "../types/branch-transfer.types";
import { useReceiveBranchTransfer } from "../hooks/useBranchTransfers";

interface Props {
  transfer: BranchTransfer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceiveTransferDialog({ transfer, open, onOpenChange }: Props) {
  const receiveMutation = useReceiveBranchTransfer();
  const [notes, setNotes] = useState("");
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({});

  React.useEffect(() => {
    if (transfer) {
      const initial: Record<string, number> = {};
      transfer.items.forEach((item) => {
        initial[item.productVariantId] = item.shippedQuantity || item.requestedQuantity;
      });
      setReceivedQuantities(initial);
    }
  }, [transfer]);

  if (!transfer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await receiveMutation.mutateAsync({
      id: transfer.id,
      input: {
        notes: notes.trim() || undefined,
        items: transfer.items.map((it) => ({
          productVariantId: it.productVariantId,
          receivedQuantity: receivedQuantities[it.productVariantId] ?? it.shippedQuantity,
        })),
      },
    });
    onOpenChange(false);
  };

  const hasDiscrepancy = transfer.items.some((item) => {
    const recv = receivedQuantities[item.productVariantId] ?? item.shippedQuantity;
    return recv !== item.shippedQuantity;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Receive Inbound Transfer #{transfer.transferNumber}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Transfer Route Overview */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Dispatched From</p>
              <p className="font-semibold">{transfer.sourceBranchName}</p>
              <p className="text-xs text-muted-foreground">{transfer.sourceWarehouseName}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Receiving At</p>
              <p className="font-semibold">{transfer.destinationBranchName}</p>
              <p className="text-xs text-muted-foreground">{transfer.destinationWarehouseName}</p>
            </div>
          </div>

          {/* Transit summary */}
          <div className="text-xs p-3 rounded-lg border bg-muted/20 flex flex-wrap gap-4 justify-between">
            <div>
              <span className="text-muted-foreground">Transit: </span>
              <span className="font-medium">{transfer.transitMethod || "Direct Transfer"}</span>
            </div>
            {transfer.trackingNumber && (
              <div>
                <span className="text-muted-foreground">Tracking: </span>
                <span className="font-medium">{transfer.trackingNumber}</span>
              </div>
            )}
            {transfer.driverName && (
              <div>
                <span className="text-muted-foreground">Driver: </span>
                <span className="font-medium">{transfer.driverName} ({transfer.driverPhone || "No phone"})</span>
              </div>
            )}
          </div>

          {/* Quantity Verification */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Inspect & Count Received Items</Label>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 text-xs">
                    <TableHead>Product / Variant</TableHead>
                    <TableHead className="text-right">Shipped Qty</TableHead>
                    <TableHead className="text-right w-32">Received Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfer.items.map((item) => {
                    const recv = receivedQuantities[item.productVariantId] ?? item.shippedQuantity;
                    const diff = recv - item.shippedQuantity;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <p className="font-medium text-xs">{item.productName}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {item.sku} {item.variantLabel && `• ${item.variantLabel}`}
                          </p>
                        </TableCell>
                        <TableCell className="text-right text-xs font-semibold">
                          {item.shippedQuantity}
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min={0}
                            value={recv}
                            onChange={(e) =>
                              setReceivedQuantities({
                                ...receivedQuantities,
                                [item.productVariantId]: parseInt(e.target.value, 10) || 0,
                              })
                            }
                            className={`h-8 text-right ${
                              diff !== 0 ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 font-bold" : ""
                            }`}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {hasDiscrepancy && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Quantity discrepancy detected! Please mention damage, loss, or notes below.</span>
              </div>
            )}

            <p className="text-[11px] text-muted-foreground italic">
              * On confirmation, stock will be added to {transfer.destinationWarehouseName} and the transfer will be marked COMPLETED.
            </p>
          </div>

          <div>
            <Label className="text-xs">Receiving Notes / Condition</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. All packages intact, no damage..."
              className="mt-1 resize-none"
              rows={2}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={receiveMutation.isPending}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Receipt & Add to Stock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
