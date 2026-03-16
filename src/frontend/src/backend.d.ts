import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface InventoryItem {
    id: bigint;
    sku: string;
    stockQuantity: bigint;
    supplier: string;
    name: string;
    createdAt: Time;
    description: string;
    updatedAt: Time;
    category: string;
    imageId?: ExternalBlob;
    price: number;
}
export interface HelpMessage {
    id: bigint;
    adminReply?: string;
    name: string;
    createdAt: Time;
    isRead: boolean;
    email: string;
    senderPrincipal: string;
    repliedAt?: Time;
    message: string;
}
export type Time = bigint;
export interface ContactMessage {
    id: bigint;
    adminReply?: string;
    name: string;
    createdAt: Time;
    isRead: boolean;
    email: string;
    repliedAt?: Time;
    message: string;
}
export interface UserProfile {
    name: string;
    email: string;
    imageId?: Uint8Array;
    phone: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createItem(name: string, category: string, sku: string, description: string, price: number, supplier: string, stockQuantity: bigint, imageId: ExternalBlob | null): Promise<bigint>;
    deleteAccount(): Promise<void>;
    deleteHelpMessage(id: bigint): Promise<void>;
    deleteItem(id: bigint): Promise<void>;
    deleteMessage(id: bigint): Promise<void>;
    getAllHelpMessages(): Promise<Array<HelpMessage>>;
    getAllItems(): Promise<Array<InventoryItem>>;
    getAllMessages(): Promise<Array<ContactMessage>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getItem(id: bigint): Promise<InventoryItem>;
    getMyHelpMessages(): Promise<Array<HelpMessage>>;
    getUnreadMessageCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markMessageRead(id: bigint): Promise<void>;
    replyToHelpMessage(id: bigint, replyText: string): Promise<void>;
    replyToMessage(id: bigint, replyText: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitContactMessage(name: string, email: string, message: string): Promise<bigint>;
    submitHelpMessage(name: string, email: string, message: string): Promise<bigint>;
    updateItem(id: bigint, name: string, category: string, sku: string, description: string, price: number, supplier: string, stockQuantity: bigint, imageId: ExternalBlob | null): Promise<void>;
    updateUserProfile(name: string, email: string, phone: string, imageId: Uint8Array | null): Promise<void>;
}
