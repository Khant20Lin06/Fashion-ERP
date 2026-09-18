export type ChannelStatus = 'ACTIVE' | 'PAUSED' | 'DISCONNECTED';

export interface EcommerceChannel {
  id: string;
  companyId: string;
  code: string;
  name: string;
  status: ChannelStatus;
  apiKey: string | null;
  webhookSecret: string | null;
  stockBuffer: number;
  lastSyncedAt: string | null;
  syncedOrdersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogFeedItem {
  id: string;
  item_group_id: string;
  title: string;
  description: string;
  availability: 'in stock' | 'out of stock';
  inventory: number;
  price: string;
  sale_price: string;
  brand: string;
  category: string;
  sku: string;
  barcode: string;
  color: string | null;
  size: string | null;
  condition: string;
  link: string;
  image_link: string | null;
}

export interface CatalogFeedResponse {
  feedVersion: string;
  generatedAt: string;
  channel: string;
  totalProducts: number;
  items: CatalogFeedItem[];
}

export interface UpdateChannelInput {
  status?: ChannelStatus;
  apiKey?: string;
  webhookSecret?: string;
  stockBuffer?: number;
}
