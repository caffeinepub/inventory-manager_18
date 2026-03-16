import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { HelpMessage, InventoryItem, UserProfile } from "../backend";
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

export type { HelpMessage, UserProfile };

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
