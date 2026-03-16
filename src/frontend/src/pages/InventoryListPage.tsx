import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ChevronRight,
  Download,
  Mic,
  Package,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { InventoryItem } from "../backend";
import { useAllItems } from "../hooks/useQueries";

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

// Check Speech Recognition support once at module level
const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    : null;

const isSpeechSupported = !!SpeechRecognitionAPI;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
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

function ItemCard({ item, index }: { item: InventoryItem; index: number }) {
  const imageUrl = item.imageId ? item.imageId.getDirectURL() : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      <Link
        to="/item/$id"
        params={{ id: item.id.toString() }}
        className="group block bg-card border border-border rounded-md overflow-hidden hover:border-primary/50 hover:shadow-glow transition-all duration-200"
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
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className="text-[10px] bg-background/80 backdrop-blur-sm border-border font-mono"
            >
              {item.sku}
            </Badge>
          </div>
        </div>
        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-display font-600 text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {item.name}
            </h3>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors mt-0.5" />
          </div>
          <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
          <div className="flex items-center justify-between">
            <span className="font-mono font-600 text-sm text-primary">
              {formatCurrency(item.price)}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {item.stockQuantity.toString()} units
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
  const [search, setSearch] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Cleanup on unmount
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

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q),
    );
  }, [items, search]);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-700 text-3xl text-foreground tracking-tight">
              Inventory
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {items ? `${items.length} items in stock` : "Loading..."}
            </p>
          </div>
          <Button
            onClick={() => items && exportCSV(items)}
            disabled={!items || items.length === 0}
            variant="outline"
            size="sm"
            className="border-border hover:border-primary/50 hover:text-primary"
            data-ocid="inventory.export_csv_button"
          >
            <Download className="w-3.5 h-3.5 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Search */}
        <div className="relative mt-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className={`pl-9 bg-card border-border${isSpeechSupported ? " pr-9" : ""}`}
            data-ocid="inventory.search_input"
          />
          {isSpeechSupported && (
            <button
              type="button"
              onClick={toggleVoiceSearch}
              aria-label={
                isListening ? "Stop voice search" : "Start voice search"
              }
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isListening
                  ? "text-red-500 animate-pulse"
                  : "text-muted-foreground hover:text-primary"
              }`}
              data-ocid="inventory.voice_search_button"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isError && (
        <div
          className="flex flex-col items-center justify-center py-20 text-muted-foreground"
          data-ocid="inventory.error_state"
        >
          <AlertCircle className="w-8 h-8 mb-3 text-destructive" />
          <p>Failed to load inventory. Please try again.</p>
        </div>
      )}

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

      {!isLoading && !isError && filtered.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-24 text-center"
          data-ocid="inventory.empty_state"
        >
          <div className="w-16 h-16 rounded-full bg-muted/50 border border-border flex items-center justify-center mb-4">
            <Package className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="font-display font-600 text-base text-foreground mb-1">
            {search ? "No items match your search" : "No items yet"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {search
              ? "Try a different search term"
              : "Add items from the admin panel to see them here"}
          </p>
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item, idx) => (
            <ItemCard key={item.id.toString()} item={item} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
