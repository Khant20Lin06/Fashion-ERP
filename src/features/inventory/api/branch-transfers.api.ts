import { apiClient } from "@/lib/api/client";
import { resolveCompanyId } from "@/lib/api/resolve-company-id";
import type {
  BranchTransfer,
  CreateBranchTransferInput,
  DispatchBranchTransferInput,
  ReceiveBranchTransferInput,
} from "../types/branch-transfer.types";

export async function listBranchTransfers(params?: {
  sourceBranchId?: string;
  destinationBranchId?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: BranchTransfer[]; meta: { total: number; page: number; limit: number } }> {
  const companyId = await resolveCompanyId();
  const res = await apiClient.get<{ data: BranchTransfer[]; meta: { total: number; page: number; limit: number } }>(
    "/branch-transfers",
    {
      params: {
        companyId,
        ...params,
      },
    }
  );
  return res.data;
}

export async function getBranchTransfer(id: string): Promise<BranchTransfer> {
  const companyId = await resolveCompanyId();
  const res = await apiClient.get<BranchTransfer>(`/branch-transfers/${id}`, {
    params: { companyId },
  });
  return res.data;
}

export async function createBranchTransfer(
  input: CreateBranchTransferInput
): Promise<BranchTransfer> {
  const companyId = await resolveCompanyId();
  const res = await apiClient.post<BranchTransfer>("/branch-transfers", {
    companyId,
    ...input,
  });
  return res.data;
}

export async function dispatchBranchTransfer(
  id: string,
  input: DispatchBranchTransferInput
): Promise<BranchTransfer> {
  const companyId = await resolveCompanyId();
  const res = await apiClient.post<BranchTransfer>(
    `/branch-transfers/${id}/dispatch`,
    input,
    { params: { companyId } }
  );
  return res.data;
}

export async function receiveBranchTransfer(
  id: string,
  input: ReceiveBranchTransferInput
): Promise<BranchTransfer> {
  const companyId = await resolveCompanyId();
  const res = await apiClient.post<BranchTransfer>(
    `/branch-transfers/${id}/receive`,
    input,
    { params: { companyId } }
  );
  return res.data;
}

export async function cancelBranchTransfer(id: string): Promise<BranchTransfer> {
  const companyId = await resolveCompanyId();
  const res = await apiClient.post<BranchTransfer>(
    `/branch-transfers/${id}/cancel`,
    {},
    { params: { companyId } }
  );
  return res.data;
}
