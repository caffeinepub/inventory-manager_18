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
  AlertTriangle,
  BarChart2,
  BookOpen,
  BrainCircuit,
  CalendarPlus,
  Clock,
  Download,
  FileSpreadsheet,
  Inbox,
  IndianRupee,
  Loader2,
  LogIn,
  LogOut,
  MessageSquare,
  Package,
  Pencil,
  Plus,
  QrCode,
  Reply,
  ShieldOff,
  ShoppingCart,
  Trash2,
  TrendingDown,
  TrendingUp,
  WifiOff,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { InventoryItem } from "../backend";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import ItemForm from "../components/ItemForm";
import { useLanguage } from "../context/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useOfflineSync } from "../hooks/useOfflineSync";
import {
  useAllHelpMessages,
  useAllItems,
  useAllMessages,
  useAllOrders,
  useCreateItem,
  useDeleteItem,
  useDeleteMessage,
  useIsAdmin,
  useMarkMessageRead,
  useReplyToHelpMessage,
  useReplyToMessage,
  useUnreadMessageCount,
  useUpdateItem,
  useUpdateOrderStatus,
  useVisitCount,
} from "../hooks/useQueries";
import type { Order } from "../hooks/useQueries";
import type {
  ContactMessage,
  HelpMessage,
  ItemFormData,
} from "../hooks/useQueries";
import { useQRScanner } from "../qr-code/useQRScanner";
import { getOfflineQueue } from "../utils/offlineQueue";
import {
  AdminExpensesTab,
  AdminHistoryTab,
  AdminSalesTab,
  AdminStaffTab,
  AdminSuppliersTab,
  BulkUploadDialog,
  addInvLogEntry,
} from "./AdminExtraTabs";

const HEADER_SKELETON_KEYS = ["hs-a", "hs-b"];
const ROW_SKELETON_KEYS = ["rs-a", "rs-b", "rs-c", "rs-d", "rs-e", "rs-f"];

function formatCurrency(value: number) {
  return `\u20b9${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
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

function formatINR(value: number): string {
  return `\u20b9${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function isToday(nanoseconds: bigint): boolean {
  const ms = Number(nanoseconds / 1_000_000n);
  const d = new Date(ms);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function getExpiryStatus(
  expiryDate?: string,
): "expired" | "soon" | "ok" | "none" {
  if (!expiryDate) return "none";
  const expiry = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = expiry.getTime() - today.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return "expired";
  if (diffDays <= 7) return "soon";
  return "ok";
}

function getRowClass(expiryStatus: ReturnType<typeof getExpiryStatus>) {
  switch (expiryStatus) {
    case "expired":
      return "border-border bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50";
    case "soon":
      return "border-border bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/50";
    default:
      return "border-border hover:bg-muted/20";
  }
}

// ── Summary Cards ──────────────────────────────────────────────────────────

interface SummaryCardsProps {
  items: InventoryItem[];
}

function SummaryCards({ items }: SummaryCardsProps) {
  const totalValue = items.reduce(
    (sum, item) => sum + item.price * Number(item.stockQuantity),
    0,
  );
  const lowStockCount = items.filter(
    (item) => Number(item.stockQuantity) < 10,
  ).length;
  const todayCount = items.filter((item) => isToday(item.createdAt)).length;

  // Profit/Loss
  const totalProfitLoss = items.reduce((sum, item) => {
    const pl = (item.sellingPrice - item.price) * Number(item.stockQuantity);
    return sum + pl;
  }, 0);
  const isProfitable = totalProfitLoss >= 0;

  // Expiring soon (within 7 days, including expired)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiringSoon = items.filter((item) => {
    if (!item.expiryDate) return false;
    const expiry = new Date(item.expiryDate);
    const diffDays =
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Total Stock Value */}
      <div
        className="rounded-lg border border-border bg-card p-4 flex items-center gap-4"
        data-ocid="admin.total_value_card"
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <IndianRupee className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Total Stock Value
          </p>
          <p className="text-xl font-bold text-primary mt-0.5">
            {formatINR(totalValue)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Qty × Purchase Price
          </p>
        </div>
      </div>

      {/* Low Stock Items */}
      <div
        className="rounded-lg border border-border bg-card p-4 flex items-center gap-4"
        data-ocid="admin.low_stock_card"
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            lowStockCount > 0 ? "bg-amber-100" : "bg-green-100"
          }`}
        >
          <AlertTriangle
            className={`w-5 h-5 ${
              lowStockCount > 0 ? "text-amber-600" : "text-green-600"
            }`}
          />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Low Stock Items
          </p>
          <p
            className={`text-xl font-bold mt-0.5 ${
              lowStockCount > 0 ? "text-amber-600" : "text-green-600"
            }`}
          >
            {lowStockCount}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Threshold: &lt; 10 units
          </p>
        </div>
      </div>

      {/* Today's Entries */}
      <div
        className="rounded-lg border border-border bg-card p-4 flex items-center gap-4"
        data-ocid="admin.today_entries_card"
      >
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <CalendarPlus className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Today's Entries
          </p>
          <p className="text-xl font-bold text-blue-600 mt-0.5">{todayCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Added today</p>
        </div>
      </div>

      {/* Profit / Loss */}
      <div
        className="rounded-lg border border-border bg-card p-4 flex items-center gap-4"
        data-ocid="admin.profit_loss_card"
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            isProfitable ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {isProfitable ? (
            <TrendingUp className="w-5 h-5 text-green-600" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-600" />
          )}
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Total Profit / Loss
          </p>
          <p
            className={`text-xl font-bold mt-0.5 ${
              isProfitable ? "text-green-600" : "text-red-600"
            }`}
          >
            {isProfitable ? "+" : ""}
            {formatINR(totalProfitLoss)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            (Selling − Purchase) × Qty
          </p>
        </div>
      </div>

      {/* Expiring Soon */}
      <div
        className="rounded-lg border border-border bg-card p-4 flex items-start gap-4"
        data-ocid="admin.expiring_soon_card"
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
            expiringSoon.length > 0 ? "bg-red-100" : "bg-green-100"
          }`}
        >
          <Clock
            className={`w-5 h-5 ${
              expiringSoon.length > 0 ? "text-red-600" : "text-green-600"
            }`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Expiring Soon
          </p>
          <p
            className={`text-xl font-bold mt-0.5 ${
              expiringSoon.length > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {expiringSoon.length}
          </p>
          {expiringSoon.length > 0 && expiringSoon.length <= 3 ? (
            <ul className="mt-1 space-y-0.5">
              {expiringSoon.map((i) => (
                <li
                  key={i.id.toString()}
                  className="text-xs text-red-600 truncate"
                >
                  {i.name}
                </li>
              ))}
            </ul>
          ) : expiringSoon.length > 3 ? (
            <p className="text-xs text-muted-foreground mt-0.5">
              {expiringSoon.length} items need attention
            </p>
          ) : (
            <p className="text-xs text-green-600 mt-0.5">All good!</p>
          )}
        </div>
      </div>

      {/* Future Roadmap */}
      <div
        className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4 flex items-start gap-4"
        data-ocid="admin.roadmap_card"
      >
        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
          <BrainCircuit className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
              Coming Soon
            </p>
            <Badge
              variant="outline"
              className="text-[10px] border-primary/30 text-primary px-1.5 py-0"
            >
              Roadmap
            </Badge>
          </div>
          <p className="text-sm font-semibold text-foreground">
            🤖 AI Demand Forecasting
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Intelligent restocking predictions powered by AI
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Export helpers ────────────────────────────────────────────────────────

async function exportToPDF(items: InventoryItem[]) {
  if (!(window as any).jspdf) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load jsPDF"));
      document.head.appendChild(s);
    });
  }
  if (!(window as any).jspdf?.jsPDF && !(window as any).jsPDF) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load autotable"));
      document.head.appendChild(s);
    });
  }

  const jsPDFConstructor =
    (window as any).jspdf?.jsPDF || (window as any).jsPDF;
  const doc = new jsPDFConstructor({ orientation: "landscape" });

  const today = new Date().toLocaleDateString("en-IN");
  doc.setFontSize(16);
  doc.setTextColor(14, 30, 80);
  doc.text("StockVault Inventory Report", 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${today}`, 14, 23);

  const tableData = items.map((item) => [
    item.name,
    item.category,
    item.stockQuantity.toString(),
    formatINR(item.price),
  ]);

  doc.autoTable({
    startY: 28,
    head: [["Name", "Category", "Quantity", "Price"]],
    body: tableData,
    headStyles: { fillColor: [14, 30, 80], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [240, 248, 255] },
  });

  doc.save("stockvault-inventory.pdf");
}

function exportToExcel(items: InventoryItem[]) {
  const headers = ["Name", "Category", "Quantity", "Price (INR)"];
  const rows = items.map((item) => [
    item.name,
    item.category,
    item.stockQuantity.toString(),
    item.price.toFixed(2),
  ]);

  const bom = "\uFEFF";
  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "stockvault-inventory.xlsx";
  link.click();
  URL.revokeObjectURL(url);
}

function exportPurchaseDraft(items: InventoryItem[]) {
  const lowStock = items.filter((item) => Number(item.stockQuantity) < 10);
  if (lowStock.length === 0) {
    toast.info("No items below threshold — nothing to draft!");
    return;
  }
  const headers = [
    "Name",
    "SKU",
    "Category",
    "Current Stock",
    "Suggested Order Qty",
  ];
  const rows = lowStock.map((item) => [
    item.name,
    item.sku,
    item.category,
    item.stockQuantity.toString(),
    String(10 - Number(item.stockQuantity)),
  ]);
  const bom = "\uFEFF";
  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const today = new Date().toISOString().slice(0, 10);
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `purchase-draft-${today}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  toast.success(`Purchase draft with ${lowStock.length} items downloaded!`);
}

// ── Analytics Card ────────────────────────────────────────────────────────

function AnalyticsCard() {
  const { data: count, isLoading } = useVisitCount();

  return (
    <div
      className="rounded-lg border border-border bg-card p-5 mb-6"
      data-ocid="admin.analytics_card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">
            Platform Analytics
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs font-semibold text-green-600">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-md bg-primary/5 border border-primary/10 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Platform Reach
            </p>
            {isLoading ? (
              <Skeleton className="h-7 w-20 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-primary mt-0.5">
                {count !== undefined ? count.toLocaleString() : 0}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              Total page visits
            </p>
          </div>
        </div>

        <div className="rounded-md bg-green-50 border border-green-100 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <BarChart2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Live Tracking
            </p>
            <p className="text-sm font-semibold text-green-700 mt-0.5">
              Active
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Updates every 5 seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── QR Scanner Modal ──────────────────────────────────────────────────────

interface QRScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (sku: string) => void;
}

function QRScannerModal({ open, onOpenChange, onScan }: QRScannerModalProps) {
  const {
    qrResults,
    isScanning,
    isActive,
    isSupported,
    error,
    isLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    clearResults,
    videoRef,
    canvasRef,
  } = useQRScanner({
    facingMode: "environment",
    scanInterval: 150,
    maxResults: 3,
  });

  const scannedRef = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scanner functions are stable refs
  useEffect(() => {
    if (open) {
      scannedRef.current = false;
      clearResults();
      startScanning();
    } else {
      stopScanning();
      scannedRef.current = false;
    }
  }, [open]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scanner functions are stable refs
  useEffect(() => {
    if (qrResults.length > 0 && !scannedRef.current) {
      scannedRef.current = true;
      const data = qrResults[0].data;
      stopScanning();
      onScan(data);
      onOpenChange(false);
    }
  }, [qrResults]);

  const isMobile =
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" data-ocid="admin.qr_scanner_modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-primary" />
            Scan Barcode / QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {isSupported === false ? (
            <div className="text-sm text-destructive text-center py-4">
              Camera not supported on this device.
            </div>
          ) : (
            <>
              <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-40 h-40 border-2 border-primary rounded-lg animate-pulse" />
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />

              {error && (
                <p className="text-xs text-destructive">{error.message}</p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={isActive ? stopScanning : startScanning}
                  disabled={isLoading || (!isActive && !canStartScanning)}
                  data-ocid="admin.qr_scanner.toggle_button"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : null}
                  {isActive ? "Stop" : "Start"} Camera
                </Button>
                {isMobile && isActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const s = useQRScanner as any;
                      if (s.switchCamera) s.switchCamera();
                    }}
                    disabled={isLoading || !isActive}
                    data-ocid="admin.qr_scanner.switch_button"
                  >
                    Flip
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Point your camera at a barcode or QR code. It will be detected
                automatically.
              </p>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            data-ocid="admin.qr_scanner.close_button"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Reply Dialog ──────────────────────────────────────────────────────────

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

// ── Messages Tab ──────────────────────────────────────────────────────────

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

// ── Admin Help Guide ──────────────────────────────────────────────────────

function AdminHelpGuideCard() {
  return (
    <div
      className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-5"
      data-ocid="admin.help_guide_card"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          Admin Quick Reference Guide
        </h3>
      </div>
      <ol className="space-y-1.5 text-xs text-muted-foreground list-none">
        {[
          "Log in via the Admin link from your Caffeine dashboard",
          'Use "Inventory" tab to view, add, edit, or delete items',
          'Click "+" button to add a new item with name, category, price & image',
          "Click \u270f\ufe0f to edit an existing item, \ud83d\uddd1\ufe0f to delete it",
          'Use "Export" buttons (PDF / Excel) to download inventory reports',
          '"Messages" tab shows contact form submissions \u2014 reply inline',
          '"Help Center" tab shows user queries \u2014 reply directly from here',
          "Platform Analytics shows real-time visitor count",
        ].map((step, i) => (
          <li key={step} className="flex items-start gap-2">
            <span className="shrink-0 w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── Help Messages Tab ─────────────────────────────────────────────────────

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
      <AdminHelpGuideCard />
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

// ── Main AdminPage ────────────────────────────────────────────────────────

// ── Orders Tab ────────────────────────────────────────────────────────────

function OrdersTab() {
  const { data: orders, isLoading } = useAllOrders(true);
  const updateStatus = useUpdateOrderStatus();

  const formatDateTime = (ns: bigint) => {
    const ms = Number(ns / 1_000_000n);
    return new Date(ms).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const statusColors: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Confirmed: "bg-blue-100 text-blue-700 border-blue-200",
    Delivered: "bg-green-100 text-green-700 border-green-200",
    Cancelled: "bg-red-100 text-red-700 border-red-200",
  };

  const handleStatusChange = async (orderId: bigint, status: string) => {
    try {
      await updateStatus.mutateAsync({ orderId, status });
      toast.success(`Order #${orderId} marked as ${status}`);
    } catch {
      toast.error("Failed to update order status.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2" data-ocid="admin.orders.loading_state">
        {["a", "b", "c"].map((k) => (
          <Skeleton key={k} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-md"
        data-ocid="admin.orders.empty_state"
      >
        <ShoppingCart className="w-10 h-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">
          No orders yet. Orders placed by customers will appear here.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-md border border-border overflow-hidden"
      data-ocid="admin.orders.table"
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium w-16">
                Order ID
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                Customer
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium hidden sm:table-cell">
                Item
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium text-right hidden md:table-cell">
                Qty
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium text-right">
                Total
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                Status
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium hidden lg:table-cell">
                Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order: Order, idx: number) => (
              <TableRow
                key={order.id.toString()}
                className="border-border hover:bg-muted/20"
                data-ocid={`admin.order.${idx + 1}`}
              >
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{order.id.toString()}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.customerPhone}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {order.customerAddress}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm text-foreground">
                    {order.itemName}
                  </span>
                </TableCell>
                <TableCell className="text-right hidden md:table-cell">
                  <span className="font-mono text-sm">
                    {order.quantity.toString()}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-mono text-sm text-primary font-medium">
                    ₹{order.totalPrice.toLocaleString("en-IN")}
                  </span>
                </TableCell>
                <TableCell>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    className={`text-xs rounded-full border px-2 py-1 font-medium cursor-pointer ${statusColors[order.status] || "bg-muted text-foreground border-border"}`}
                    data-ocid={`admin.order.status_select.${idx + 1}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(order.createdAt)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const {
    identity,
    login,
    isLoggingIn,
    isInitializing,
    clear: logout,
  } = useInternetIdentity();
  const { t } = useLanguage();
  const isAuthenticated = !!identity;

  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: items, isLoading: itemsLoading } = useAllItems();
  const { data: unreadCount } = useUnreadMessageCount(
    isAuthenticated && isAdmin === true,
  );
  const { data: ordersData } = useAllOrders(
    isAuthenticated && isAdmin === true,
  );

  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  // Offline sync
  useOfflineSync();
  const [offlineQueueCount, setOfflineQueueCount] = useState(
    () => getOfflineQueue().length,
  );

  // Refresh offline count whenever component renders or window comes online
  useEffect(() => {
    const refresh = () => setOfflineQueueCount(getOfflineQueue().length);
    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    return () => {
      window.removeEventListener("online", refresh);
      window.removeEventListener("offline", refresh);
    };
  }, []);

  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | undefined>(
    undefined,
  );
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | undefined>(
    undefined,
  );
  const [activeTab, setActiveTab] = useState("inventory");
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [scannedSku, setScannedSku] = useState<string | undefined>(undefined);

  const handleAddClick = () => {
    setEditItem(undefined);
    setScannedSku(undefined);
    setFormOpen(true);
  };

  const handleEditClick = (item: InventoryItem) => {
    setEditItem(item);
    setScannedSku(undefined);
    setFormOpen(true);
  };

  const handleQrScan = (sku: string) => {
    setScannedSku(sku);
    setEditItem(undefined);
    setFormOpen(true);
    toast.success(`Scanned: ${sku}`);
  };

  const handleFormSubmit = async (data: ItemFormData) => {
    if (!navigator.onLine) {
      // Save offline
      const { queueOfflineItem } = await import("../utils/offlineQueue");
      queueOfflineItem({
        name: data.name,
        category: data.category,
        sku: data.sku,
        description: data.description,
        price: data.price,
        supplier: data.supplier,
        stockQuantity: data.stockQuantity.toString(),
        sellingPrice: data.sellingPrice ?? 0,
        expiryDate: data.expiryDate,
        queuedAt: Date.now(),
      });
      setOfflineQueueCount(getOfflineQueue().length);
      toast.info("Item saved offline. Will sync when connected.");
      setFormOpen(false);
      setEditItem(undefined);
      return;
    }

    try {
      if (editItem) {
        await updateItem.mutateAsync({ id: editItem.id, data });
        toast.success(t("admin.item_updated"));
        addInvLogEntry(
          data.name,
          "Updated",
          identity?.getPrincipal().toString() ?? "admin",
        );
      } else {
        await createItem.mutateAsync(data);
        toast.success(t("admin.item_created"));
        addInvLogEntry(
          data.name,
          "Created",
          identity?.getPrincipal().toString() ?? "admin",
        );
      }
      setFormOpen(false);
      setEditItem(undefined);
      setScannedSku(undefined);
    } catch {
      toast.error(t("admin.item_save_error"));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteItem.mutateAsync(deleteTarget.id);
      toast.success(t("admin.item_deleted"));
      addInvLogEntry(
        deleteTarget?.name ?? "item",
        "Deleted",
        identity?.getPrincipal().toString() ?? "admin",
      );
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
          <Button
            onClick={logout}
            variant="outline"
            className="mt-6 gap-2"
            data-ocid="admin.signout_button"
          >
            <LogOut className="w-4 h-4" />
            Sign Out &amp; Try Again
          </Button>
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
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display font-700 text-2xl text-foreground tracking-tight">
                {t("admin.title")}
              </h1>
              {offlineQueueCount > 0 && (
                <div
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 border border-amber-300"
                  data-ocid="admin.offline_pending_badge"
                >
                  <WifiOff className="w-3 h-3 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700">
                    {offlineQueueCount} pending sync
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {items
                ? `${items.length} ${t("admin.items_total")}`
                : t("admin.managing_inventory")}
            </p>
          </div>
          {activeTab === "inventory" && (
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!items || items.length === 0) {
                    toast.error("No items to export");
                    return;
                  }
                  try {
                    await exportToPDF(items);
                    toast.success("PDF downloaded!");
                  } catch {
                    toast.error("PDF export failed. Please try again.");
                  }
                }}
                className="border-primary text-primary hover:bg-primary/5"
                data-ocid="admin.download_pdf_button"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!items || items.length === 0) {
                    toast.error("No items to export");
                    return;
                  }
                  exportToExcel(items);
                  toast.success("Excel file downloaded!");
                }}
                className="border-primary text-primary hover:bg-primary/5"
                data-ocid="admin.export_excel_button"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => items && exportPurchaseDraft(items)}
                className="border-amber-500 text-amber-700 hover:bg-amber-50"
                data-ocid="admin.purchase_draft_button"
              >
                <Package className="w-3.5 h-3.5 mr-1.5" />
                Purchase Draft
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkUploadOpen(true)}
                data-ocid="admin.bulk_upload_button"
              >
                Upload CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQrScannerOpen(true)}
                className="border-primary text-primary hover:bg-primary/5"
                data-ocid="admin.scan_barcode_button"
              >
                <QrCode className="w-3.5 h-3.5 mr-1.5" />
                Scan
              </Button>
              <Button
                onClick={handleAddClick}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="admin.add_item_button"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("admin.add_item")}
              </Button>
            </div>
          )}
        </div>

        {/* Analytics Card */}
        <AnalyticsCard />

        {/* Summary Cards */}
        {items && <SummaryCards items={items} />}

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
            <TabsTrigger
              value="orders"
              data-ocid="admin.orders_tab"
              className="relative"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Orders
              {ordersData &&
                ordersData.filter((o) => o.status === "Pending").length > 0 && (
                  <span className="ml-2 min-w-[18px] h-[18px] rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                    {ordersData.filter((o) => o.status === "Pending").length}
                  </span>
                )}
            </TabsTrigger>
            <TabsTrigger value="suppliers" data-ocid="admin.suppliers_tab">
              {t("admin.tab_suppliers")}
            </TabsTrigger>
            <TabsTrigger value="expenses" data-ocid="admin.expenses_tab">
              {t("admin.tab_expenses")}
            </TabsTrigger>
            <TabsTrigger value="sales" data-ocid="admin.sales_tab">
              {t("admin.tab_sales")}
            </TabsTrigger>
            <TabsTrigger value="historylog" data-ocid="admin.history_tab">
              {t("admin.tab_history")}
            </TabsTrigger>
            <TabsTrigger value="staff" data-ocid="admin.staff_tab">
              {t("admin.tab_staff")}
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
                      <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium hidden lg:table-cell">
                        Expiry
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-medium text-right">
                        {t("admin.col_actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, idx) => {
                      const expiryStatus = getExpiryStatus(item.expiryDate);
                      return (
                        <TableRow
                          key={item.id.toString()}
                          className={getRowClass(expiryStatus)}
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
                          <TableCell className="hidden lg:table-cell">
                            {item.expiryDate ? (
                              <span
                                className={`text-xs font-mono ${
                                  expiryStatus === "expired"
                                    ? "text-red-600 font-semibold"
                                    : expiryStatus === "soon"
                                      ? "text-orange-600 font-semibold"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {item.expiryDate}
                                {expiryStatus === "expired" && " ⚠️"}
                                {expiryStatus === "soon" && " ⏰"}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground/40">
                                —
                              </span>
                            )}
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
                      );
                    })}
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
          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>
          <TabsContent value="suppliers">
            <AdminSuppliersTab />
          </TabsContent>
          <TabsContent value="expenses">
            <AdminExpensesTab orders={ordersData} />
          </TabsContent>
          <TabsContent value="sales">
            <AdminSalesTab orders={ordersData} />
          </TabsContent>
          <TabsContent value="historylog">
            <AdminHistoryTab />
          </TabsContent>
          <TabsContent value="staff">
            <AdminStaffTab />
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <ItemForm
          item={editItem}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setFormOpen(false);
            setScannedSku(undefined);
          }}
          isPending={createItem.isPending || updateItem.isPending}
          initialSku={scannedSku}
        />
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        itemName={deleteTarget?.name ?? ""}
        onConfirm={handleDeleteConfirm}
        isPending={deleteItem.isPending}
      />

      <QRScannerModal
        open={qrScannerOpen}
        onOpenChange={setQrScannerOpen}
        onScan={handleQrScan}
      />

      <BulkUploadDialog
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
      />
    </div>
  );
}
