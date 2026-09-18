import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Truck, CheckCircle2, XCircle } from "lucide-react";
import type { BranchTransferStatus } from "../types/branch-transfer.types";

interface Props {
  status: BranchTransferStatus;
}

export function BranchTransferStatusBadge({ status }: Props) {
  switch (status) {
    case "REQUESTED":
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1 font-medium"
        >
          <Clock className="w-3 h-3" />
          Requested
        </Badge>
      );
    case "IN_TRANSIT":
      return (
        <Badge
          variant="outline"
          className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 gap-1 font-medium animate-pulse"
        >
          <Truck className="w-3 h-3" />
          In Transit
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1 font-medium"
        >
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge
          variant="outline"
          className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 gap-1 font-medium"
        >
          <XCircle className="w-3 h-3" />
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
