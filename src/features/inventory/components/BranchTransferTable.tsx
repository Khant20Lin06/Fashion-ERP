"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Truck,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ArrowRight,
  Search,
  RefreshCw,
  Plus,
  Package,
} from "lucide-react";
import { BranchTransferStatusBadge } from "./BranchTransferStatusBadge";
import { CreateBranchTransferDialog } from "./CreateBranchTransferDialog";
import { DispatchTransferDialog } from "./DispatchTransferDialog";
import { ReceiveTransferDialog } from "./ReceiveTransferDialog";
import { useBranchTransfers, useCancelBranchTransfer } from "../hooks/useBranchTransfers";
import type { BranchTransfer, BranchTransferStatus } from "../types/branch-transfer.types";
import { format } from "date-fns";

export function BranchTransferTable() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [dispatchTransfer, setDispatchTransfer] = useState<BranchTransfer | null>(null);
  const [receiveTransfer, setReceiveTransfer] = useState<BranchTransfer | null>(null);

  const { data, isLoading, refetch } = useBranchTransfers({
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });

  const cancelMutation = useCancelBranchTransfer();

  const transfers = data?.data ?? [];

  const filteredTransfers = transfers.filter((t) => {
    const matchesSearch =
      !search ||
      t.transferNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.sourceBranchName?.toLowerCase().includes(search.toLowerCase()) ||
      t.destinationBranchName?.toLowerCase().includes(search.toLowerCase()) ||
      t.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
      t.driverName?.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by transfer #, branch, driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="REQUESTED">Requested</SelectItem>
              <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Request Branch Transfer
        </Button>
      </div>

      {/* Transfer List Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-36">Transfer #</TableHead>
              <TableHead>Route (Source ➔ Destination)</TableHead>
              <TableHead>Items & Units</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Logistics / Driver</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  Loading branch transfers...
                </TableCell>
              </TableRow>
            ) : filteredTransfers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Package className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="font-medium text-muted-foreground">No branch transfers found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click "Request Branch Transfer" above to initiate an inter-branch transfer.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransfers.map((transfer) => {
                const totalUnits = transfer.items.reduce(
                  (sum, it) => sum + (it.requestedQuantity || 0),
                  0
                );
                return (
                  <TableRow key={transfer.id}>
                    <TableCell className="font-semibold text-sm">
                      {transfer.transferNumber}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-medium">{transfer.sourceBranchName}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {transfer.sourceWarehouseName}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <div className="space-y-0.5">
                          <p className="font-medium">{transfer.destinationBranchName}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {transfer.destinationWarehouseName}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs">
                      <span className="font-medium">{transfer.items.length} product(s)</span>
                      <span className="text-muted-foreground block text-[11px]">
                        {totalUnits} units total
                      </span>
                    </TableCell>

                    <TableCell>
                      <BranchTransferStatusBadge status={transfer.status} />
                    </TableCell>

                    <TableCell className="text-xs">
                      {transfer.driverName ? (
                        <div>
                          <p className="font-medium">{transfer.driverName}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {transfer.transitMethod || "Van"} {transfer.trackingNumber && `• ${transfer.trackingNumber}`}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Pending dispatch</span>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(transfer.createdAt), "dd MMM yyyy, HH:mm")}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {transfer.status === "REQUESTED" && (
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-blue-600 hover:bg-blue-700 h-8 gap-1 text-xs"
                            onClick={() => setDispatchTransfer(transfer)}
                          >
                            <Truck className="w-3.5 h-3.5" />
                            Dispatch
                          </Button>
                        )}

                        {transfer.status === "IN_TRANSIT" && (
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-emerald-600 hover:bg-emerald-700 h-8 gap-1 text-xs"
                            onClick={() => setReceiveTransfer(transfer)}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Receive
                          </Button>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {transfer.status === "REQUESTED" && (
                              <DropdownMenuItem
                                className="text-destructive gap-2 cursor-pointer"
                                onClick={() => cancelMutation.mutate(transfer.id)}
                              >
                                <XCircle className="w-4 h-4" />
                                Cancel Transfer
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer"
                              onClick={() => {
                                // Details dialog preview
                                alert(
                                  `Transfer: ${transfer.transferNumber}\nNotes: ${
                                    transfer.notes || "None"
                                  }\nCreated By: ${transfer.createdByName || "Staff"}`
                                );
                              }}
                            >
                              View Notes & Logs
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <CreateBranchTransferDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <DispatchTransferDialog
        transfer={dispatchTransfer}
        open={Boolean(dispatchTransfer)}
        onOpenChange={(open) => !open && setDispatchTransfer(null)}
      />

      <ReceiveTransferDialog
        transfer={receiveTransfer}
        open={Boolean(receiveTransfer)}
        onOpenChange={(open) => !open && setReceiveTransfer(null)}
      />
    </div>
  );
}
