import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listBranchTransfers,
  getBranchTransfer,
  createBranchTransfer,
  dispatchBranchTransfer,
  receiveBranchTransfer,
  cancelBranchTransfer,
} from "../api/branch-transfers.api";
import type {
  CreateBranchTransferInput,
  DispatchBranchTransferInput,
  ReceiveBranchTransferInput,
} from "../types/branch-transfer.types";
import { toast } from "sonner";

export function useBranchTransfers(params?: {
  sourceBranchId?: string;
  destinationBranchId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["branch-transfers", params],
    queryFn: () => listBranchTransfers(params),
  });
}

export function useBranchTransfer(id: string) {
  return useQuery({
    queryKey: ["branch-transfers", id],
    queryFn: () => getBranchTransfer(id),
    enabled: Boolean(id),
  });
}

export function useCreateBranchTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBranchTransferInput) => createBranchTransfer(input),
    onSuccess: (data) => {
      toast.success(`Transfer ${data.transferNumber} requested successfully`);
      queryClient.invalidateQueries({ queryKey: ["branch-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to request transfer");
    },
  });
}

export function useDispatchBranchTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DispatchBranchTransferInput }) =>
      dispatchBranchTransfer(id, input),
    onSuccess: (data) => {
      toast.success(`Transfer ${data.transferNumber} dispatched (In Transit)`);
      queryClient.invalidateQueries({ queryKey: ["branch-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to dispatch transfer");
    },
  });
}

export function useReceiveBranchTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReceiveBranchTransferInput }) =>
      receiveBranchTransfer(id, input),
    onSuccess: (data) => {
      toast.success(`Transfer ${data.transferNumber} received & completed`);
      queryClient.invalidateQueries({ queryKey: ["branch-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to receive transfer");
    },
  });
}

export function useCancelBranchTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelBranchTransfer(id),
    onSuccess: (data) => {
      toast.success(`Transfer ${data.transferNumber} cancelled`);
      queryClient.invalidateQueries({ queryKey: ["branch-transfers"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to cancel transfer");
    },
  });
}
