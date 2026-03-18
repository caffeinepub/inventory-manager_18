# StockVault

## Current State
- Admin Panel has one analytics card (Platform Reach / visitor counter)
- Inventory tab shows a table with Name, Category, SKU, Price, Stock, Actions
- Inventory data comes from `useAllItems()` which returns `InventoryItem[]` with fields: id, name, category, sku, price, stockQuantity, createdAt
- Settings > Help Center tab has a chat-style interface for users to message admin
- No PDF/Excel export in Admin Panel
- No inventory summary cards
- No step-by-step guide in Help Center

## Requested Changes (Diff)

### Add
- 3 summary cards in Admin Panel (above the tabs, alongside/after Analytics card):
  1. **Total Stock Value**: sum of (price × stockQuantity) for all items, formatted as ₹ INR
  2. **Low Stock Items**: count of items where stockQuantity < 10
  3. **Today's Entries**: count of items where createdAt (nanoseconds) falls on today's local date
- **Download as PDF** button in Admin Panel inventory tab: exports Name, Category, Quantity, Price using jsPDF or similar
- **Export to Excel** button in Admin Panel inventory tab: exports same fields as CSV/XLSX using xlsx or papaparse
- **Step-by-step Help Guide card** in Settings > Help Center section (visible to all users) and in Admin Panel Help tab, explaining:
  - For Public: how to browse/search inventory, view item details
  - For Admin: how to add/edit/delete items, manage messages

### Modify
- AdminPage.tsx: add 3 new summary cards above tabs
- AdminPage.tsx inventory tab: add PDF + Excel export buttons above the table
- SettingsPage.tsx HelpCenterSection: add a guide card above the chat interface
- Admin HelpMessagesTab area: add a similar guide card for admin reference

### Remove
- Nothing removed

## Implementation Plan
1. In AdminPage.tsx, compute summary stats from `items` array (already fetched via `useAllItems()`)
2. Render 3 new stat cards (Total Stock Value ₹, Low Stock count, Today's Entries count) in a responsive grid
3. Add PDF export using `jsPDF` + `jspdf-autotable` -- fields: Name, Category, Quantity, Price
4. Add Excel export using `xlsx` library -- same fields, download as .xlsx
5. Place both export buttons in the inventory tab toolbar (above the table, right-aligned)
6. In SettingsPage.tsx HelpCenterSection, add a collapsible/static guide card with numbered steps for public users
7. In AdminPage.tsx Help tab area, add a similar guide card for admin reference
