const OFFLINE_QUEUE_KEY = "stockvault_offline_queue";

export interface OfflineItemData {
  name: string;
  category: string;
  sku: string;
  description: string;
  price: number;
  supplier: string;
  stockQuantity: string; // stored as string since BigInt isn't JSON serializable
  sellingPrice: number;
  expiryDate?: string | null;
  queuedAt: number;
}

export function queueOfflineItem(item: OfflineItemData): void {
  const queue = getOfflineQueue();
  queue.push({ ...item, queuedAt: Date.now() });
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export function getOfflineQueue(): OfflineItemData[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OfflineItemData[];
  } catch {
    return [];
  }
}

export function clearOfflineQueue(): void {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}
