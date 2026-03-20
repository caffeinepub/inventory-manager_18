import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Package, Shield, ShieldOff } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../context/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAllItems } from "../hooks/useQueries";

const STAFF_KEY = "sv_staff_list";

function getStaffList(): string[] {
  try {
    const stored = localStorage.getItem(STAFF_KEY);
    if (stored) return JSON.parse(stored) as string[];
  } catch {
    /* ignore */
  }
  return [];
}

export default function StaffLoginPage() {
  const { t } = useLanguage();
  const { identity, login, isLoggingIn, clear: logout } = useInternetIdentity();
  const { data: items, isLoading } = useAllItems();

  const principal = identity?.getPrincipal().toString();
  const staffList = getStaffList();
  const isStaff = principal ? staffList.includes(principal) : false;

  if (!identity) {
    return (
      <div className="container max-w-md mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-bold text-2xl text-foreground mb-2">
            {t("staff.title")}
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {t("staff.subtitle")}
          </p>
          <Button
            onClick={() => login()}
            disabled={isLoggingIn}
            className="w-full bg-primary text-primary-foreground"
            data-ocid="staff.sign_in_button"
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Shield className="w-4 h-4 mr-2" />
            )}
            {isLoggingIn ? "Signing in..." : t("staff.sign_in")}
          </Button>
          <Button variant="ghost" size="sm" asChild className="mt-3">
            <Link to="/">
              <ArrowLeft className="w-3.5 h-3.5 mr-2" />
              Back to Home
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="container max-w-md mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <ShieldOff className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="font-bold text-xl text-foreground mb-2">
            Not Authorized as Staff
          </h1>
          <p className="text-muted-foreground text-sm mb-2">
            {t("staff.not_staff")}
          </p>
          <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded mb-6 break-all">
            {principal}
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => logout()}
              className="flex-1"
            >
              Sign Out
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-foreground">
                {t("staff.dashboard_title")}
              </h1>
              <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                {principal}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-green-600 border-green-300 bg-green-50"
            >
              Staff Access
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
              data-ocid="staff.logout_button"
            >
              Sign Out
            </Button>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-xs text-amber-700">
          \u26a0\ufe0f <strong>Staff Mode:</strong> You can view and add items,
          but cannot delete or edit prices.
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">
              {t("staff.view_inventory")}
            </h2>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading inventory...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">
                      #
                    </th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">
                      Name
                    </th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase hidden sm:table-cell">
                      Category
                    </th>
                    <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase">
                      Stock
                    </th>
                    <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(items ?? []).map((item, idx) => (
                    <tr
                      key={item.id.toString()}
                      className="border-b border-border hover:bg-muted/20"
                      data-ocid={`staff.item.${idx + 1}`}
                    >
                      <td className="p-3 text-xs text-muted-foreground font-mono">
                        {idx + 1}
                      </td>
                      <td className="p-3 font-medium text-foreground">
                        {item.name}
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="p-3 text-right font-mono text-sm">
                        {item.stockQuantity.toString()}
                      </td>
                      <td className="p-3 text-right">
                        {Number(item.stockQuantity) > 0 ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">
                            In Stock
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">
                            Out
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
