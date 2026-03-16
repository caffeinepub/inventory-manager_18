# StockVault

## Current State
- Full inventory management app with public listing, item detail pages, admin CRUD panel, landing page, and a Contact Me form.
- Contact form (Name, Email, Message) currently shows a "Thank you" message on submit but does NOT persist submissions anywhere.
- Admin Panel only has inventory management (no Messages tab).
- Backend has InventoryItem CRUD, blob storage, and authorization.

## Requested Changes (Diff)

### Add
- Backend: `ContactMessage` type with fields: id, name, email, message, createdAt, isRead (bool).
- Backend: `submitContactMessage(name, email, message)` — public, no auth required.
- Backend: `getAllMessages()` — admin only, returns all messages.
- Backend: `deleteMessage(id)` — admin only.
- Backend: `markMessageRead(id)` — admin only, marks a message as read.
- Backend: `getUnreadMessageCount()` — admin only, returns count of unread messages.
- Frontend: When contact form is submitted, call `submitContactMessage` instead of just setting state.
- Frontend: Messages tab inside the Admin Panel (alongside inventory tab), showing Name, Email, Message, Date/Time, with delete action.
- Frontend: Unread badge on the Messages tab showing count of unread submissions; clears when tab is opened.
- Frontend: New hooks in useQueries.ts for messages.

### Modify
- LandingPage.tsx: ContactSection form submit handler now calls backend `submitContactMessage`.
- AdminPage.tsx: Add tabbed layout (Inventory | Messages), Messages tab shows submissions table.
- App.tsx: Optionally show unread badge on the Admin nav link.

### Remove
- Nothing removed.

## Implementation Plan
1. Regenerate Motoko backend with ContactMessage type and all message-related functions.
2. Update LandingPage.tsx ContactSection to call backend submitContactMessage on submit.
3. Add message hooks (useAllMessages, useSubmitMessage, useDeleteMessage, useMarkMessageRead, useUnreadCount) to useQueries.ts.
4. Refactor AdminPage.tsx to use Tabs (Inventory / Messages); Messages tab shows table with Name, Email, Message, Date/Time, delete button; auto-marks read when tab opens.
5. Add unread badge to the Messages tab trigger using getUnreadMessageCount.
