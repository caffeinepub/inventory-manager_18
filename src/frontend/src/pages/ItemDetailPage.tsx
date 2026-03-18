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
  DollarSign,
  Hash,
  Heart,
  Loader2,
  MessageCircle,
  Package,
  ShoppingCart,
  Star,
  Tag,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "../context/LanguageContext";
import {
  useItem,
  usePlaceOrder,
  useReviewsByItem,
  useSubmitReview,
} from "../hooks/useQueries";

const LOYALTY_KEY = "stockvault_loyalty_points";
const WISHLIST_KEY = "stockvault_wishlist";
const WA_NUMBER = "919984606371";

function formatCurrency(value: number) {
  return `\u20b9${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
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

// ── Order Modal ────────────────────────────────────────────────────────────

interface OrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: bigint;
  itemName: string;
  itemPrice: number;
}

async function generateInvoicePDF(order: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}) {
  // Load jsPDF via CDN
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

  // Header
  doc.setFontSize(22);
  doc.setTextColor(14, 30, 80);
  doc.text("StockVault", 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Invoice / Order Receipt", 14, 28);
  doc.line(14, 32, 196, 32);

  // Order info
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(`Order ID: #${order.orderId}`, 14, 42);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 50);

  // Customer
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Customer Details", 14, 62);
  doc.setTextColor(0);
  doc.text(`Name: ${order.customerName}`, 14, 70);
  doc.text(`Phone: ${order.customerPhone}`, 14, 78);
  doc.text(`Address: ${order.customerAddress}`, 14, 86);

  // Item
  doc.setTextColor(100);
  doc.text("Order Summary", 14, 100);
  doc.line(14, 104, 196, 104);
  doc.setTextColor(0);
  doc.text(order.itemName, 14, 112);
  doc.text(`Qty: ${order.quantity}`, 120, 112);
  doc.text(`Unit: \u20b9${order.unitPrice.toFixed(2)}`, 150, 112);
  doc.line(14, 118, 196, 118);
  doc.setFontSize(13);
  doc.setTextColor(14, 30, 80);
  doc.text(`Total: \u20b9${order.totalPrice.toFixed(2)}`, 14, 128);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text(
    "Thank you for your order! StockVault - \u20b9100% Secure & Verified",
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
}: OrderModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [quantity, setQuantity] = useState(1);
  const placeOrder = usePlaceOrder();

  const total = itemPrice * quantity;

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
      // Generate invoice
      try {
        await generateInvoicePDF({
          orderId: orderId.toString(),
          customerName: name,
          customerPhone: phone,
          customerAddress: address,
          itemName,
          quantity,
          unitPrice: itemPrice,
          totalPrice: total,
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
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
            <span className="text-sm text-muted-foreground">
              Estimated Total
            </span>
            <span className="font-mono font-700 text-lg text-primary">
              {formatCurrency(total)}
            </span>
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

      {/* Submit form */}
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

      {/* Review list */}
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
  const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi, I'm interested in ${item.name}`)} `;

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
            {/* Stock badge on image */}
            <div className="absolute top-3 right-3">
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
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="mb-4">
              <Badge
                variant="outline"
                className="text-xs border-border text-muted-foreground mb-2"
              >
                {item.category}
              </Badge>
              <h1 className="font-display font-700 text-2xl text-foreground tracking-tight">
                {item.name}
              </h1>
              <p className="text-2xl font-mono font-600 text-primary mt-1">
                {formatCurrency(item.price)}
              </p>
            </div>

            {item.description && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
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
                  Chat on WhatsApp
                </a>
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

      {/* Order Modal */}
      <OrderModal
        open={orderOpen}
        onOpenChange={setOrderOpen}
        itemId={itemId}
        itemName={item.name}
        itemPrice={item.price}
      />
    </div>
  );
}
