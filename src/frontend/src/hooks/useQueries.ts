import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type {
  HelpMessage,
  InventoryItem,
  Order,
  Review,
  UserProfile,
} from "../backend";
import { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

export interface ContactMessage {
  id: bigint;
  name: string;
  email: string;
  message: string;
  createdAt: bigint;
  isRead: boolean;
  adminReply?: string;
  repliedAt?: bigint;
}

export type { HelpMessage, UserProfile, Order, Review };

export function useAllItems() {
  const { actor, isFetching } = useActor();
  return useQuery<InventoryItem[]>({
    queryKey: ["items"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useItem(id: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<InventoryItem>({
    queryKey: ["item", id?.toString()],
    queryFn: async () => {
      if (!actor || id === undefined) throw new Error("No actor or id");
      return actor.getItem(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export interface ItemFormData {
  name: string;
  category: string;
  sku: string;
  description: string;
  price: number;
  supplier: string;
  stockQuantity: bigint;
  imageFile?: File | null;
  sellingPrice: number;
  expiryDate?: string | null;
}

export function useCreateItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ItemFormData) => {
      if (!actor) throw new Error("Not authenticated");
      let imageId: ExternalBlob | null = null;
      if (data.imageFile) {
        const bytes = new Uint8Array(await data.imageFile.arrayBuffer());
        imageId = ExternalBlob.fromBytes(bytes);
      }
      return actor.createItem(
        data.name,
        data.category,
        data.sku,
        data.description,
        data.price,
        data.supplier,
        data.stockQuantity,
        imageId,
        data.sellingPrice ?? 0,
        data.expiryDate ?? null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useUpdateItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: { id: bigint; data: ItemFormData; existingImageId?: ExternalBlob }) => {
      if (!actor) throw new Error("Not authenticated");
      let imageId: ExternalBlob | null = null;
      if (data.imageFile) {
        const bytes = new Uint8Array(await data.imageFile.arrayBuffer());
        imageId = ExternalBlob.fromBytes(bytes);
      }
      return actor.updateItem(
        id,
        data.name,
        data.category,
        data.sku,
        data.description,
        data.price,
        data.supplier,
        data.stockQuantity,
        imageId,
        data.sellingPrice ?? 0,
        data.expiryDate ?? null,
      );
    },
    onSuccess: (_result, vars) => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["item", vars.id.toString()] });
    },
  });
}

export function useDeleteItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

// ── Messages ──────────────────────────────────────────────────────────────

export function useAllMessages() {
  const { actor, isFetching } = useActor();
  return useQuery<ContactMessage[]>({
    queryKey: ["messages"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllMessages() as Promise<ContactMessage[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUnreadMessageCount(enabled = true) {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      if (!actor) return 0;
      const count = (await (actor as any).getUnreadMessageCount()) as bigint;
      return Number(count);
    },
    enabled: enabled && !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useDeleteMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).deleteMessage(id) as Promise<void>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });
}

export function useMarkMessageRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).markMessageRead(id) as Promise<void>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });
}

export function useSubmitContactMessage() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      name,
      email,
      message,
    }: { name: string; email: string; message: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).submitContactMessage(
        name,
        email,
        message,
      ) as Promise<bigint>;
    },
  });
}

export function useReplyToMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      replyText,
    }: { id: bigint; replyText: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.replyToMessage(id, replyText);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

// ── User Profile ──────────────────────────────────────────────────────────

export function useGetCallerProfile(enabled = true) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: enabled && !!actor && !isFetching,
  });
}

export function useSaveCallerProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useDeleteAccount() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteAccount();
    },
  });
}

// ── Help Messages ─────────────────────────────────────────────────────────

export function useMyHelpMessages(enabled = true) {
  const { actor, isFetching } = useActor();
  return useQuery<HelpMessage[]>({
    queryKey: ["myHelpMessages"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyHelpMessages();
    },
    enabled: enabled && !!actor && !isFetching,
    refetchInterval: 10_000,
  });
}

export function useAllHelpMessages(enabled = true) {
  const { actor, isFetching } = useActor();
  return useQuery<HelpMessage[]>({
    queryKey: ["allHelpMessages"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllHelpMessages();
    },
    enabled: enabled && !!actor && !isFetching,
  });
}

export function useSubmitHelpMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      email,
      message,
    }: { name: string; email: string; message: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.submitHelpMessage(name, email, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myHelpMessages"] });
    },
  });
}

export function useReplyToHelpMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      replyText,
    }: { id: bigint; replyText: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.replyToHelpMessage(id, replyText);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allHelpMessages"] });
      queryClient.invalidateQueries({ queryKey: ["myHelpMessages"] });
    },
  });
}

// ── Orders ────────────────────────────────────────────────────────────────

export function useAllOrders(enabled = true) {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["allOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: enabled && !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      customerName,
      customerPhone,
      customerAddress,
      itemId,
      quantity,
    }: {
      customerName: string;
      customerPhone: string;
      customerAddress: string;
      itemId: bigint;
      quantity: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.placeOrder(
        customerName,
        customerPhone,
        customerAddress,
        itemId,
        quantity,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: { orderId: bigint; status: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

// ── Reviews ───────────────────────────────────────────────────────────────

export function useReviewsByItem(itemId: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Review[]>({
    queryKey: ["reviews", itemId?.toString()],
    queryFn: async () => {
      if (!actor || itemId === undefined) return [];
      return actor.getReviewsByItem(itemId);
    },
    enabled: !!actor && !isFetching && itemId !== undefined,
  });
}

export function useSubmitReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemId,
      reviewerName,
      rating,
      comment,
    }: {
      itemId: bigint;
      reviewerName: string;
      rating: bigint;
      comment: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.submitReview(itemId, reviewerName, rating, comment);
    },
    onSuccess: (_result, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", vars.itemId.toString()],
      });
    },
  });
}

export function useDeleteReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteReview(reviewId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

// ── Visitor Counter (localStorage based) ─────────────────────────────────

const PLATFORM_REACH_KEY = "stockvault_platform_reach";
const SESSION_VISITED_KEY = "stockvault_session_visited";

export function useVisitCount() {
  const [count, setCount] = useState<number>(() => {
    return Number.parseInt(localStorage.getItem(PLATFORM_REACH_KEY) || "0", 10);
  });

  useEffect(() => {
    const handler = () => {
      setCount(
        Number.parseInt(localStorage.getItem(PLATFORM_REACH_KEY) || "0", 10),
      );
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return { data: count, isLoading: false };
}

export function useRecordVisit() {
  return {
    mutate: () => {
      if (!sessionStorage.getItem(SESSION_VISITED_KEY)) {
        sessionStorage.setItem(SESSION_VISITED_KEY, "true");
        const current = Number.parseInt(
          localStorage.getItem(PLATFORM_REACH_KEY) || "0",
          10,
        );
        const newCount = current + 1;
        localStorage.setItem(PLATFORM_REACH_KEY, String(newCount));
        window.dispatchEvent(
          new StorageEvent("storage", { key: PLATFORM_REACH_KEY }),
        );
      }
    },
  };
}
