/**
 * Extra admin tabs: Suppliers, Expenses, History Log, Staff Management, Sales Report, Bulk Upload
 * All data stored in localStorage since backend doesn't have these endpoints yet.
 */
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Clock,
  Download,
  FilePlus,
  Loader2,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  ShieldOff,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type { InventoryItem, Order } from "../backend";
import { useLanguage } from "../context/LanguageContext";
import { useCreateItem } from "../hooks/useQueries";

// ── LocalStorage Keys ────────────────────────────────────────────────────────────────────────
const SUPPLIERS_KEY = "sv_suppliers";
const EXPENSES_KEY = "sv_expenses";
const INV_LOG_KEY = "sv_inv_log";
const STAFF_KEY = "sv_staff_list";

// ── Interfaces ─────────────────────────────────────────────────────────────────────────────────

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  isActive: boolean;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  notes: string;
  createdAt: number;
}

interface InvLogEntry {
  id: string;
  itemName: string;
  action: "Created" | "Updated" | "Deleted";
  performedBy: string;
  timestamp: number;
}

// ── Helper functions ─────────────────────────────────────────────────────────────────────────────

function getSuppliers(): Supplier[] {
  try {
    const stored = localStorage.getItem(SUPPLIERS_KEY);
    if (stored) return JSON.parse(stored) as Supplier[];
  } catch {
    /* ignore */
  }
  return [
    {
      id: "s1",
      name: "TechSupply Co.",
      contactPerson: "Ramesh Kumar",
      phone: "+91 98765 43210",
      email: "ramesh@techsupply.in",
      address: "B-12, Industrial Area, Delhi",
      category: "Electronics",
      isActive: true,
    },
    {
      id: "s2",
      name: "Office Essentials Ltd.",
      contactPerson: "Priya Sharma",
      phone: "+91 87654 32109",
      email: "priya@officeessentials.in",
      address: "45, MG Road, Bangalore",
      category: "Stationery",
      isActive: true,
    },
    {
      id: "s3",
      name: "BulkGoods Warehouse",
      contactPerson: "Suresh Patel",
      phone: "+91 76543 21098",
      email: "suresh@bulkgoods.in",
      address: "Plot 7, GIDC, Ahmedabad",
      category: "General",
      isActive: true,
    },
  ];
}

function saveSuppliers(s: Supplier[]) {
  localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(s));
}

function getExpenses(): Expense[] {
  try {
    const stored = localStorage.getItem(EXPENSES_KEY);
    if (stored) return JSON.parse(stored) as Expense[];
  } catch {
    /* ignore */
  }
  return [];
}

function saveExpenses(e: Expense[]) {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(e));
}

function getInvLog(): InvLogEntry[] {
  try {
    const stored = localStorage.getItem(INV_LOG_KEY);
    if (stored) return JSON.parse(stored) as InvLogEntry[];
  } catch {
    /* ignore */
  }
  return [];
}

function getStaffList(): string[] {
  try {
    const stored = localStorage.getItem(STAFF_KEY);
    if (stored) return JSON.parse(stored) as string[];
  } catch {
    /* ignore */
  }
  return [];
}

function saveStaffList(list: string[]) {
  localStorage.setItem(STAFF_KEY, JSON.stringify(list));
}

export function addInvLogEntry(
  itemName: string,
  action: InvLogEntry["action"],
  performedBy: string,
) {
  try {
    const log = getInvLog();
    log.unshift({
      id: Date.now().toString(),
      itemName,
      action,
      performedBy,
      timestamp: Date.now(),
    });
    localStorage.setItem(INV_LOG_KEY, JSON.stringify(log.slice(0, 200)));
  } catch {
    /* ignore */
  }
}

function formatCurrency(v: number) {
  return `\u20b9${v.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

// ── 1. Suppliers Tab ───────────────────────────────────────────────────────────────────────

export function AdminSuppliersTab() {
  const { t } = useLanguage();
  const [suppliers, setSuppliers] = useState<Supplier[]>(getSuppliers);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    category: "",
  });

  const handleAdd = () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const newS: Supplier = {
      id: Date.now().toString(),
      ...form,
      isActive: true,
    };
    const updated = [...suppliers, newS];
    setSuppliers(updated);
    saveSuppliers(updated);
    setAddOpen(false);
    setForm({
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      category: "",
    });
    toast.success("Supplier added!");
  };

  const handleDelete = (id: string) => {
    const updated = suppliers.filter((s) => s.id !== id);
    setSuppliers(updated);
    saveSuppliers(updated);
    toast.success("Supplier removed.");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Supplier Management</h2>
        </div>
        <Button
          size="sm"
          onClick={() => setAddOpen(true)}
          className="bg-primary text-primary-foreground"
          data-ocid="admin.suppliers.add_button"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          {t("admin.supplier_add")}
        </Button>
      </div>

      {suppliers.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-lg"
          data-ocid="admin.suppliers.empty_state"
        >
          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No suppliers yet.</p>
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs uppercase">Name</TableHead>
                <TableHead className="text-xs uppercase hidden sm:table-cell">
                  Contact
                </TableHead>
                <TableHead className="text-xs uppercase hidden md:table-cell">
                  Phone
                </TableHead>
                <TableHead className="text-xs uppercase">Category</TableHead>
                <TableHead className="text-xs uppercase text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((s, idx) => (
                <TableRow
                  key={s.id}
                  className="border-border hover:bg-muted/20"
                  data-ocid={`admin.supplier.item.${idx + 1}`}
                >
                  <TableCell>
                    <p className="font-medium text-sm text-foreground">
                      {s.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.contactPerson}
                    </p>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {s.email}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {s.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {s.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(s.id)}
                      data-ocid={`admin.supplier.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          className="max-w-sm"
          data-ocid="admin.supplier.add.dialog"
        >
          <DialogHeader>
            <DialogTitle>Add Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {(
              [
                ["name", "Company Name *", "text"],
                ["contactPerson", "Contact Person", "text"],
                ["phone", "Phone", "tel"],
                ["email", "Email", "email"],
                ["address", "Address", "text"],
                ["category", "Category", "text"],
              ] as [keyof typeof form, string, string][]
            ).map(([field, label, type]) => (
              <div key={field}>
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <Input
                  type={type}
                  value={form[field]}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [field]: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid={`admin.supplier.${field}_input`}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setAddOpen(false)}
              data-ocid="admin.supplier.add.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              className="bg-primary text-primary-foreground"
              data-ocid="admin.supplier.add.submit_button"
            >
              Add Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── 2. Expense Tracker Tab ────────────────────────────────────────────────────────────────────

export function AdminExpensesTab({ orders }: { orders?: Order[] }) {
  const [expenses, setExpenses] = useState<Expense[]>(getExpenses);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Electricity",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const handleAdd = () => {
    if (!form.title.trim() || !form.amount) {
      toast.error("Fill all required fields.");
      return;
    }
    const newE: Expense = {
      id: Date.now().toString(),
      title: form.title,
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      notes: form.notes,
      createdAt: Date.now(),
    };
    const updated = [newE, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);
    setForm({
      title: "",
      amount: "",
      category: "Electricity",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    toast.success("Expense added!");
  };

  const handleDelete = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    saveExpenses(updated);
  };

  const now = new Date();
  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });
  const totalMonthExpenses = monthExpenses.reduce((s, e) => s + e.amount, 0);

  const totalSalesRevenue = (orders ?? []).reduce(
    (s, o) => s + o.totalPrice,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <p className="text-xs text-muted-foreground uppercase font-medium">
              This Month Expenses
            </p>
          </div>
          <p className="text-xl font-bold text-red-600">
            {formatCurrency(totalMonthExpenses)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <p className="text-xs text-muted-foreground uppercase font-medium">
              Total Revenue
            </p>
          </div>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(totalSalesRevenue)}
          </p>
        </div>
      </div>

      {/* Add Expense Form */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold text-sm text-foreground mb-3">
          Add New Expense
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label className="text-xs text-muted-foreground">Title *</Label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="e.g. Electricity Bill"
              className="mt-1"
              data-ocid="admin.expense.title_input"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              Amount (₹) *
            </Label>
            <Input
              type="number"
              value={form.amount}
              onChange={(e) =>
                setForm((p) => ({ ...p, amount: e.target.value }))
              }
              placeholder="0"
              className="mt-1"
              data-ocid="admin.expense.amount_input"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
            >
              <SelectTrigger
                className="mt-1"
                data-ocid="admin.expense.category_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Electricity",
                  "Rent",
                  "Salary",
                  "Supplies",
                  "Transport",
                  "Other",
                ].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Date</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              className="mt-1"
              data-ocid="admin.expense.date_input"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Input
              value={form.notes}
              onChange={(e) =>
                setForm((p) => ({ ...p, notes: e.target.value }))
              }
              placeholder="Optional notes"
              className="mt-1"
              data-ocid="admin.expense.notes_input"
            />
          </div>
        </div>
        <Button
          onClick={handleAdd}
          className="mt-3 bg-primary text-primary-foreground"
          size="sm"
          data-ocid="admin.expense.submit_button"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Expense
        </Button>
      </div>

      {/* Expense List */}
      {expenses.length > 0 && (
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs uppercase">Title</TableHead>
                <TableHead className="text-xs uppercase">Category</TableHead>
                <TableHead className="text-xs uppercase text-right">
                  Amount
                </TableHead>
                <TableHead className="text-xs uppercase hidden sm:table-cell">
                  Date
                </TableHead>
                <TableHead className="text-xs uppercase text-right">
                  Del
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e, idx) => (
                <TableRow
                  key={e.id}
                  className="border-border hover:bg-muted/20"
                  data-ocid={`admin.expense.item.${idx + 1}`}
                >
                  <TableCell className="font-medium text-sm text-foreground">
                    {e.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {e.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-red-600">
                    {formatCurrency(e.amount)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                    {e.date}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(e.id)}
                      data-ocid={`admin.expense.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {expenses.length === 0 && (
        <div
          className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg"
          data-ocid="admin.expenses.empty_state"
        >
          <p className="text-sm">No expenses recorded yet.</p>
        </div>
      )}
    </div>
  );
}

// ── 3. Inventory History Log Tab ─────────────────────────────────────────────────────────────────

export function AdminHistoryTab() {
  const log = getInvLog();

  const actionColors: Record<string, string> = {
    Created: "text-green-600 bg-green-50 border-green-200",
    Updated: "text-blue-600 bg-blue-50 border-blue-200",
    Deleted: "text-red-600 bg-red-50 border-red-200",
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Clock className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-foreground">Inventory History Log</h2>
      </div>
      {log.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-lg"
          data-ocid="admin.history.empty_state"
        >
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">
            No history yet. Actions will appear here after
            adding/editing/deleting items.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {log.map((entry, idx) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg"
              data-ocid={`admin.history.item.${idx + 1}`}
            >
              <div className="w-1.5 h-1.5 rounded-full mt-2.5 shrink-0 bg-primary" />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-foreground">
                    {entry.itemName}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] border ${actionColors[entry.action] ?? ""}`}
                  >
                    {entry.action}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  by{" "}
                  <span className="font-mono">
                    {entry.performedBy.slice(0, 10)}…
                  </span>
                  {" • "}
                  {new Date(entry.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 4. Staff Management Tab ───────────────────────────────────────────────────────────────────────

export function AdminStaffTab() {
  const [staffList, setStaffList] = useState<string[]>(getStaffList);
  const [newPrincipal, setNewPrincipal] = useState("");

  const handleAdd = () => {
    const p = newPrincipal.trim();
    if (!p) {
      toast.error("Enter a principal ID.");
      return;
    }
    if (staffList.includes(p)) {
      toast.info("Already in staff list.");
      return;
    }
    const updated = [...staffList, p];
    setStaffList(updated);
    saveStaffList(updated);
    setNewPrincipal("");
    toast.success("Staff member added!");
  };

  const handleRemove = (p: string) => {
    const updated = staffList.filter((s) => s !== p);
    setStaffList(updated);
    saveStaffList(updated);
    toast.success("Staff member removed.");
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Users className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-foreground">Staff Access Control</h2>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5 text-xs text-blue-700">
        ℹ️ Staff members can <strong>view and add</strong> items only. They
        cannot delete items or edit prices. Share the{" "}
        <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">
          /staff-login
        </code>{" "}
        link for staff access.
      </div>

      {/* Add staff */}
      <div className="flex gap-2 mb-5">
        <Input
          value={newPrincipal}
          onChange={(e) => setNewPrincipal(e.target.value)}
          placeholder="Paste staff principal ID..."
          className="flex-1 font-mono text-xs"
          data-ocid="admin.staff.principal_input"
        />
        <Button
          onClick={handleAdd}
          className="bg-primary text-primary-foreground shrink-0"
          size="sm"
          data-ocid="admin.staff.add_button"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Staff
        </Button>
      </div>

      {staffList.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg"
          data-ocid="admin.staff.empty_state"
        >
          <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No staff members added yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {staffList.map((p, idx) => (
            <div
              key={p}
              className="flex items-center justify-between gap-3 p-3 bg-card border border-border rounded-lg"
              data-ocid={`admin.staff.item.${idx + 1}`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span className="font-mono text-xs text-foreground truncate max-w-[250px]">
                  {p}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => handleRemove(p)}
                data-ocid={`admin.staff.delete_button.${idx + 1}`}
              >
                <ShieldOff className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 5. Daily Sales Report Tab ────────────────────────────────────────────────────────────────────

export function AdminSalesTab({ orders }: { orders?: Order[] }) {
  const allOrders = orders ?? [];

  // Group by date (last 7 days)
  const salesByDate = (() => {
    const map: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      map[key] = 0;
    }
    for (const o of allOrders) {
      const ms = Number(o.createdAt / 1_000_000n);
      const key = new Date(ms).toISOString().split("T")[0];
      if (key in map) map[key] += o.totalPrice;
    }
    return Object.entries(map).map(([date, revenue]) => ({
      date: date.slice(5), // MM-DD
      revenue: Math.round(revenue),
    }));
  })();

  // Top 5 best selling items
  const itemCounts: Record<string, { name: string; count: number }> = {};
  for (const o of allOrders) {
    const key = o.itemId.toString();
    if (!itemCounts[key]) itemCounts[key] = { name: o.itemName, count: 0 };
    itemCounts[key].count += Number(o.quantity);
  }
  const topItems = Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const totalRevenue = allOrders.reduce((s, o) => s + o.totalPrice, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-foreground">Daily Sales Report</h2>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
            Total Revenue
          </p>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
            Total Orders
          </p>
          <p className="text-2xl font-bold text-foreground">
            {allOrders.length}
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Revenue Last 7 Days
          {allOrders.length === 0 && (
            <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Sample Data
            </span>
          )}
        </h3>
        {(() => {
          const demoSalesData = [
            { date: "Mon", revenue: 4200 },
            { date: "Tue", revenue: 6800 },
            { date: "Wed", revenue: 5100 },
            { date: "Thu", revenue: 7400 },
            { date: "Fri", revenue: 9200 },
            { date: "Sat", revenue: 11500 },
            { date: "Sun", revenue: 8300 },
          ];
          const chartData =
            allOrders.length === 0 ? demoSalesData : salesByDate;
          return (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  formatter={(value: number) => [`₹${value}`, "Revenue"]}
                />
                <Bar
                  dataKey="revenue"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          );
        })()}
      </div>

      {/* Category Pie Chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">
          Category Distribution
          <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            Sample Data
          </span>
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Inventory spread across categories
        </p>
        {(() => {
          const categoryData = [
            { name: "Electronics", value: 35 },
            { name: "Clothing", value: 25 },
            { name: "Food", value: 20 },
            { name: "Tools", value: 12 },
            { name: "Other", value: 8 },
          ];
          const COLORS = [
            "#3b82f6",
            "#06b6d4",
            "#8b5cf6",
            "#f59e0b",
            "#10b981",
          ];
          return (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({
                    name,
                    percent,
                  }: { name: string; percent: number }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Share"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          );
        })()}
      </div>

      {/* Top sellers */}
      {topItems.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Top 5 Best-Selling Items
          </h3>
          <div className="space-y-2">
            {topItems.map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
                data-ocid={`admin.sales.top_item.${idx + 1}`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {item.count} sold
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 6. Bulk CSV Upload ──────────────────────────────────────────────────────────────────────────────────

export function BulkUploadDialog({
  open,
  onOpenChange,
}: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useLanguage();
  const createItem = useCreateItem();
  const [progress, setProgress] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const downloadTemplate = () => {
    const headers =
      "name,category,sku,description,price,sellingPrice,gstRate,stockQuantity,supplier,expiryDate";
    const sample =
      "Sony Alpha A7,Electronics,EL-001,Full frame mirrorless camera,45000,52000,18,10,TechSupply Co.,2026-12-31";
    const csv = [headers, sample].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stockvault-bulk-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setProgress("Parsing CSV...");

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((l) => l.trim());
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const rows = lines.slice(1);

      let success = 0;
      let errors = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
          .split(",")
          .map((v) => v.trim().replace(/^"|"$/g, ""));
        const obj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          obj[h] = row[idx] ?? "";
        });

        setProgress(`Processing item ${i + 1}/${rows.length}...`);

        try {
          await createItem.mutateAsync({
            name: obj.name || `Item ${i + 1}`,
            category: obj.category || "General",
            sku: obj.sku || `SKU-${Date.now()}-${i}`,
            description: obj.description || "",
            price: Number(obj.price) || 0,
            sellingPrice: Number(obj.sellingprice) || Number(obj.price) || 0,
            supplier: obj.supplier || "Unknown",
            stockQuantity: BigInt(Number(obj.stockquantity) || 0),
            imageFile: null,
            expiryDate: obj.expirydate || null,
          });
          success++;
        } catch {
          errors++;
        }

        // Small delay to avoid overwhelming the backend
        await new Promise((r) => setTimeout(r, 200));
      }

      setProgress(`Done! ${success} added, ${errors} failed.`);
      toast.success(`${success} items uploaded successfully!`);
    } catch {
      setProgress("Failed to parse CSV.");
      toast.error("CSV parse error.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" data-ocid="admin.bulk_upload.dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary" />
            {t("admin.bulk_upload_title")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
            Expected columns:{" "}
            <code className="font-mono">
              name, category, sku, description, price, sellingPrice, gstRate,
              stockQuantity, supplier, expiryDate
            </code>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadTemplate}
            className="w-full"
            data-ocid="admin.bulk_upload.template_button"
          >
            <Download className="w-3.5 h-3.5 mr-2" />
            {t("admin.bulk_download_template")}
          </Button>
          <div>
            <Label className="text-xs text-muted-foreground">
              Upload CSV File
            </Label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFile}
              disabled={isUploading}
              className="mt-1 block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-border file:text-xs file:bg-muted file:text-foreground hover:file:bg-muted/80 cursor-pointer"
              data-ocid="admin.bulk_upload.dropzone"
            />
          </div>
          {isUploading && (
            <div
              className="flex items-center gap-2 text-xs text-primary"
              data-ocid="admin.bulk_upload.loading_state"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {progress}
            </div>
          )}
          {!isUploading && progress && (
            <p
              className="text-xs text-green-600"
              data-ocid="admin.bulk_upload.success_state"
            >
              {progress}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            data-ocid="admin.bulk_upload.close_button"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
