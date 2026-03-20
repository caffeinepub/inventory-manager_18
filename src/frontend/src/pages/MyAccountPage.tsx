import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Gift,
  Heart,
  Package,
  ShoppingBag,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const LOYALTY_KEY = "stockvault_loyalty_points";
const WISHLIST_KEY = "stockvault_wishlist";

interface SavedOrder {
  orderId: string;
  itemName: string;
  quantity: number;
  totalPrice: number;
  date: string;
  status: string;
}

function getOrders(): SavedOrder[] {
  try {
    const stored = localStorage.getItem("stockvault_orders");
    if (stored) return JSON.parse(stored) as SavedOrder[];
  } catch {
    /* ignore */
  }
  return [];
}

function getWishlist(): string[] {
  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    if (stored) return JSON.parse(stored) as string[];
  } catch {
    /* ignore */
  }
  return [];
}

export default function MyAccountPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"orders" | "wishlist" | "loyalty">(
    "loyalty",
  );
  const loyaltyPoints = Number(localStorage.getItem(LOYALTY_KEY) || "0");
  const orders = getOrders();
  const wishlist = getWishlist();

  const tier =
    loyaltyPoints >= 500 ? "Gold" : loyaltyPoints >= 200 ? "Silver" : "Bronze";
  const tierColors: Record<string, string> = {
    Gold: "text-yellow-600 bg-yellow-50 border-yellow-200",
    Silver: "text-slate-500 bg-slate-50 border-slate-200",
    Bronze: "text-orange-600 bg-orange-50 border-orange-200",
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
          <Link to="/inventory" data-ocid="my_account.back_button">
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            Back to Inventory
          </Link>
        </Button>

        <div className="mb-6">
          <h1 className="font-bold text-2xl text-foreground">
            {t("my_account.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your loyalty points, orders and wishlist
          </p>
        </div>

        {/* Loyalty Card */}
        <div
          className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 mb-6"
          data-ocid="my_account.loyalty.card"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-80 mb-1">
                {t("my_account.loyalty_points")}
              </p>
              <p className="text-4xl font-bold">
                {loyaltyPoints.toLocaleString()}
              </p>
              <p className="text-sm opacity-80 mt-1">
                {t("my_account.points_earned")}
              </p>
            </div>
            <div
              className={`rounded-full border px-3 py-1 text-sm font-semibold ${tierColors[tier]}`}
            >
              {tier} Member
            </div>
          </div>
          <p className="text-xs opacity-70 mt-4">
            {t("my_account.discount_hint")}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-muted/40 rounded-lg p-1">
          {(["loyalty", "orders", "wishlist"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-md text-xs font-semibold transition-colors capitalize ${
                activeTab === tab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-ocid={`my_account.${tab}.tab`}
            >
              {tab === "loyalty"
                ? t("my_account.loyalty_points")
                : tab === "orders"
                  ? t("my_account.order_history")
                  : t("my_account.wishlist")}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "loyalty" && (
          <div className="space-y-4" data-ocid="my_account.loyalty.panel">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-foreground">
                  How to Earn Points
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-primary shrink-0" /> Earn 1
                  point for every ₹100 spent
                </li>
                <li className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-primary shrink-0" /> 100 points
                  = ₹10 discount on next order
                </li>
                <li className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-primary shrink-0" /> Gold Member
                  at 500+ points
                </li>
                <li className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-primary shrink-0" /> Silver
                  Member at 200–499 points
                </li>
              </ul>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-primary">
                  {loyaltyPoints}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Current Points
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {Math.floor(loyaltyPoints / 100)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Rewards Available
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {orders.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total Orders
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div data-ocid="my_account.orders.panel">
            {orders.length === 0 ? (
              <div
                className="text-center py-16 text-muted-foreground"
                data-ocid="my_account.orders.empty_state"
              >
                <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>{t("my_account.no_orders")}</p>
                <Button asChild className="mt-4" size="sm" variant="outline">
                  <Link to="/inventory">Browse Inventory</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order, idx) => (
                  <div
                    key={order.orderId}
                    className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
                    data-ocid={`my_account.order.item.${idx + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {order.itemName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {order.quantity} • {order.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold text-primary">
                        ₹{order.totalPrice}
                      </p>
                      <Badge variant="outline" className="text-[10px] mt-1">
                        {order.status || "Delivered"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "wishlist" && (
          <div data-ocid="my_account.wishlist.panel">
            {wishlist.length === 0 ? (
              <div
                className="text-center py-16 text-muted-foreground"
                data-ocid="my_account.wishlist.empty_state"
              >
                <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>{t("my_account.no_wishlist")}</p>
                <Button asChild className="mt-4" size="sm" variant="outline">
                  <Link to="/inventory">Browse Inventory</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {wishlist.map((itemId, idx) => (
                  <div
                    key={itemId}
                    className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
                    data-ocid={`my_account.wishlist.item.${idx + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                      <span className="text-sm font-medium text-foreground">
                        Item #{itemId}
                      </span>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      <Link to="/item/$id" params={{ id: itemId }}>
                        View Item
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
