import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { clearOfflineQueue, getOfflineQueue } from "../utils/offlineQueue";
import { useActor } from "./useActor";

export function useOfflineSync() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  useEffect(() => {
    const syncQueue = async () => {
      if (!actor) return;
      const queue = getOfflineQueue();
      if (queue.length === 0) return;

      let synced = 0;
      for (const item of queue) {
        try {
          await actor.createItem(
            item.name,
            item.category,
            item.sku,
            item.description,
            item.price,
            item.supplier,
            BigInt(item.stockQuantity),
            null,
            item.sellingPrice,
            item.expiryDate ?? null,
          );
          synced++;
        } catch {
          // continue syncing remaining items
        }
      }

      if (synced > 0) {
        clearOfflineQueue();
        queryClient.invalidateQueries({ queryKey: ["items"] });
        toast.success(
          `${synced} item${synced > 1 ? "s" : ""} synced successfully`,
        );
      }
    };

    const handleOnline = () => {
      syncQueue();
    };

    window.addEventListener("online", handleOnline);

    // Also attempt sync on mount if online
    if (navigator.onLine) {
      syncQueue();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [actor, queryClient]);
}
