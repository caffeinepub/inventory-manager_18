import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeftRight,
  CheckSquare,
  ChevronRight,
  Download,
  GitCompare,
  Heart,
  Mic,
  Package,
  ScanLine,
  Search,
  SlidersHorizontal,
  Star,
  TrendingDown,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { InventoryItem } from "../backend";
import { useLanguage } from "../context/LanguageContext";
import { useAllItems, useReviewsByItem } from "../hooks/useQueries";

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    : null;

const isSpeechSupported = !!SpeechRecognitionAPI;

const LOYALTY_POINTS_KEY = "stockvault_loyalty_points";
const WISHLIST_KEY = "stockvault_wishlist";
const PREV_PRICES_KEY = "sv_prev_prices";

function formatCurrency(value: number) {
  return `\u20b9${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function exportCSV(items: InventoryItem[]) {
  const headers = [
    "Name",
    "Category",
    "SKU",
    "Description",
    "Price",
    "Supplier",
    "Stock Quantity",
  ];
  const rows = items.map((item) => [
    `"${item.name.replace(/"/g, '""')}"`,
    `"${item.category.replace(/"/g, '""')}"`,
    `"${item.sku.replace(/"/g, '""')}"`,
    `"${item.description.replace(/"/g, '""')}"`,
    item.price.toFixed(2),
    `"${item.supplier.replace(/"/g, '""')}"`,
    item.stockQuantity.toString(),
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inventory-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
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

function getSmartTag(item: InventoryItem): string | null {
  try {
    const orders = JSON.parse(
      localStorage.getItem("stockvault_orders") || "[]",
    ) as { itemId?: string }[];
    const count = orders.filter((o) => o.itemId === item.id.toString()).length;
    if (count >= 3) return "best_seller";
  } catch {
    /* ignore */
  }
  const ms = Number(item.createdAt / 1_000_000n);
  const ageMs = Date.now() - ms;
  if (ageMs < 7 * 24 * 60 * 60 * 1000) return "new_arrival";
  if (Number(item.stockQuantity) < 5 && Number(item.stockQuantity) > 0)
    return "clearance";
  return null;
}

// ── Item Average Rating (per card) ───────────────────────────────────────────────────────

function useItemAvgRating(itemId: bigint) {
  const { data: reviews } = useReviewsByItem(itemId);
  if (!reviews || reviews.length === 0) return null;
  const avg =
    reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length;
  return { avg: Math.round(avg * 10) / 10, count: reviews.length };
}

function StarRatingDisplay({
  rating,
  small,
}: { rating: number; small?: boolean }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${small ? "w-3 h-3" : "w-3.5 h-3.5"} ${
            s <= Math.round(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

// ── Compare Modal ───────────────────────────────────────────────────────────────

interface CompareModalProps {
  items: InventoryItem[];
  onClose: () => void;
}

function CompareModal({ items, onClose }: CompareModalProps) {
  const rows = [
    { label: "Name", key: "name" },
    { label: "Category", key: "category" },
    { label: "Price", key: "price" },
    { label: "Selling Price", key: "sellingPrice" },
    { label: "Stock", key: "stockQuantity" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        className="bg-card rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-border"
        onClick={(e) => e.stopPropagation()}
        data-ocid="inventory.compare.modal"
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg text-foreground">
              Product Comparison
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            data-ocid="inventory.compare.close_button"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">
                  Feature
                </th>
                {items.map((item) => (
                  <th
                    key={item.id.toString()}
                    className="text-left p-3 text-xs font-semibold text-foreground"
                  >
                    <div className="flex items-center gap-2">
                      {item.imageId ? (
                        <img
                          src={item.imageId.getDirectURL()}
                          alt={item.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                          <Package className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className="truncate max-w-[120px]">
                        {item.name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={row.key}
                  className={idx % 2 === 0 ? "bg-muted/10" : ""}
                >
                  <td className="p-3 text-xs text-muted-foreground font-medium">
                    {row.label}
                  </td>
                  {items.map((item) => {
                    const val = (item as any)[row.key];
                    let display = String(val ?? "\u2014");
                    if (row.key === "price" || row.key === "sellingPrice")
                      display = formatCurrency(Number(val));
                    else if (row.key === "stockQuantity")
                      display = `${val} units`;
                    return (
                      <td
                        key={item.id.toString()}
                        className="p-3 text-sm text-foreground font-medium"
                      >
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Item Card ──────────────────────────────────────────────────────────────────────────

function ItemCard({
  item,
  index,
  isComparing,
  onToggleCompare,
}: {
  item: InventoryItem;
  index: number;
  isComparing: boolean;
  onToggleCompare: (item: InventoryItem) => void;
}) {
  const imageUrl = item.imageId ? item.imageId.getDirectURL() : null;
  const { t } = useLanguage();
  const ratingData = useItemAvgRating(item.id);
  const inStock = Number(item.stockQuantity) > 0;
  const prevPrice = getPrevPrice(item.id.toString());
  const priceDropped = prevPrice !== null && item.price < prevPrice;
  const smartTag = getSmartTag(item);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="relative group"
    >
      {/* Compare checkbox */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onToggleCompare(item);
        }}
        className={`absolute top-2 left-2 z-10 w-6 h-6 rounded flex items-center justify-center transition-all ${
          isComparing
            ? "bg-primary text-primary-foreground"
            : "bg-background/80 text-muted-foreground border border-border opacity-0 group-hover:opacity-100"
        }`}
        title="Compare"
        data-ocid={`inventory.compare.toggle.${index + 1}`}
      >
        <CheckSquare className="w-3.5 h-3.5" />
      </button>

      <Link
        to="/item/$id"
        params={{ id: item.id.toString() }}
        className={`block bg-card border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
          isComparing ? "border-primary ring-1 ring-primary" : "border-border"
        }`}
        data-ocid={`inventory.item.${index + 1}`}
      >
        <div className="aspect-[4/3] bg-muted/30 relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-10 h-10 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            <Badge
              variant="secondary"
              className="text-[10px] bg-background/80 backdrop-blur-sm border-border font-mono"
            >
              {item.sku}
            </Badge>
            {inStock ? (
              <Badge
                className="text-[10px] bg-green-100 text-green-700 border-green-200 backdrop-blur-sm"
                data-ocid={`inventory.in_stock.${index + 1}`}
              >
                In Stock
              </Badge>
            ) : (
              <Badge
                className="text-[10px] bg-red-100 text-red-700 border-red-200 backdrop-blur-sm"
                data-ocid={`inventory.out_of_stock.${index + 1}`}
              >
                Out of Stock
              </Badge>
            )}
          </div>
          {/* Price Drop Badge */}
          {priceDropped && (
            <div className="absolute top-2 left-2 z-10">
              <Badge
                className="bg-red-600 text-white border-0 text-[10px] flex items-center gap-0.5"
                data-ocid={`inventory.price_drop.${index + 1}`}
              >
                <TrendingDown className="w-3 h-3" />
                {t("inventory.price_dropped")}
              </Badge>
            </div>
          )}
          {/* Smart Tag */}
          {smartTag && !priceDropped && (
            <div className="absolute top-2 left-2 z-10">
              <Badge
                className={`text-[10px] border-0 ${
                  smartTag === "best_seller"
                    ? "bg-orange-500 text-white"
                    : smartTag === "new_arrival"
                      ? "bg-blue-500 text-white"
                      : "bg-red-500 text-white"
                }`}
                data-ocid={`inventory.smart_tag.${index + 1}`}
              >
                {t(`inventory.${smartTag}`)}
              </Badge>
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {item.name}
            </h3>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors mt-0.5" />
          </div>
          <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
          {ratingData && (
            <div className="flex items-center gap-1 mb-1">
              <StarRatingDisplay rating={ratingData.avg} small />
              <span className="text-[10px] text-muted-foreground">
                ({ratingData.count})
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono font-semibold text-sm text-primary">
                {formatCurrency(item.price)}
              </span>
              {priceDropped && prevPrice && (
                <span className="font-mono text-xs text-muted-foreground line-through">
                  {formatCurrency(prevPrice)}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {item.stockQuantity.toString()} {t("inventory.units")}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export default function InventoryListPage() {
  const { data: items, isLoading, isError } = useAllItems();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [compareList, setCompareList] = useState<InventoryItem[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [loyaltyPoints] = useState(() =>
    Number(localStorage.getItem(LOYALTY_POINTS_KEY) || "0"),
  );
  const [wishlistCount] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]").length;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleVoiceSearch = () => {
    if (!isSpeechSupported) return;
    if (isListening) {
      recognitionRef.current?.abort();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setSearch(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const categories = useMemo(() => {
    if (!items) return [];
    return Array.from(new Set(items.map((i) => i.category))).sort();
  }, [items]);

  const toggleCompare = (item: InventoryItem) => {
    setCompareList((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) return prev.filter((i) => i.id !== item.id);
      if (prev.length >= 3) return prev;
      return [...prev, item];
    });
  };

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.toLowerCase();
    return items.filter((item) => {
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q);
      const matchCategory = !filterCategory || item.category === filterCategory;
      const minPrice = filterMinPrice
        ? Number.parseFloat(filterMinPrice)
        : null;
      const maxPrice = filterMaxPrice
        ? Number.parseFloat(filterMaxPrice)
        : null;
      const matchMin = minPrice === null || item.price >= minPrice;
      const matchMax = maxPrice === null || item.price <= maxPrice;
      // Tag filter
      let matchTag = true;
      if (tagFilter !== "all") {
        matchTag = getSmartTag(item) === tagFilter;
      }
      return matchSearch && matchCategory && matchMin && matchMax && matchTag;
    });
  }, [
    items,
    search,
    filterCategory,
    filterMinPrice,
    filterMaxPrice,
    tagFilter,
  ]);

  const hasFilters = !!(filterCategory || filterMinPrice || filterMaxPrice);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-bold text-3xl text-foreground tracking-tight">
              {t("inventory.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {items
                ? `${items.length} ${t("inventory.items_in_stock")}`
                : t("inventory.loading")}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {loyaltyPoints > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                My Points: {loyaltyPoints}
              </div>
            )}
            {wishlistCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-xs font-semibold">
                <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
                Wishlist: {wishlistCount}
              </div>
            )}
            <Button
              onClick={() => items && exportCSV(items)}
              disabled={!items || items.length === 0}
              variant="outline"
              size="sm"
              className="border-border hover:border-primary/50 hover:text-primary"
              data-ocid="inventory.export_csv_button"
            >
              <Download className="w-3.5 h-3.5 mr-2" />
              {t("inventory.export_csv")}
            </Button>
          </div>
        </div>

        {/* Smart Category Tag Filter */}
        <div className="mt-4 flex flex-wrap gap-2">
          {(["all", "best_seller", "new_arrival", "clearance"] as const).map(
            (tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setTagFilter(tag)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                  tagFilter === tag
                    ? tag === "all"
                      ? "bg-primary text-primary-foreground border-primary"
                      : tag === "best_seller"
                        ? "bg-orange-500 text-white border-orange-500"
                        : tag === "new_arrival"
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-red-500 text-white border-red-500"
                    : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                }`}
                data-ocid={`inventory.${tag}_filter.tab`}
              >
                {t(`inventory.filter_${tag}`)}
              </button>
            ),
          )}
        </div>

        {/* Search + filter row */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("inventory.search_placeholder")}
              className="pl-9 bg-card border-border pr-16"
              data-ocid="inventory.search_input"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={toggleVoiceSearch}
                  aria-label={
                    isListening
                      ? t("inventory.stop_voice")
                      : t("inventory.start_voice")
                  }
                  className={`p-1 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isListening
                      ? "text-red-500 animate-pulse"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                  data-ocid="inventory.voice_search_button"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  import("sonner").then(({ toast }) =>
                    toast.info(
                      "Use the Admin panel Barcode Scanner for full scanning functionality.",
                      { duration: 3000 },
                    ),
                  );
                }}
                aria-label="Barcode scanner"
                className="p-1 rounded text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                data-ocid="inventory.barcode_scan_button"
              >
                <ScanLine className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <Button
            variant={showFilters || hasFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={
              showFilters || hasFilters
                ? "bg-primary text-primary-foreground"
                : "border-border"
            }
            data-ocid="inventory.filter_toggle"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
            Filters {hasFilters && "(active)"}
          </Button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className="mt-3 p-4 bg-card border border-border rounded-lg flex flex-wrap gap-4"
                data-ocid="inventory.filter_panel"
              >
                {/* Category */}
                <div className="flex flex-col gap-1.5 min-w-[160px]">
                  <label
                    htmlFor="filter-cat"
                    className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                  >
                    Category
                  </label>
                  <select
                    id="filter-cat"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="text-sm rounded-md border border-border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                    data-ocid="inventory.filter_category_select"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price range */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Price Range (₹)
                  </span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      placeholder="Min"
                      value={filterMinPrice}
                      onChange={(e) => setFilterMinPrice(e.target.value)}
                      className="w-20 text-sm"
                      data-ocid="inventory.filter_min_price_input"
                    />
                    <span className="text-muted-foreground text-xs">—</span>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Max"
                      value={filterMaxPrice}
                      onChange={(e) => setFilterMaxPrice(e.target.value)}
                      className="w-20 text-sm"
                      data-ocid="inventory.filter_max_price_input"
                    />
                  </div>
                </div>

                {hasFilters && (
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilterCategory("");
                        setFilterMinPrice("");
                        setFilterMaxPrice("");
                      }}
                      className="text-muted-foreground h-8"
                      data-ocid="inventory.filter_clear_button"
                    >
                      <X className="w-3.5 h-3.5 mr-1" /> Clear
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
      {isError && (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          data-ocid="inventory.error_state"
        >
          <AlertCircle className="w-10 h-10 text-destructive mb-3" />
          <p className="text-muted-foreground text-sm">
            {t("inventory.failed_to_load")}
          </p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          data-ocid="inventory.loading_state"
        >
          {SKELETON_KEYS.map((k) => (
            <SkeletonCard key={k} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-md"
          data-ocid="inventory.empty_state"
        >
          <Package className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">
            {search || hasFilters
              ? t("inventory.no_items_match")
              : t("inventory.no_items_yet")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {search || hasFilters
              ? t("inventory.try_different_search")
              : t("inventory.add_from_admin")}
          </p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item, idx) => (
            <ItemCard
              key={item.id.toString()}
              item={item}
              index={idx}
              isComparing={!!compareList.find((i) => i.id === item.id)}
              onToggleCompare={toggleCompare}
            />
          ))}
        </div>
      )}

      {/* Compare floating bar */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm shadow-lg"
            data-ocid="inventory.compare.bar"
          >
            <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-foreground">
                  Comparing:
                </span>
                {compareList.map((item) => (
                  <div
                    key={item.id.toString()}
                    className="flex items-center gap-1.5 bg-primary/10 rounded-full px-3 py-1"
                  >
                    <span className="text-xs font-medium text-primary truncate max-w-[100px]">
                      {item.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleCompare(item)}
                      className="text-muted-foreground hover:text-destructive ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCompareList([])}
                  className="text-muted-foreground"
                  data-ocid="inventory.compare.clear_button"
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => setCompareOpen(true)}
                  disabled={compareList.length < 2}
                  className="bg-primary text-primary-foreground"
                  data-ocid="inventory.compare.open_modal_button"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 mr-1.5" />
                  Compare Now
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {compareOpen && compareList.length >= 2 && (
          <CompareModal
            items={compareList}
            onClose={() => setCompareOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
