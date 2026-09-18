import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchChannels,
  updateChannel,
  triggerChannelSync,
  fetchCatalogFeed,
} from "../api/channels.api";
import type { UpdateChannelInput } from "../types/channels.types";
import { toast } from "sonner";

export function useChannels() {
  return useQuery({
    queryKey: ["ecommerce-channels"],
    queryFn: fetchChannels,
  });
}

export function useCatalogFeed(channelCode?: string) {
  return useQuery({
    queryKey: ["catalog-feed", channelCode],
    queryFn: () => fetchCatalogFeed(channelCode),
  });
}

export function useUpdateChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateChannelInput }) =>
      updateChannel(id, input),
    onSuccess: (data) => {
      toast.success(`${data.name} settings updated`);
      queryClient.invalidateQueries({ queryKey: ["ecommerce-channels"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update channel");
    },
  });
}

export function useTriggerSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => triggerChannelSync(id),
    onSuccess: (data) => {
      toast.success(`Synced ${data.name} inventory successfully`);
      queryClient.invalidateQueries({ queryKey: ["ecommerce-channels"] });
      queryClient.invalidateQueries({ queryKey: ["catalog-feed"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to trigger sync");
    },
  });
}
