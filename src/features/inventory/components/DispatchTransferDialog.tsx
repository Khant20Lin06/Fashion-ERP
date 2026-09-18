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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, ArrowRight } from "lucide-react";
import type { BranchTransfer } from "../types/branch-transfer.types";
import { useDispatchBranchTransfer } from "../hooks/useBranchTransfers";

interface Props {
  transfer: BranchTransfer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DispatchTransferDialog({ transfer, open, onOpenChange }: Props) {
  const dispatchMutation = useDispatchBranchTransfer();

  const [transitMethod, setTransitMethod] = useState("Company Delivery Van");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");

  const [shippedQuantities, setShippedQuantities] = useState<Record<string, number>>({});

  React.useEffect(() => {
    if (transfer) {
      const initial: Record<string, number> = {};
      transfer.items.forEach((item) => {
        initial[item.productVariantId] = item.requestedQuantity;
      });
      setShippedQuantities(initial);
    }
  }, [transfer]);

  if (!transfer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatchMutation.mutateAsync({
      id: transfer.id,
      input: {
        transitMethod: transitMethod.trim() || undefined,
        trackingNumber: trackingNumber.trim() || undefined,
        driverName: driverName.trim() || undefined,
        driverPhone: driverPhone.trim() || undefined,
        items: transfer.items.map((it) => ({
          productVariantId: it.productVariantId,
          shippedQuantity: shippedQuantities[it.productVariantId] ?? it.requestedQuantity,
        })),
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Truck className="w-5 h-5 text-blue-500" />
            Dispatch Stock Transfer #{transfer.transferNumber}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Transfer Route Overview */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">From</p>
              <p className="font-semibold">{transfer.sourceBranchName}</p>
              <p className="text-xs text-muted-foreground">{transfer.sourceWarehouseName}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            <div className="text-right">
              <p className="text-xs text-muted-foreground">To</p>
              <p className="font-semibold">{transfer.destinationBranchName}</p>
              <p className="text-xs text-muted-foreground">{transfer.destinationWarehouseName}</p>
            </div>
          </div>

          {/* Transit Logistics Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg border">
            <div>
              <Label className="text-xs">Transit Method</Label>
              <Input
                value={transitMethod}
                onChange={(e) => setTransitMethod(e.target.value)}
                placeholder="e.g. Direct Van, Royal Express"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Waybill / Tracking No.</Label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. TRK-992011"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Driver / Courier Name</Label>
              <Input
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="e.g. Ko Aung"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Driver Phone</Label>
              <Input
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="e.g. 09-12345678"
                className="mt-1"
              />
            </div>
          </div>

          {/* Quantity Verification */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Verify Shipped Quantities</Label>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 text-xs">
                    <TableHead>Product / Variant</TableHead>
                    <TableHead className="text-right">Requested Qty</TableHead>
                    <TableHead className="text-right w-32">Shipped Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfer.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-medium text-xs">{item.productName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {item.sku} {item.variantLabel && `• ${item.variantLabel}`}
                        </p>
                      </TableCell>
                      <TableCell className="text-right text-xs font-semibold">
                        {item.requestedQuantity}
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min={1}
                          value={shippedQuantities[item.productVariantId] ?? item.requestedQuantity}
                          onChange={(e) =>
                            setShippedQuantities({
                              ...shippedQuantities,
                              [item.productVariantId]: parseInt(e.target.value, 10) || 0,
                            })
                          }
                          className="h-8 text-right"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-[11px] text-muted-foreground italic">
              * On dispatch, stock will be deducted from {transfer.sourceWarehouseName} and the transfer will enter IN_TRANSIT status.
            </p>
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
              disabled={dispatchMutation.isPending}
              className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Truck className="w-4 h-4" />
              Confirm Dispatch
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
