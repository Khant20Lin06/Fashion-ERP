import { apiClient } from "@/lib/api/client";
import { resolveCompanyId } from "@/lib/api/resolve-company-id";
import type {
  EcommerceChannel,
  CatalogFeedResponse,
  UpdateChannelInput,
} from "../types/channels.types";

export async function fetchChannels(): Promise<EcommerceChannel[]> {
  const companyId = await resolveCompanyId();
  const res = await apiClient.get<EcommerceChannel[]>("/channels", {
    params: { companyId },
  });
  return res.data;
}

export async function updateChannel(
  id: string,
  input: UpdateChannelInput
): Promise<EcommerceChannel> {
  const companyId = await resolveCompanyId();
  const res = await apiClient.patch<EcommerceChannel>(`/channels/${id}`, input, {
    params: { companyId },
  });
  return res.data;
}

export async function triggerChannelSync(id: string): Promise<EcommerceChannel> {
  const companyId = await resolveCompanyId();
  const res = await apiClient.post<EcommerceChannel>(
    `/channels/${id}/sync`,
    {},
    { params: { companyId } }
  );
  return res.data;
}

export async function fetchCatalogFeed(channelCode?: string): Promise<CatalogFeedResponse> {
  const companyId = await resolveCompanyId();
  const res = await apiClient.get<CatalogFeedResponse>("/channels/catalog-feed", {
    params: {
      companyId,
      channel: channelCode,
    },
  });
  return res.data;
}
