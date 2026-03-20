import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  Copy,
  DollarSign,
  Facebook,
  Hash,
  Heart,
  Loader2,
  MessageCircle,
  Package,
  QrCode,
  Share2,
  ShoppingCart,
  Star,
  Tag,
  TrendingDown,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import { toast } from "sonner";
import { useLanguage } from "../context/LanguageContext";
import {
  useItem,
  usePlaceOrder,
  useReviewsByItem,
  useSubmitContactMessage,
  useSubmitReview,
} from "../hooks/useQueries";

const LOYALTY_KEY = "stockvault_loyalty_points";
const WISHLIST_KEY = "stockvault_wishlist";
const WA_NUMBER = "919984606371";
const GST_RATES_KEY = "sv_gst_rates";
const PREV_PRICES_KEY = "sv_prev_prices";

function getItemGstRate(itemId: string): number {
  try {
    const stored = localStorage.getItem(GST_RATES_KEY);
    if (stored) {
      const rates = JSON.parse(stored) as Record<string, number>;
      return rates[itemId] ?? 0;
    }
  } catch {
    /* ignore */
  }
  return 0;
}

function getPrevPrice(itemId: string): number | null {
  try {
    const stored = localStorage.getItem(PREV_PRICES_KEY);
    if (stored) {
      const prices = JSON.parse(stored) as Record<string, number>;
      return prices[itemId] ?? null;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function getSmartTags(item: {
  id: bigint;
  stockQuantity: bigint;
  createdAt: bigint;
}): string[] {
  const tags: string[] = [];
  // Best seller: 3+ orders
  try {
    const orders = JSON.parse(
      localStorage.getItem("stockvault_orders") || "[]",
    ) as { itemId?: string }[];
    const count = orders.filter((o) => o.itemId === item.id.toString()).length;
    if (count >= 3) tags.push("best_seller");
  } catch {
    /* ignore */
  }
  // New arrival: within 7 days
  const ms = Number(item.createdAt / 1_000_000n);
  const ageMs = Date.now() - ms;
  if (ageMs < 7 * 24 * 60 * 60 * 1000) tags.push("new_arrival");
  // Clearance: stock < 5
  if (Number(item.stockQuantity) < 5 && Number(item.stockQuantity) > 0)
    tags.push("clearance");
  return tags;
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function formatDateTime(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / 1_000_000n);
  return new Date(ms).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="w-7 h-7 rounded bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">
          {label}
        </p>
        <p className={`text-sm text-foreground ${mono ? "font-mono" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function StarRatingInput({
  value,
  onChange,
}: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              s <= (hover || value)
                ? "text-yellow-400 fill-yellow-400"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function StarRatingDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${
            s <= Math.round(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

// ── GST Breakdown ──────────────────────────────────────────────────────────

function GstBreakdown({
  basePrice,
  gstRate,
}: { basePrice: number; gstRate: number }) {
  const { t } = useLanguage();
  if (gstRate === 0) return null;
  const gstAmount = (basePrice * gstRate) / 100;
  const total = basePrice + gstAmount;
  return (
    <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 mt-2">
      <p className="text-xs font-semibold text-sky-700 mb-2 uppercase tracking-wide">
        GST Breakdown
      </p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            {t("item_detail.base_price")}
          </span>
          <span className="font-mono font-medium">
            {formatCurrency(basePrice)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            {t("item_detail.gst_rate")} ({gstRate}%)
          </span>
          <span className="font-mono text-orange-600">
            +{formatCurrency(gstAmount)}
          </span>
        </div>
        <Separator className="my-1" />
        <div className="flex justify-between font-semibold">
          <span className="text-foreground">
            {t("item_detail.total_with_gst")}
          </span>
          <span className="font-mono text-primary">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── QR Code Dialog ─────────────────────────────────────────────────────────

function QrCodeDialog({
  open,
  onOpenChange,
  itemId,
  itemName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  itemId: string;
  itemName: string;
}) {
  const { t } = useLanguage();
  const url = `${window.location.origin}/item/${itemId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

  const handleDownload = async () => {
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `qr-${itemName.replace(/\s+/g, "-")}.png`;
      link.click();
    } catch {
      toast.error("Failed to download QR code.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" data-ocid="item_detail.qr.dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-primary" />
            {t("item_detail.qr_code")}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <img
            src={qrUrl}
            alt={`QR code for ${itemName}`}
            className="w-48 h-48 rounded-lg border border-border"
          />
          <p className="text-xs text-muted-foreground text-center break-all">
            {url}
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            data-ocid="item_detail.qr.close_button"
          >
            Close
          </Button>
          <Button
            onClick={handleDownload}
            className="bg-primary text-primary-foreground"
            data-ocid="item_detail.qr.download_qr_button"
          >
            {t("item_detail.download_qr")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Inquiry Dialog ─────────────────────────────────────────────────────────

function InquiryDialog({
  open,
  onOpenChange,
  itemName,
}: { open: boolean; onOpenChange: (v: boolean) => void; itemName: string }) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    `Hi, I'm interested in ${itemName}. Can you provide more details?`,
  );
  const submitMsg = useSubmitContactMessage();

  const handleSend = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      await submitMsg.mutateAsync({ name, email, message });
      toast.success(t("item_detail.inquiry_sent"));
      onOpenChange(false);
      setName("");
      setEmail("");
    } catch {
      toast.error("Failed to send inquiry.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm"
        data-ocid="item_detail.inquiry.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            {t("item_detail.inquiry_dialog_title")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">
              {t("item_detail.inquiry_name")} *
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              data-ocid="item_detail.inquiry.name_input"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              {t("item_detail.inquiry_email")} *
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              data-ocid="item_detail.inquiry.email_input"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              {t("item_detail.inquiry_message")}
            </Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 h-20"
              data-ocid="item_detail.inquiry.message_textarea"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            data-ocid="item_detail.inquiry.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={submitMsg.isPending}
            className="bg-primary text-primary-foreground"
            data-ocid="item_detail.inquiry.submit_button"
          >
            {submitMsg.isPending && (
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
            )}
            {t("item_detail.inquiry_send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Order Modal ────────────────────────────────────────────────────────────

interface OrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: bigint;
  itemName: string;
  itemPrice: number;
  gstRate: number;
}

async function generateInvoicePDF(order: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  gstAmount: number;
  totalPrice: number;
  loyaltyPoints: number;
}) {
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
  const jsPDFConstructor =
    (window as any).jspdf?.jsPDF || (window as any).jsPDF;
  const doc = new jsPDFConstructor();

  doc.setFontSize(22);
  doc.setTextColor(14, 30, 80);
  doc.text("StockVault", 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("E-Invoice / Order Receipt", 14, 28);
  doc.line(14, 32, 196, 32);

  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(`Order ID: #${order.orderId}`, 14, 42);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 50);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Customer Details", 14, 62);
  doc.setTextColor(0);
  doc.text(`Name: ${order.customerName}`, 14, 70);
  doc.text(`Phone: ${order.customerPhone}`, 14, 78);
  doc.text(`Address: ${order.customerAddress}`, 14, 86);

  doc.setTextColor(100);
  doc.text("Order Summary", 14, 100);
  doc.line(14, 104, 196, 104);
  doc.setTextColor(0);
  doc.text(order.itemName, 14, 112);
  doc.text(`Qty: ${order.quantity}`, 120, 112);
  doc.text(`Unit: \u20b9${order.unitPrice.toFixed(2)}`, 150, 112);
  doc.line(14, 118, 196, 118);

  let y = 126;
  doc.setFontSize(10);
  doc.text(
    `Base Price: \u20b9${(order.unitPrice * order.quantity).toFixed(2)}`,
    14,
    y,
  );
  y += 8;
  if (order.gstRate > 0) {
    doc.setTextColor(180, 100, 0);
    doc.text(
      `GST (${order.gstRate}%): +\u20b9${order.gstAmount.toFixed(2)}`,
      14,
      y,
    );
    y += 8;
    doc.setTextColor(0);
  }
  doc.setFontSize(13);
  doc.setTextColor(14, 30, 80);
  doc.text(`Total: \u20b9${order.totalPrice.toFixed(2)}`, 14, y + 2);
  y += 12;

  if (order.loyaltyPoints > 0) {
    doc.setFontSize(9);
    doc.setTextColor(0, 150, 0);
    doc.text(
      `\u2b50 Loyalty Points Earned: +${order.loyaltyPoints} pts`,
      14,
      y,
    );
    y += 8;
  }

  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text(
    "Thank you for your order! StockVault \u2014 \ud83d\udee1\ufe0f 100% Secure & Verified",
    14,
    280,
  );

  doc.save(`invoice-${order.orderId}.pdf`);
}

function OrderModal({
  open,
  onOpenChange,
  itemId,
  itemName,
  itemPrice,
  gstRate,
}: OrderModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [quantity, setQuantity] = useState(1);
  const placeOrder = usePlaceOrder();

  const baseTotal = itemPrice * quantity;
  const gstAmount = (baseTotal * gstRate) / 100;
  const total = baseTotal + gstAmount;

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (quantity < 1) {
      toast.error("Quantity must be at least 1.");
      return;
    }
    try {
      const orderId = await placeOrder.mutateAsync({
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        itemId,
        quantity: BigInt(quantity),
      });
      // Award loyalty points: 1 pt per ₹100
      const pts = Math.floor(total / 100);
      if (pts > 0) {
        const existing = Number(localStorage.getItem(LOYALTY_KEY) || "0");
        localStorage.setItem(LOYALTY_KEY, String(existing + pts));
      }
      // Save order to localStorage
      try {
        const orders = JSON.parse(
          localStorage.getItem("stockvault_orders") || "[]",
        );
        orders.unshift({
          orderId: orderId.toString(),
          itemName,
          itemId: itemId.toString(),
          quantity,
          totalPrice: total,
          date: new Date().toLocaleDateString(),
          status: "Pending",
        });
        localStorage.setItem(
          "stockvault_orders",
          JSON.stringify(orders.slice(0, 50)),
        );
      } catch {
        /* ignore */
      }

      try {
        await generateInvoicePDF({
          orderId: orderId.toString(),
          customerName: name,
          customerPhone: phone,
          customerAddress: address,
          itemName,
          quantity,
          unitPrice: itemPrice,
          gstRate,
          gstAmount,
          totalPrice: total,
          loyaltyPoints: pts,
        });
      } catch {
        // Invoice generation is best-effort
      }
      toast.success(
        `Order placed! Invoice downloaded. +${pts} loyalty points earned!`,
      );
      onOpenChange(false);
      setName("");
      setPhone("");
      setAddress("");
      setQuantity(1);
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-ocid="item_detail.order.modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-primary" />
            Place Order
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 bg-muted/30 rounded-lg text-sm">
            <span className="font-medium text-foreground">{itemName}</span>
            <span className="text-muted-foreground ml-2">
              {formatCurrency(itemPrice)} / unit
              {gstRate > 0 && (
                <span className="ml-1 text-orange-600">(+{gstRate}% GST)</span>
              )}
            </span>
          </div>
          <div className="grid gap-3">
            <div>
              <Label
                htmlFor="order-name"
                className="text-xs text-muted-foreground"
              >
                Full Name *
              </Label>
              <Input
                id="order-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mt-1"
                data-ocid="item_detail.order.name_input"
              />
            </div>
            <div>
              <Label
                htmlFor="order-phone"
                className="text-xs text-muted-foreground"
              >
                Phone *
              </Label>
              <Input
                id="order-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="mt-1"
                data-ocid="item_detail.order.phone_input"
              />
            </div>
            <div>
              <Label
                htmlFor="order-address"
                className="text-xs text-muted-foreground"
              >
                Address *
              </Label>
              <Textarea
                id="order-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Delivery address"
                className="mt-1 h-20"
                data-ocid="item_detail.order.address_textarea"
              />
            </div>
            <div>
              <Label
                htmlFor="order-qty"
                className="text-xs text-muted-foreground"
              >
                Quantity
              </Label>
              <Input
                id="order-qty"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))
                }
                className="mt-1 w-24"
                data-ocid="item_detail.order.quantity_input"
              />
            </div>
          </div>
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                Base ({formatCurrency(itemPrice)} × {quantity})
              </span>
              <span className="font-mono">{formatCurrency(baseTotal)}</span>
            </div>
            {gstRate > 0 && (
              <div className="flex justify-between text-xs text-orange-600">
                <span>GST ({gstRate}%)</span>
                <span className="font-mono">+{formatCurrency(gstAmount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-mono font-bold text-lg text-primary">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            data-ocid="item_detail.order.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={placeOrder.isPending}
            className="bg-primary text-primary-foreground"
            data-ocid="item_detail.order.submit_button"
          >
            {placeOrder.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ShoppingCart className="w-4 h-4 mr-2" />
            )}
            {placeOrder.isPending
              ? "Placing..."
              : "Place Order & Download Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Reviews Section ────────────────────────────────────────────────────────

function ReviewsSection({ itemId }: { itemId: bigint }) {
  const { data: reviews, isLoading } = useReviewsByItem(itemId);
  const submitReview = useSubmitReview();
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length
      : 0;

  const handleSubmit = async () => {
    if (!reviewerName.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a comment.");
      return;
    }
    try {
      await submitReview.mutateAsync({
        itemId,
        reviewerName,
        rating: BigInt(rating),
        comment,
      });
      toast.success("Review submitted! Thank you for your feedback.");
      setReviewerName("");
      setRating(0);
      setComment("");
    } catch {
      toast.error("Failed to submit review.");
    }
  };

  return (
    <div className="mt-10" data-ocid="item_detail.reviews_section">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-display font-700 text-xl text-foreground">
          Ratings & Reviews
        </h2>
        {reviews && reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRatingDisplay rating={avgRating} />
            <span className="text-sm font-medium text-foreground">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
            </span>
          </div>
        )}
      </div>

      <div
        className="bg-card border border-border rounded-lg p-5 mb-6"
        data-ocid="item_detail.review.form"
      >
        <h3 className="font-medium text-sm text-foreground mb-4">
          Write a Review (Open to all visitors)
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="rv-name" className="text-xs text-muted-foreground">
              Your Name *
            </Label>
            <Input
              id="rv-name"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="Enter your name"
              className="mt-1"
              data-ocid="item_detail.review.name_input"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground block mb-1">
              Rating *
            </Label>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>
          <div>
            <Label
              htmlFor="rv-comment"
              className="text-xs text-muted-foreground"
            >
              Comment *
            </Label>
            <Textarea
              id="rv-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              className="mt-1 h-24"
              data-ocid="item_detail.review.comment_textarea"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={submitReview.isPending}
            className="bg-primary text-primary-foreground"
            data-ocid="item_detail.review.submit_button"
          >
            {submitReview.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {submitReview.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div
          className="space-y-3"
          data-ocid="item_detail.reviews.loading_state"
        >
          {["a", "b"].map((k) => (
            <Skeleton key={k} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && reviews && reviews.length === 0 && (
        <div
          className="text-center py-10 text-muted-foreground"
          data-ocid="item_detail.reviews.empty_state"
        >
          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No reviews yet. Be the first to review!</p>
        </div>
      )}

      {reviews && reviews.length > 0 && (
        <div className="space-y-4" data-ocid="item_detail.reviews.list">
          {reviews.map((review, idx) => (
            <motion.div
              key={review.id.toString()}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-card border border-border rounded-lg p-4"
              data-ocid={`item_detail.review.item.${idx + 1}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-medium text-sm text-foreground">
                    {review.reviewerName}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatDateTime(review.createdAt)}
                  </span>
                </div>
                <StarRatingDisplay rating={Number(review.rating)} />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {review.comment}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ItemDetailPage() {
  const { id } = useParams({ from: "/item/$id" });
  const { t } = useLanguage();
  const itemId = BigInt(id);
  const { data: item, isLoading, isError } = useItem(itemId);
  const [orderOpen, setOrderOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wishlisted, setWishlisted] = useState(() => {
    try {
      const list = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
      return list.includes(id);
    } catch {
      return false;
    }
  });

  const handleNotifyMe = () => {
    try {
      const list = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
        setWishlisted(true);
        toast.success("Added to wishlist! We'll contact you when it's back!");
      } else {
        toast.info("Already in your wishlist!");
      }
    } catch {
      toast.error("Could not update wishlist.");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(t("item_detail.copied"));
    } catch {
      toast.error("Could not copy link.");
    }
  };

  if (isLoading) {
    return (
      <div
        className="container max-w-4xl mx-auto px-4 py-8"
        data-ocid="item_detail.loading_state"
      >
        <Skeleton className="h-8 w-24 mb-6" />
        <div className="grid md:grid-cols-[2fr_3fr] gap-8">
          <Skeleton className="aspect-square rounded-md" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/" data-ocid="item_detail.back_button">
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            {t("item_detail.back")}
          </Link>
        </Button>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-10 h-10 text-destructive mb-3" />
          <p className="text-muted-foreground">
            {t("item_detail.item_not_found")}
          </p>
        </div>
      </div>
    );
  }

  const imageUrl = item.imageId ? item.imageId.getDirectURL() : null;
  const inStock = Number(item.stockQuantity) > 0;
  const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi, I'm interested in ${item.name}: ${window.location.href}`)} `;
  const fbLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
  const gstRate = getItemGstRate(id);
  const prevPrice = getPrevPrice(id);
  const priceDropped = prevPrice !== null && item.price < prevPrice;
  const smartTags = getSmartTags(item);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
          <Link to="/inventory" data-ocid="item_detail.back_button">
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            {t("item_detail.back_to_inventory")}
          </Link>
        </Button>

        {/* Price Drop Banner */}
        {priceDropped && (
          <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg">
            <TrendingDown className="w-4 h-4 text-red-600 shrink-0" />
            <span className="text-sm font-semibold text-red-700">
              {t("inventory.price_dropped")} {t("item_detail.original_price")}:{" "}
              {formatCurrency(prevPrice)}
            </span>
          </div>
        )}

        <div className="grid md:grid-cols-[2fr_3fr] gap-8">
          {/* Image */}
          <div className="aspect-square bg-muted/30 rounded-md overflow-hidden border border-border relative">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground/20" />
              </div>
            )}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5">
              {inStock ? (
                <Badge
                  className="bg-green-500 text-white border-0 shadow"
                  data-ocid="item_detail.in_stock_badge"
                >
                  In Stock
                </Badge>
              ) : (
                <Badge
                  className="bg-red-500 text-white border-0 shadow"
                  data-ocid="item_detail.out_of_stock_badge"
                >
                  Out of Stock
                </Badge>
              )}
              {priceDropped && (
                <Badge className="bg-red-600 text-white border-0 shadow text-[10px]">
                  📉 {t("inventory.price_dropped")}
                </Badge>
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="mb-3">
              <div className="flex flex-wrap gap-1 mb-2">
                <Badge
                  variant="outline"
                  className="text-xs border-border text-muted-foreground"
                >
                  {item.category}
                </Badge>
                {smartTags.map((tag) => (
                  <Badge
                    key={tag}
                    className={`text-[10px] border-0 ${
                      tag === "best_seller"
                        ? "bg-orange-100 text-orange-700"
                        : tag === "new_arrival"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {t(`inventory.${tag}`)}
                  </Badge>
                ))}
              </div>
              <h1 className="font-display font-700 text-2xl text-foreground tracking-tight">
                {item.name}
              </h1>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-mono font-600 text-primary">
                  {formatCurrency(item.price)}
                </p>
                {priceDropped && (
                  <p className="text-sm font-mono text-muted-foreground line-through">
                    {formatCurrency(prevPrice)}
                  </p>
                )}
              </div>
            </div>

            {/* GST Breakdown */}
            <GstBreakdown basePrice={item.price} gstRate={gstRate} />

            {item.description && (
              <p className="text-sm text-muted-foreground leading-relaxed my-4">
                {item.description}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {inStock ? (
                <Button
                  onClick={() => setOrderOpen(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-ocid="item_detail.place_order_button"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Place Order
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleNotifyMe}
                  disabled={wishlisted}
                  className="border-pink-300 text-pink-700 hover:bg-pink-50"
                  data-ocid="item_detail.notify_me_button"
                >
                  <Heart
                    className={`w-4 h-4 mr-2 ${wishlisted ? "fill-pink-500 text-pink-500" : ""}`}
                  />
                  {wishlisted ? "In Wishlist ✓" : "Notify Me"}
                </Button>
              )}
              <Button
                asChild
                className="bg-[#25D366] text-white hover:bg-[#22c55e]"
                data-ocid="item_detail.whatsapp_button"
              >
                <a href={waLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInquiryOpen(true)}
                data-ocid="item_detail.inquiry_open_modal_button"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                {t("item_detail.send_inquiry")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQrOpen(true)}
                data-ocid="item_detail.qr_open_modal_button"
              >
                <QrCode className="w-3.5 h-3.5 mr-1.5" />
                {t("item_detail.view_qr")}
              </Button>
            </div>

            {/* Social Sharing */}
            <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-muted/30 rounded-lg">
              <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {t("item_detail.share")}:
              </span>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="h-7 text-xs px-2.5 bg-[#25D366]/10 border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366] hover:text-white"
                data-ocid="item_detail.whatsapp_share_button"
              >
                <a href={waLink} target="_blank" rel="noopener noreferrer">
                  <SiWhatsapp className="w-3 h-3 mr-1" />
                  WhatsApp
                </a>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="h-7 text-xs px-2.5 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white"
                data-ocid="item_detail.facebook_share_button"
              >
                <a href={fbLink} target="_blank" rel="noopener noreferrer">
                  <Facebook className="w-3 h-3 mr-1" />
                  Facebook
                </a>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs px-2.5"
                onClick={handleCopyLink}
                data-ocid="item_detail.copy_link_button"
              >
                <Copy className="w-3 h-3 mr-1" />
                {copied ? t("item_detail.copied") : t("item_detail.copy_link")}
              </Button>
            </div>

            <Separator className="bg-border mb-2" />

            <DetailRow
              icon={Hash}
              label={t("item_detail.sku")}
              value={item.sku}
              mono
            />
            <Separator className="bg-border" />
            <DetailRow
              icon={Tag}
              label={t("item_detail.category")}
              value={item.category}
            />
            <Separator className="bg-border" />
            <DetailRow
              icon={DollarSign}
              label={t("item_detail.price")}
              value={formatCurrency(item.price)}
              mono
            />
            <Separator className="bg-border" />
            <DetailRow
              icon={Truck}
              label={t("item_detail.supplier")}
              value={item.supplier}
            />
            <Separator className="bg-border" />
            <DetailRow
              icon={Archive}
              label={t("item_detail.stock_quantity")}
              value={`${item.stockQuantity.toString()} ${t("item_detail.units")}`}
              mono
            />
          </div>
        </div>

        {/* Reviews */}
        <ReviewsSection itemId={itemId} />
      </motion.div>

      {/* Modals */}
      <OrderModal
        open={orderOpen}
        onOpenChange={setOrderOpen}
        itemId={itemId}
        itemName={item.name}
        itemPrice={item.price}
        gstRate={gstRate}
      />
      <QrCodeDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        itemId={id}
        itemName={item.name}
      />
      <InquiryDialog
        open={inquiryOpen}
        onOpenChange={setInquiryOpen}
        itemName={item.name}
      />
    </div>
  );
}
