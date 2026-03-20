# StockVault

## Current State
StockVault is a full-featured All-in-One Business Super App with inventory management, order placement, admin analytics, GST calculator, Help Bot, staff access control, and bilingual support. The UI uses a professional light blue theme.

## Requested Changes (Diff)

### Add
- Sales Bar Chart in Admin Analytics always shows demo/sample data (7-day revenue) so it looks full even with no real orders
- Category Pie Chart in Admin Analytics section showing sample category distribution
- "Trusted by local businesses" trust strip on Landing Page between Hero and Features sections
- Barcode Scan icon button next to the existing Mic icon in the main inventory search bar
- Help Bot auto-visible greeting bubble ("How can I help you today?") that appears on page load without requiring user to click the bot

### Modify
- Landing Page hero: enhance with a soft blue gradient background
- Inventory list items: redesign as modern shadow cards with hover effects and "Best Seller" badges
- Admin Analytics Sales tab: use sample/demo data as fallback when no real orders exist
- HelpBot component: add auto-appearing greeting bubble on page load
- Search bar in InventoryListPage: widen right padding to accommodate both Mic and Barcode scan icons

### Remove
- "No orders yet" empty state in Sales Bar Chart (replaced by demo data)

## Implementation Plan
1. Update `AdminExtraTabs.tsx` Sales tab to use sample 7-day revenue demo data when no real orders; add Category Pie Chart with sample data
2. Update `LandingPage.tsx`: enhance hero blue gradient, add trust strip with logos/text below hero
3. Update `InventoryListPage.tsx`: add Barcode Scan icon next to mic in search bar; redesign inventory grid cards with shadow, hover lift effect, and Best Seller badge
4. Update `HelpBot.tsx`: add a greeting bubble that auto-appears on page load, positioned above the floating bot button, with auto-dismiss after a few seconds or on click
