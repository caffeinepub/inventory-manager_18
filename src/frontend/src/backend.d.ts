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
export type Time = bigint;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createItem(name: string, category: string, sku: string, description: string, price: number, supplier: string, stockQuantity: bigint, imageId: ExternalBlob | null): Promise<bigint>;
    deleteItem(id: bigint): Promise<void>;
    getAllItems(): Promise<Array<InventoryItem>>;
    getCallerUserRole(): Promise<UserRole>;
    getItem(id: bigint): Promise<InventoryItem>;
    isCallerAdmin(): Promise<boolean>;
    updateItem(id: bigint, name: string, category: string, sku: string, description: string, price: number, supplier: string, stockQuantity: bigint, imageId: ExternalBlob | null): Promise<void>;
}
