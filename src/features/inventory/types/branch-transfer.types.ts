export type BranchTransferStatus =
  | 'REQUESTED'
  | 'IN_TRANSIT'
  | 'COMPLETED'
  | 'CANCELLED';

export interface BranchTransferItem {
  id: string;
  transferId: string;
  productVariantId: string;
  requestedQuantity: number;
  shippedQuantity: number;
  receivedQuantity: number;
  productName: string | null;
  sku: string | null;
  variantLabel: string | null;
}

export interface BranchTransfer {
  id: string;
  transferNumber: string;
  companyId: string;
  sourceBranchId: string;
  sourceBranchName: string | null;
  sourceWarehouseId: string;
  sourceWarehouseName: string | null;
  destinationBranchId: string;
  destinationBranchName: string | null;
  destinationWarehouseId: string;
  destinationWarehouseName: string | null;
  status: BranchTransferStatus;
  transitMethod: string | null;
  trackingNumber: string | null;
  driverName: string | null;
  driverPhone: string | null;
  dispatchedAt: string | null;
  dispatchedByName: string | null;
  receivedAt: string | null;
  receivedByName: string | null;
  notes: string | null;
  createdBy: string;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
  items: BranchTransferItem[];
}

export interface CreateBranchTransferInput {
  sourceBranchId: string;
  sourceWarehouseId: string;
  destinationBranchId: string;
  destinationWarehouseId: string;
  notes?: string;
  items: {
    productVariantId: string;
    requestedQuantity: number;
  }[];
}

export interface DispatchBranchTransferInput {
  transitMethod?: string;
  trackingNumber?: string;
  driverName?: string;
  driverPhone?: string;
  items?: {
    productVariantId: string;
    shippedQuantity: number;
  }[];
}

export interface ReceiveBranchTransferInput {
  notes?: string;
  items?: {
    productVariantId: string;
    receivedQuantity: number;
  }[];
}
