import { api } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type { ChannelPerformance, SalesChannel } from "./types";

export async function listChannels(
  businessId: string,
): Promise<PaginatedResult<SalesChannel>> {
  const { data } = await api.get<PaginatedResult<SalesChannel>>(
    `/api/v1/businesses/${businessId}/channels`,
    { params: { limit: 50 } },
  );
  return data;
}

export async function createChannel(
  businessId: string,
  input: { name: string; commissionPercent: number },
): Promise<SalesChannel> {
  const { data } = await api.post<SalesChannel>(
    `/api/v1/businesses/${businessId}/channels`,
    input,
  );
  return data;
}

export async function updateChannel(
  businessId: string,
  channelId: string,
  input: { commissionPercent?: number; isActive?: boolean },
): Promise<SalesChannel> {
  const { data } = await api.patch<SalesChannel>(
    `/api/v1/businesses/${businessId}/channels/${channelId}`,
    input,
  );
  return data;
}

export async function getChannelPerformance(
  businessId: string,
  sinceDays = 30,
): Promise<ChannelPerformance[]> {
  const { data } = await api.get<{ channelPerformance: ChannelPerformance[] }>(
    `/api/v1/businesses/${businessId}/restaurant/analytics`,
    { params: { sinceDays } },
  );
  return data.channelPerformance;
}
