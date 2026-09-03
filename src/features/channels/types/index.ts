export interface SalesChannel {
  id: string;
  businessId: string;
  name: string;
  commissionPercent: string;
  isActive: boolean;
  createdAt: string;
}

export interface ChannelPerformance {
  channelId: string | null;
  name: string;
  orders: number;
  grossCents: number;
  commissionCents: number;
  netCents: number;
}
