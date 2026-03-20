import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import type { InventoryItem } from "../backend";
import type { ItemFormData } from "../hooks/useQueries";

const GST_RATES_KEY = "sv_gst_rates";

function saveItemGstRate(itemId: string, rate: number) {
  try {
    const stored = localStorage.getItem(GST_RATES_KEY);
    const rates: Record<string, number> = stored ? JSON.parse(stored) : {};
    rates[itemId] = rate;
    localStorage.setItem(GST_RATES_KEY, JSON.stringify(rates));
  } catch {
    /* ignore */
  }
}

interface ItemFormProps {
  item?: InventoryItem;
  onSubmit: (data: ItemFormData) => Promise<void>;
  onCancel: () => void;
  isPending: boolean;
  initialSku?: string;
}

export default function ItemForm({
  item,
  onSubmit,
  onCancel,
  isPending,
  initialSku,
}: ItemFormProps) {
  const [name, setName] = useState(item?.name ?? "");
  const [category, setCategory] = useState(item?.category ?? "");
  const [sku, setSku] = useState(item?.sku ?? initialSku ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item?.price?.toString() ?? "");
  const [sellingPrice, setSellingPrice] = useState(
    item?.sellingPrice?.toString() ?? "",
  );
  const [supplier, setSupplier] = useState(item?.supplier ?? "");
  const [stockQuantity, setStockQuantity] = useState(
    item?.stockQuantity?.toString() ?? "",
  );
  const [expiryDate, setExpiryDate] = useState(item?.expiryDate ?? "");
  const [gstRate, setGstRate] = useState<string>(() => {
    if (item) {
      try {
        const stored = localStorage.getItem(GST_RATES_KEY);
        if (stored) {
          const rates = JSON.parse(stored) as Record<string, number>;
          return String(rates[item.id.toString()] ?? 0);
        }
      } catch {
        /* ignore */
      }
    }
    return "0";
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    item?.imageId ? item.imageId.getDirectURL() : null,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!category.trim()) e.category = "Category is required";
    if (!sku.trim()) e.sku = "SKU is required";
    if (!price || Number.isNaN(Number(price)) || Number(price) < 0)
      e.price = "Valid purchase price required";
    if (
      !sellingPrice ||
      Number.isNaN(Number(sellingPrice)) ||
      Number(sellingPrice) < 0
    )
      e.sellingPrice = "Valid selling price required";
    if (!supplier.trim()) e.supplier = "Supplier is required";
    if (
      !stockQuantity ||
      Number.isNaN(Number(stockQuantity)) ||
      Number(stockQuantity) < 0
    )
      e.stockQuantity = "Valid stock quantity required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    await onSubmit({
      name: name.trim(),
      category: category.trim(),
      sku: sku.trim(),
      description: description.trim(),
      price: Number.parseFloat(price),
      sellingPrice: Number.parseFloat(sellingPrice),
      supplier: supplier.trim(),
      stockQuantity: BigInt(Math.floor(Number(stockQuantity))),
      imageFile,
      expiryDate: expiryDate.trim() || null,
    });
    // Save GST rate to localStorage after successful submit
    // We don't know the ID yet for new items, so we use sku as key
    if (item) {
      saveItemGstRate(item.id.toString(), Number(gstRate));
    } else {
      // Store pending gst rate keyed by sku
      try {
        const pending = JSON.parse(
          localStorage.getItem("sv_gst_pending") || "{}",
        );
        pending[sku.trim()] = Number(gstRate);
        localStorage.setItem("sv_gst_pending", JSON.stringify(pending));
      } catch {
        /* ignore */
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
      <DialogHeader>
        <DialogTitle className="font-display text-lg">
          {item ? "Edit Item" : "Add New Item"}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="item-name"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Name *
            </Label>
            <Input
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product name"
              className="bg-background border-border"
              data-ocid="item_form.name_input"
            />
            {errors.name && (
              <p
                className="text-xs text-destructive"
                data-ocid="item_form.name_error"
              >
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="item-category"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Category *
            </Label>
            <Input
              id="item-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Electronics"
              className="bg-background border-border"
              data-ocid="item_form.category_input"
            />
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="item-sku"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            SKU *
          </Label>
          <Input
            id="item-sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="e.g. EL-001-BLK"
            className="bg-background border-border font-mono text-sm"
            data-ocid="item_form.sku_input"
          />
          {errors.sku && (
            <p className="text-xs text-destructive">{errors.sku}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="item-desc"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            Description
          </Label>
          <Textarea
            id="item-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Item description"
            rows={2}
            className="bg-background border-border resize-none"
            data-ocid="item_form.description_textarea"
          />
        </div>

        {/* Price fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="item-price"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Purchase Price (₹) *
            </Label>
            <Input
              id="item-price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="bg-background border-border font-mono"
              data-ocid="item_form.price_input"
            />
            {errors.price && (
              <p className="text-xs text-destructive">{errors.price}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="item-selling-price"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Selling Price (₹) *
            </Label>
            <Input
              id="item-selling-price"
              type="number"
              min="0"
              step="0.01"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              placeholder="0.00"
              className="bg-background border-border font-mono"
              data-ocid="item_form.selling_price_input"
            />
            {errors.sellingPrice && (
              <p className="text-xs text-destructive">{errors.sellingPrice}</p>
            )}
          </div>
        </div>

        {/* GST Rate */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            GST Rate
          </Label>
          <Select value={gstRate} onValueChange={setGstRate}>
            <SelectTrigger
              className="bg-background border-border"
              data-ocid="item_form.gst_rate_select"
            >
              <SelectValue placeholder="Select GST Rate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0% (Exempt)</SelectItem>
              <SelectItem value="5">5% (Essential goods)</SelectItem>
              <SelectItem value="12">12% (Standard goods)</SelectItem>
              <SelectItem value="18">18% (Premium goods)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="item-stock"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Stock Qty *
            </Label>
            <Input
              id="item-stock"
              type="number"
              min="0"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              placeholder="0"
              className="bg-background border-border font-mono"
              data-ocid="item_form.stock_input"
            />
            {errors.stockQuantity && (
              <p className="text-xs text-destructive">{errors.stockQuantity}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="item-expiry"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1"
            >
              <CalendarDays className="w-3 h-3" />
              Expiry Date
            </Label>
            <Input
              id="item-expiry"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="bg-background border-border font-mono text-sm"
              data-ocid="item_form.expiry_date_input"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="item-supplier"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            Supplier *
          </Label>
          <Input
            id="item-supplier"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="Supplier name"
            className="bg-background border-border"
            data-ocid="item_form.supplier_input"
          />
          {errors.supplier && (
            <p className="text-xs text-destructive">{errors.supplier}</p>
          )}
        </div>

        {/* Image upload */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Image
          </Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="image-file-input"
          />
          {imagePreview ? (
            <div className="relative group w-full h-32 rounded-md overflow-hidden border border-border">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-24 rounded-md border border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
              data-ocid="item_form.image_upload_button"
            >
              <ImageIcon className="w-6 h-6" />
              <span className="text-xs">Click to upload image</span>
            </button>
          )}
          {imageFile && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs"
              data-ocid="item_form.upload_button"
            >
              <Upload className="w-3 h-3 mr-1.5" />
              Change image
            </Button>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isPending}
            data-ocid="item_form.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-ocid="item_form.submit_button"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
            {item ? "Save Changes" : "Add Item"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
