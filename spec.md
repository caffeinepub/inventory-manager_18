# StockVault

## Current State
StockVault is a full-stack inventory management app with:
- Public inventory listing, item detail pages, voice search, smart filters
- Admin Panel (login-protected): CRUD for items, Messages tab, Help Center tab, Analytics cards, PDF/Excel export
- Settings page with Account, Privacy, Help Center, App Language, Storage, Share App tabs
- Hindi/English translation via JSON file + React context (toggle only in Settings)
- Platform Reach visitor counter (backend-powered, shown in footer)
- Certificate of Achievement page (/certificate)
- PWA support, splash screen, custom logo
- Backend: InventoryItem (with sellingPrice, expiryDate), ContactMessage, HelpMessage, UserProfile, visitCount

## Requested Changes (Diff)

### Add
- **Live Stock Availability**: "In Stock" / "Out of Stock" badge on item cards and detail pages based on stockQuantity > 0
- **Wishlist / Notify Me**: localStorage-based wishlist; on Out of Stock items show "Notify Me" button that adds to wishlist and shows "We'll contact you when it's back!" toast
- **Smart Search Filters**: Advanced filter panel on inventory page -- filter by Category, Price Range (min/max), and Rating
- **User Ratings & Reviews**: Any visitor can leave a star rating (1-5) + reviewer name + text comment on any item. Backend stores reviews per item. Average rating shown on item cards and detail page.
- **Product Comparison**: "Compare" button on item cards; floating comparison bar at bottom; side-by-side comparison modal for 2-3 selected items
- **Order Placement Flow**: On item detail page, "Place Order" button opens a form (Name, Phone, Address, Quantity). Submits order to backend. After submission, a PDF invoice is generated client-side.
- **Admin Orders Tab**: New "Orders" tab in Admin Panel showing all submitted orders (customer name, phone, address, item, quantity, timestamp, status)
- **WhatsApp Button**: "Chat with Owner" button on every item detail page, linking to https://wa.me/919984606371
- **Digital Invoices**: After placing an order, auto-generate and download a PDF receipt with order details
- **Loyalty Points**: localStorage-based demo system -- each order earns points (1 point per ₹100 spent). A small "My Points" widget shown on the inventory page.
- **Bilingual Toggle in Header**: Language switcher (EN/हि) moved from Settings to the main navbar. Settings language tab updated or simplified.

### Modify
- Backend: Add Order and Review types, and corresponding CRUD functions
- Navbar: Add language toggle button (EN/HI)
- Settings: Remove or simplify the App Language tab (since toggle is now in header)
- Item cards and detail page: Show stock availability badge, average rating, compare/wishlist buttons

### Remove
- App Language tab from Settings page navigation (or keep as redirect notice)

## Implementation Plan
1. Add `Order` and `Review` types to Motoko backend
2. Add `placeOrder`, `getAllOrders` (admin), `addReview`, `getReviewsForItem` backend functions
3. Frontend: Add language toggle (EN/HI) to navbar
4. Frontend: Add In Stock / Out of Stock badges to item cards and detail pages
5. Frontend: Add Wishlist/Notify Me with localStorage logic
6. Frontend: Enhance inventory filter panel with Category, Price Range, Rating filters
7. Frontend: Add Ratings & Reviews section on item detail page (submit form + display list)
8. Frontend: Add Product Comparison (compare button, floating bar, modal)
9. Frontend: Add Order placement form on item detail page + PDF invoice generation
10. Frontend: Add WhatsApp "Chat with Owner" button on item detail page
11. Frontend: Add Loyalty Points widget (localStorage-based)
12. Frontend: Add Orders tab to Admin Panel
