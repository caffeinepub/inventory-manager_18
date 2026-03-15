import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  DollarSign,
  Hash,
  Package,
  Tag,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useItem } from "../hooks/useQueries";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
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

export default function ItemDetailPage() {
  const { id } = useParams({ from: "/item/$id" });
  const itemId = BigInt(id);
  const { data: item, isLoading, isError } = useItem(itemId);

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
            Back
          </Link>
        </Button>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-10 h-10 text-destructive mb-3" />
          <p className="text-muted-foreground">
            Item not found or failed to load.
          </p>
        </div>
      </div>
    );
  }

  const imageUrl = item.imageId ? item.imageId.getDirectURL() : null;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
          <Link to="/" data-ocid="item_detail.back_button">
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            Back to Inventory
          </Link>
        </Button>

        <div className="grid md:grid-cols-[2fr_3fr] gap-8">
          {/* Image */}
          <div className="aspect-square bg-muted/30 rounded-md overflow-hidden border border-border">
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

            <Separator className="bg-border mb-2" />

            <DetailRow icon={Hash} label="SKU" value={item.sku} mono />
            <Separator className="bg-border" />
            <DetailRow icon={Tag} label="Category" value={item.category} />
            <Separator className="bg-border" />
            <DetailRow
              icon={DollarSign}
              label="Price"
              value={formatCurrency(item.price)}
              mono
            />
            <Separator className="bg-border" />
            <DetailRow icon={Truck} label="Supplier" value={item.supplier} />
            <Separator className="bg-border" />
            <DetailRow
              icon={Archive}
              label="Stock Quantity"
              value={`${item.stockQuantity.toString()} units`}
              mono
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
