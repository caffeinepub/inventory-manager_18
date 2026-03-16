# StockVault – Settings Page

## Current State
- App has Landing Page, Inventory List, Item Detail, and Admin Panel pages.
- Admin Panel has Inventory and Messages tabs.
- Header has: Logo (left), Browse + Admin nav buttons (right), optional PWA install button.
- Backend: inventory CRUD, contact messages (submit/read/delete/mark-read), authorization via AccessControl.
- Auth: Internet Identity (via useInternetIdentity hook).

## Requested Changes (Diff)

### Add
- Gear icon (Settings) button in header, next to Admin button, visible to all users.
- `/settings` route and `SettingsPage` component.
- Settings page with 5 sections:
  1. **Account Settings**: Edit Profile (name, email, phone, profile photo – saves to backend), Create New Account (UI form for regular user signup), Delete Account (requires typing "DELETE", deletes current logged-in user's account).
  2. **Privacy & Security**: Placeholder UI for passkeys – "Add a passkey" and "Manage devices" options, no real WebAuthn flow.
  3. **Help Center**: Chat-style UI. Any user can send a message (goes to existing Admin Messages backend). Admin can reply from Admin Panel; replies shown in Help Center chat.
  4. **App Language**: Dropdown with major world languages (English, Hindi, Spanish, French, German, Arabic, Portuguese, Japanese, Chinese, Russian). UI-only preference stored in localStorage.
  5. **Storage & Data**: Shows estimated localStorage usage, "Clear Cache" button to clear localStorage.
- Backend: `UserProfile` type with name, email, phone, imageId (optional blob). Functions: `getUserProfile`, `updateUserProfile`, `deleteAccount`.
- Backend: `adminReply` field added to `ContactMessage` (optional Text). New function: `replyToMessage(id, replyText)` – admin only. Help Center fetches messages by caller identity.
- Help Center public message submission reuses existing `submitContactMessage`.
- New `getMyMessages` query: returns messages submitted by the caller (matched by... we'll use a separate `helpMessages` map keyed by caller principal for Help Center, separate from contact form messages).

### Modify
- `App.tsx`: Add gear icon button to header nav, add `/settings` route.
- `AdminPage.tsx`: Add reply UI in Messages tab – each message row gets a "Reply" button that opens a dialog to type and send a reply. Reply is saved to backend and shown inline in the message row.
- Backend `ContactMessage` type: add optional `adminReply : ?Text` and `repliedAt : ?Time.Time`.

### Remove
- Nothing removed.

## Implementation Plan
1. Update backend:
   - Add `UserProfile` type and stable map.
   - Add `getUserProfile`, `updateUserProfile`, `deleteAccount` functions.
   - Add `adminReply` and `repliedAt` fields to `ContactMessage`.
   - Add `replyToMessage(id, replyText)` admin function.
   - Add `getMyMessages(callerEmail)` – since IC doesn't track email, Help Center will use a separate `helpMessages` map keyed by a session token or just use submitContactMessage with a special tag; simplest: reuse `submitContactMessage` and show all messages to the sender based on a unique sender identifier stored in localStorage.
2. Frontend:
   - Add Settings route and SettingsPage with sidebar navigation for 5 sections.
   - Account Settings: profile form (useGetUserProfile, useUpdateUserProfile), create account form (UI only with toast), delete account with "DELETE" confirmation.
   - Privacy & Security: static placeholder cards.
   - Help Center: chat bubbles, send message form (reuses submitContactMessage), shows sent messages from localStorage.
   - App Language: select dropdown, saves to localStorage.
   - Storage & Data: reads localStorage usage, clear cache button.
   - Admin Panel: add Reply button + dialog to Messages tab rows.
   - Header: add gear icon button linking to /settings.
