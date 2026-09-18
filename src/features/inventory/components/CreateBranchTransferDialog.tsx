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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, ArrowRight, Warehouse, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchBranches, fetchWarehouses } from "../api/warehouse.api";
import { useInventory } from "../hooks/useInventory";
import { useCreateBranchTransfer } from "../hooks/useBranchTransfers";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBranchTransferDialog({ open, onOpenChange }: Props) {
  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
  });
  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: fetchWarehouses,
  });
  const { data: inventory = [] } = useInventory();
  const createMutation = useCreateBranchTransfer();

  const [sourceBranchId, setSourceBranchId] = useState("");
  const [sourceWarehouseId, setSourceWarehouseId] = useState("");
  const [destBranchId, setDestBranchId] = useState("");
  const [destWarehouseId, setDestWarehouseId] = useState("");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<
    {
      productVariantId: string;
      productName: string;
      sku: string;
      variantLabel?: string;
      availableQty: number;
      requestedQuantity: number;
    }[]
  >([]);

  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [requestedQty, setRequestedQty] = useState(1);

  // Filter warehouses by selected branch
  const sourceWarehouses = warehouses.filter(
    (w) => !sourceBranchId || w.branchId === sourceBranchId
  );
  const destWarehouses = warehouses.filter(
    (w) => (!destBranchId || w.branchId === destBranchId) && w.id !== sourceWarehouseId
  );

  // Available stock in source warehouse
  const availableInventory = inventory.filter(
    (i) => i.warehouseId === sourceWarehouseId
  );

  const handleAddItem = () => {
    if (!selectedVariantId) return;
    const invItem = availableInventory.find((i) => i.productVariantId === selectedVariantId);
    if (!invItem) return;

    if (items.some((it) => it.productVariantId === selectedVariantId)) {
      toast.error("Item already added to transfer list");
      return;
    }

    setItems([
      ...items,
      {
        productVariantId: invItem.productVariantId,
        productName: invItem.productName,
        sku: invItem.sku,
        variantLabel: [invItem.color, invItem.size].filter(Boolean).join(" / "),
        availableQty: invItem.availableQty,
        requestedQuantity: Math.max(1, requestedQty),
      },
    ]);
    setSelectedVariantId("");
    setRequestedQty(1);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceBranchId || !sourceWarehouseId || !destBranchId || !destWarehouseId) {
      toast.error("Please select source and destination branches and warehouses");
      return;
    }
    if (sourceBranchId === destBranchId) {
      toast.error("Source and destination branch must be different");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one product item to transfer");
      return;
    }

    await createMutation.mutateAsync({
      sourceBranchId,
      sourceWarehouseId,
      destinationBranchId: destBranchId,
      destinationWarehouseId: destWarehouseId,
      notes: notes.trim() || undefined,
      items: items.map((it) => ({
        productVariantId: it.productVariantId,
        requestedQuantity: it.requestedQuantity,
      })),
    });

    onOpenChange(false);
    // Reset form
    setItems([]);
    setNotes("");
    setSourceBranchId("");
    setSourceWarehouseId("");
    setDestBranchId("");
    setDestWarehouseId("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2 className="w-5 h-5 text-primary" />
            Request Branch-to-Branch Stock Transfer
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Branch & Warehouse Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border bg-muted/20">
            {/* Source Branch */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Warehouse className="w-3.5 h-3.5 text-blue-500" />
                Origin (Source Branch)
              </span>
              <div>
                <Label className="text-xs">From Branch *</Label>
                <Select
                  value={sourceBranchId}
                  onValueChange={(val) => {
                    setSourceBranchId(val);
                    setSourceWarehouseId("");
                    setItems([]);
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Source Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">From Warehouse *</Label>
                <Select
                  value={sourceWarehouseId}
                  onValueChange={(val) => {
                    setSourceWarehouseId(val);
                    setItems([]);
                  }}
                  disabled={!sourceBranchId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceWarehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Destination Branch */}
            <div className="space-y-3 border-t md:border-t-0 md:border-l md:pl-4 pt-3 md:pt-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Warehouse className="w-3.5 h-3.5 text-emerald-500" />
                Destination (Receiving Branch)
              </span>
              <div>
                <Label className="text-xs">To Branch *</Label>
                <Select
                  value={destBranchId}
                  onValueChange={(val) => {
                    setDestBranchId(val);
                    setDestWarehouseId("");
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Receiving Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches
                      .filter((b) => b.id !== sourceBranchId)
                      .map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">To Warehouse *</Label>
                <Select
                  value={destWarehouseId}
                  onValueChange={setDestWarehouseId}
                  disabled={!destBranchId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {destWarehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Add Product Line Items */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Items to Transfer</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Select
                  value={selectedVariantId}
                  onValueChange={setSelectedVariantId}
                  disabled={!sourceWarehouseId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !sourceWarehouseId
                          ? "Select Source Warehouse first"
                          : availableInventory.length === 0
                          ? "No stock available in this warehouse"
                          : "Choose product variant..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableInventory.map((inv) => (
                      <SelectItem key={inv.productVariantId} value={inv.productVariantId}>
                        {inv.productName} ({inv.sku}) - Avail: {inv.availableQty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-28">
                <Input
                  type="number"
                  min={1}
                  value={requestedQty}
                  onChange={(e) => setRequestedQty(parseInt(e.target.value, 10) || 1)}
                  placeholder="Qty"
                  disabled={!selectedVariantId}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddItem}
                disabled={!selectedVariantId}
                className="gap-1"
              >
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            </div>

            {/* Items Table */}
            {items.length > 0 && (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Product</TableHead>
                      <TableHead>SKU / Variant</TableHead>
                      <TableHead className="text-right">Origin Stock</TableHead>
                      <TableHead className="text-right w-28">Request Qty</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow key={item.productVariantId}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {item.sku} {item.variantLabel && `• ${item.variantLabel}`}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {item.availableQty}
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min={1}
                            max={item.availableQty}
                            value={item.requestedQuantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 1;
                              const updated = [...items];
                              updated[idx].requestedQuantity = val;
                              setItems(updated);
                            }}
                            className="h-8 text-right"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(idx)}
                            className="h-8 w-8 text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs">Notes / Reason for Transfer</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Replenishing high-demand weekend styles..."
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
              disabled={createMutation.isPending || items.length === 0}
              className="gap-1.5"
            >
              Submit Transfer Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
