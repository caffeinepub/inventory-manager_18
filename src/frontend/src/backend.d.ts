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
    expiryDate?: string;
    name: string;
    createdAt: Time;
    sellingPrice: number;
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
export interface Order {
    id: bigint;
    customerName: string;
    status: string;
    itemId: bigint;
    customerPhone: string;
    createdAt: Time;
    customerAddress: string;
    itemName: string;
    quantity: bigint;
    totalPrice: number;
}
export interface UserProfile {
    name: string;
    email: string;
    imageId?: Uint8Array;
    phone: string;
}
export interface Review {
    id: bigint;
    itemId: bigint;
    createdAt: Time;
    reviewerName: string;
    comment: string;
    rating: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createItem(name: string, category: string, sku: string, description: string, price: number, supplier: string, stockQuantity: bigint, imageId: ExternalBlob | null, sellingPrice: number, expiryDate: string | null): Promise<bigint>;
    deleteAccount(): Promise<void>;
    deleteHelpMessage(id: bigint): Promise<void>;
    deleteItem(id: bigint): Promise<void>;
    deleteMessage(id: bigint): Promise<void>;
    deleteReview(reviewId: bigint): Promise<void>;
    getAllHelpMessages(): Promise<Array<HelpMessage>>;
    getAllItems(): Promise<Array<InventoryItem>>;
    getAllMessages(): Promise<Array<ContactMessage>>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getItem(id: bigint): Promise<InventoryItem>;
    getMyHelpMessages(): Promise<Array<HelpMessage>>;
    getOrder(orderId: bigint): Promise<Order>;
    getReviewsByItem(itemId: bigint): Promise<Array<Review>>;
    getUnreadMessageCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVisitCount(): Promise<bigint>;
    isCallerAdmin(): Promise<boolean>;
    markMessageRead(id: bigint): Promise<void>;
    placeOrder(customerName: string, customerPhone: string, customerAddress: string, itemId: bigint, quantity: bigint): Promise<bigint>;
    recordVisit(): Promise<void>;
    replyToHelpMessage(id: bigint, replyText: string): Promise<void>;
    replyToMessage(id: bigint, replyText: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitContactMessage(name: string, email: string, message: string): Promise<bigint>;
    submitHelpMessage(name: string, email: string, message: string): Promise<bigint>;
    submitReview(itemId: bigint, reviewerName: string, rating: bigint, comment: string): Promise<bigint>;
    updateItem(id: bigint, name: string, category: string, sku: string, description: string, price: number, supplier: string, stockQuantity: bigint, imageId: ExternalBlob | null, sellingPrice: number, expiryDate: string | null): Promise<void>;
    updateOrderStatus(orderId: bigint, status: string): Promise<void>;
    updateUserProfile(name: string, email: string, phone: string, imageId: Uint8Array | null): Promise<void>;
}
