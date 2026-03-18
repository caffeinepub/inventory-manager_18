# StockVault

## Current State

StockVault is a full-stack inventory management app on ICP. The backend (Motoko) stores `InventoryItem` records with fields: id, name, category, sku, description, price (purchase price), supplier, stockQuantity, imageId, createdAt, updatedAt. No selling price or expiry date fields exist yet.

The frontend has: Landing Page, Public Inventory List (with voice search), Item Detail, Admin Panel (CRUD + messages + analytics cards: Total Stock Value, Low Stock, Today's Entries + PDF/Excel export), Settings (Account, Privacy, Help Center, Language, Storage, Share App tabs), Certificate page, and Platform Reach visitor counter.

## Requested Changes (Diff)

### Add
- `sellingPrice` (Float) field to `InventoryItem` backend type
- `expiryDate` (?Text, ISO date string) field to `InventoryItem` backend type
- Update `createItem` and `updateItem` backend functions to accept `sellingPrice` and `expiryDate`
- QR code scanner component integration for searching/pre-filling item form by scanning barcodes/QR codes
- Admin Dashboard: Profit/Loss card = (sellingPrice - price) × stockQuantity, summed across all items
- Admin Dashboard: "Expiring Soon" summary card listing items expiring within 7 days
- Admin Dashboard: "Future Roadmap" card with "Upcoming: AI Demand Forecasting" text
- Inventory table: color-coded rows (red = expired, orange = expiring ≤7 days)
- Auto-generate Purchase Draft: button in Admin Panel that generates a downloadable list of items with stockQuantity < 10
- Dark Mode toggle in Settings page, applied app-wide via CSS class on document root
- Offline-ready "Full offline add": items added while offline are queued in localStorage, auto-synced when internet returns, with a visible sync status indicator

### Modify
- `InventoryItem` type in backend: add `sellingPrice: Float` and `expiryDate: ?Text`
- ItemForm component: add Selling Price input and Expiry Date picker fields
- Admin Panel analytics section: add Profit/Loss and Expiring Soon cards alongside existing Total Stock Value, Low Stock, Today's Entries cards
- Admin Panel inventory table: color-code rows based on expiryDate
- Inventory List page: show expiry badge on items

### Remove
- Nothing removed

## Implementation Plan

1. **Backend**: Add `sellingPrice: Float` and `expiryDate: ?Text` to `InventoryItem`. Update `createItem` and `updateItem` signatures. Regenerate bindings.
2. **Select components**: Add `qr-code` component.
3. **Frontend - ItemForm**: Add Selling Price (number input) and Expiry Date (date picker) fields.
4. **Frontend - Admin Dashboard**: Add Profit/Loss card, Expiring Soon card, Future Roadmap card.
5. **Frontend - Admin Inventory Table**: Color-code rows (red/orange) based on expiryDate. Add Purchase Draft download button.
6. **Frontend - QR Scanner**: Integrate qr-code component in Admin Panel "Add Item" flow to scan and pre-fill name/SKU.
7. **Frontend - Dark Mode**: Add toggle in Settings. Store preference in localStorage. Apply `dark` class to `<html>` element. Add Tailwind dark: variants to key components.
8. **Frontend - Offline Add**: Intercept `createItem` calls when offline. Queue in localStorage (`stockvault_offline_queue`). On reconnect, auto-sync queued items. Show sync status badge in Admin Panel.
