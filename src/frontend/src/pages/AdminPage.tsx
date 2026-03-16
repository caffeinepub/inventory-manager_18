import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Inbox,
  Loader2,
  LogIn,
  MessageSquare,
  Package,
  Pencil,
  Plus,
  Reply,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { InventoryItem } from "../backend";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import ItemForm from "../components/ItemForm";
import { useLanguage } from "../context/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllHelpMessages,
  useAllItems,
  useAllMessages,
  useCreateItem,
  useDeleteItem,
  useDeleteMessage,
  useIsAdmin,
  useMarkMessageRead,
  useReplyToHelpMessage,
  useReplyToMessage,
  useUnreadMessageCount,
  useUpdateItem,
} from "../hooks/useQueries";
import type {
  ContactMessage,
  HelpMessage,
  ItemFormData,
} from "../hooks/useQueries";

const HEADER_SKELETON_KEYS = ["hs-a", "hs-b"];
const ROW_SKELETON_KEYS = ["rs-a", "rs-b", "rs-c", "rs-d", "rs-e", "rs-f"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDateTime(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / 1_000_000n);
  return new Date(ms).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageId: bigint | null;
  isHelpMessage?: boolean;
}

function ReplyDialog({
  open,
  onOpenChange,
  messageId,
  isHelpMessage = false,
}: ReplyDialogProps) {
  const { t } = useLanguage();
  const [replyText, setReplyText] = useState("");
  const replyToMessage = useReplyToMessage();
  const replyToHelp = useReplyToHelpMessage();

  const isPending = replyToMessage.isPending || replyToHelp.isPending;

  const handleSubmit = async () => {
    if (!messageId || !replyText.trim()) {
      toast.error(t("admin.reply_empty_error"));
      return;
    }
    try {
      if (isHelpMessage) {
        await replyToHelp.mutateAsync({ id: messageId, replyText });
      } else {
        await replyToMessage.mutateAsync({ id: messageId, replyText });
      }
      toast.success(t("admin.reply_success"));
      setReplyText("");
      onOpenChange(false);
    } catch {
      toast.error(t("admin.reply_error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-ocid="admin.reply_dialog">
        <DialogHeader>
          <DialogTitle>{t("admin.reply_dialog_title")}</DialogTitle>
        </DialogHeader>
        <Textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder={t("admin.reply_placeholder")}
          className="min-h-[100px] resize-none"
          data-ocid="admin.messages.reply_input"
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-ocid="admin.reply_cancel_button"
          >
            {t("admin.reply_cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-primary text-primary-foreground"
            data-ocid="admin.messages.reply_submit_button"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Reply className="w-4 h-4 mr-2" />
            )}
            {t("admin.reply_send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface MessagesTabProps {
  isAdmin: boolean;
}

function MessagesTab({ isAdmin }: MessagesTabProps) {
  const { t } = useLanguage();
  const { data: messages, isLoading } = useAllMessages();
  const deleteMessage = useDeleteMessage();
  const markRead = useMarkMessageRead();
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | undefined>(
    undefined,
  );
  const [replyTarget, setReplyTarget] = useState<bigint | null>(null);

  useEffect(() => {
    if (!isAdmin || !messages) return;
    const unread = messages.filter((m) => !m.isRead);
    for (const msg of unread) {
      markRead.mutate(msg.id);
    }
  }, [isAdmin, messages, markRead.mutate]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMessage.mutateAsync(deleteTarget.id);
      toast.success(t("admin.delete_msg_success"));
      setDeleteTarget(undefined);
    } catch {
      toast.error(t("admin.delete_msg_error"));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2" data-ocid="admin.messages.loading_state">
        {ROW_SKELETON_KEYS.map((k) => (
          <Skeleton key={k} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-md"
        data-ocid="admin.messages.empty_state"
      >
        <Inbox className="w-10 h-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">
          {t("admin.no_messages")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border border-border overflow-hidden">
        <Table data-ocid="admin.messages.table">
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                {t("admin.col_name")}
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium hidden sm:table-cell">
                {t("admin.col_email")}
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                {t("admin.col_message")}
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium hidden md:table-cell">
                {t("admin.col_date")}
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium text-right">
                {t("admin.col_actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((msg, idx) => (
              <TableRow
                key={msg.id.toString()}
                className={`border-border hover:bg-muted/20 ${
                  !msg.isRead ? "bg-primary/5" : ""
                }`}
                data-ocid={`admin.messages.item.${idx + 1}`}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {!msg.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {msg.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <a
                    href={`mailto:${msg.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {msg.email}
                  </a>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm text-muted-foreground max-w-xs truncate">
                      {msg.message}
                    </p>
                    {msg.adminReply && (
                      <div className="mt-1.5 px-2 py-1.5 rounded bg-green-50 border border-green-200 max-w-xs">
                        <p className="text-xs font-semibold text-green-700 mb-0.5">
                          {t("admin.reply_label")}
                        </p>
                        <p className="text-xs text-green-800">
                          {msg.adminReply}
                        </p>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatDateTime(msg.createdAt)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyTarget(msg.id)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                      data-ocid={`admin.messages.reply_button.${idx + 1}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(msg)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      data-ocid={`admin.messages.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ReplyDialog
        open={replyTarget !== null}
        onOpenChange={(open) => !open && setReplyTarget(null)}
        messageId={replyTarget}
        isHelpMessage={false}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        itemName={deleteTarget ? `message from ${deleteTarget.name}` : ""}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMessage.isPending}
      />
    </>
  );
}

function HelpMessagesTab() {
  const { t } = useLanguage();
  const { data: messages, isLoading } = useAllHelpMessages(true);
  const [replyTarget, setReplyTarget] = useState<bigint | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {ROW_SKELETON_KEYS.map((k) => (
          <Skeleton key={k} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-md"
        data-ocid="admin.help.empty_state"
      >
        <MessageSquare className="w-10 h-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">
          {t("admin.no_help_messages")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                {t("admin.col_from")}
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                {t("admin.col_message")}
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium hidden md:table-cell">
                {t("admin.col_date")}
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium text-right">
                {t("admin.col_reply")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((msg: HelpMessage, idx: number) => (
              <TableRow
                key={msg.id.toString()}
                className="border-border hover:bg-muted/20"
                data-ocid={`admin.help.item.${idx + 1}`}
              >
                <TableCell>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {msg.name}
                    </p>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-xs text-primary hover:underline"
                    >
                      {msg.email}
                    </a>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm text-muted-foreground max-w-xs truncate">
                      {msg.message}
                    </p>
                    {msg.adminReply && (
                      <div className="mt-1.5 px-2 py-1.5 rounded bg-green-50 border border-green-200 max-w-xs">
                        <p className="text-xs font-semibold text-green-700 mb-0.5">
                          {t("admin.your_reply_label")}
                        </p>
                        <p className="text-xs text-green-800">
                          {msg.adminReply}
                        </p>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatDateTime(msg.createdAt)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTarget(msg.id)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                    data-ocid={`admin.help.reply_button.${idx + 1}`}
                  >
                    <Reply className="w-3.5 h-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ReplyDialog
        open={replyTarget !== null}
        onOpenChange={(open) => !open && setReplyTarget(null)}
        messageId={replyTarget}
        isHelpMessage={true}
      />
    </>
  );
}

export default function AdminPage() {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { t } = useLanguage();
  const isAuthenticated = !!identity;

  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: items, isLoading: itemsLoading } = useAllItems();
  const { data: unreadCount } = useUnreadMessageCount(
    isAuthenticated && isAdmin === true,
  );

  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | undefined>(
    undefined,
  );
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | undefined>(
    undefined,
  );
  const [activeTab, setActiveTab] = useState("inventory");

  const handleAddClick = () => {
    setEditItem(undefined);
    setFormOpen(true);
  };

  const handleEditClick = (item: InventoryItem) => {
    setEditItem(item);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: ItemFormData) => {
    try {
      if (editItem) {
        await updateItem.mutateAsync({ id: editItem.id, data });
        toast.success(t("admin.item_updated"));
      } else {
        await createItem.mutateAsync(data);
        toast.success(t("admin.item_created"));
      }
      setFormOpen(false);
      setEditItem(undefined);
    } catch {
      toast.error(t("admin.item_save_error"));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteItem.mutateAsync(deleteTarget.id);
      toast.success(t("admin.item_deleted"));
      setDeleteTarget(undefined);
    } catch {
      toast.error(t("admin.item_delete_error"));
    }
  };

  if (!isAuthenticated && !isInitializing) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-20">
        <div className="max-w-sm mx-auto text-center">
          <div className="w-14 h-14 rounded-full bg-muted/50 border border-border flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-6 h-6 text-muted-foreground" />
          </div>
          <h2 className="font-display font-700 text-xl text-foreground mb-2">
            {t("admin.admin_access_required")}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {t("admin.sign_in_to_manage")}
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
            data-ocid="admin.login_button"
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4 mr-2" />
            )}
            {isLoggingIn ? t("admin.signing_in") : t("admin.sign_in")}
          </Button>
        </div>
      </div>
    );
  }

  if (isInitializing || adminLoading) {
    return (
      <div
        className="container max-w-7xl mx-auto px-4 py-8"
        data-ocid="admin.loading_state"
      >
        <div className="flex items-center gap-3 mb-6">
          {HEADER_SKELETON_KEYS.map((k) => (
            <Skeleton key={k} className="h-8 w-40" />
          ))}
        </div>
        <div className="space-y-2">
          {ROW_SKELETON_KEYS.map((k) => (
            <Skeleton key={k} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isAuthenticated && isAdmin === false) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-20">
        <div className="max-w-sm mx-auto text-center">
          <div className="w-14 h-14 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto mb-4">
            <ShieldOff className="w-6 h-6 text-destructive" />
          </div>
          <h2 className="font-display font-700 text-xl text-foreground mb-2">
            {t("admin.not_authorized")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("admin.not_authorized_desc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-700 text-2xl text-foreground tracking-tight">
              {t("admin.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {items
                ? `${items.length} ${t("admin.items_total")}`
                : t("admin.managing_inventory")}
            </p>
          </div>
          {activeTab === "inventory" && (
            <Button
              onClick={handleAddClick}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="admin.add_item_button"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("admin.add_item")}
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="inventory" data-ocid="admin.inventory_tab">
              <Package className="w-4 h-4 mr-2" />
              {t("admin.tab_inventory")}
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              data-ocid="admin.messages_tab"
              className="relative"
            >
              <Inbox className="w-4 h-4 mr-2" />
              {t("admin.tab_messages")}
              {unreadCount != null && unreadCount > 0 && (
                <span className="ml-2 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="help" data-ocid="admin.help_tab">
              <MessageSquare className="w-4 h-4 mr-2" />
              {t("admin.tab_help")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            {itemsLoading ? (
              <div className="space-y-2">
                {ROW_SKELETON_KEYS.map((k) => (
                  <Skeleton key={k} className="h-12 w-full" />
                ))}
              </div>
            ) : !items || items.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-md"
                data-ocid="admin.empty_state"
              >
                <Package className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {t("admin.no_items_yet")}
                </p>
              </div>
            ) : (
              <div className="rounded-md border border-border overflow-hidden">
                <Table data-ocid="admin.table">
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium w-8">
                        {t("admin.col_num")}
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                        {t("admin.col_name")}
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium hidden sm:table-cell">
                        {t("admin.col_category")}
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium hidden md:table-cell">
                        {t("admin.col_sku")}
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium text-right">
                        {t("admin.col_price")}
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium text-right hidden sm:table-cell">
                        {t("admin.col_stock")}
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium text-right">
                        {t("admin.col_actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow
                        key={item.id.toString()}
                        className="border-border hover:bg-muted/20"
                        data-ocid={`admin.item.${idx + 1}`}
                      >
                        <TableCell className="text-muted-foreground text-xs font-mono w-8">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.imageId ? (
                              <img
                                src={item.imageId.getDirectURL()}
                                alt={item.name}
                                className="w-7 h-7 rounded object-cover border border-border"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded bg-muted/50 border border-border flex items-center justify-center">
                                <Package className="w-3 h-3 text-muted-foreground" />
                              </div>
                            )}
                            <span className="text-sm font-medium text-foreground">
                              {item.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge
                            variant="outline"
                            className="text-xs border-border text-muted-foreground"
                          >
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="font-mono text-xs text-muted-foreground">
                            {item.sku}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono text-sm text-primary">
                            {formatCurrency(item.price)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">
                          <span className="font-mono text-xs text-muted-foreground">
                            {item.stockQuantity.toString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(item)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              data-ocid={`admin.edit_button.${idx + 1}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTarget(item)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              data-ocid={`admin.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages">
            <MessagesTab isAdmin={isAdmin === true} />
          </TabsContent>

          <TabsContent value="help">
            <HelpMessagesTab />
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <ItemForm
          item={editItem}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormOpen(false)}
          isPending={createItem.isPending || updateItem.isPending}
        />
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        itemName={deleteTarget?.name ?? ""}
        onConfirm={handleDeleteConfirm}
        isPending={deleteItem.isPending}
      />
    </div>
  );
}
