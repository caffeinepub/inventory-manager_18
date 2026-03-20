import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, Mail, MapPin, Phone, Users } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../context/LanguageContext";

const SUPPLIERS_KEY = "sv_suppliers";

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  isActive: boolean;
}

export function getSuppliers(): Supplier[] {
  try {
    const stored = localStorage.getItem(SUPPLIERS_KEY);
    if (stored) return JSON.parse(stored) as Supplier[];
  } catch {
    // ignore
  }
  // Default suppliers
  return [
    {
      id: "s1",
      name: "TechSupply Co.",
      contactPerson: "Ramesh Kumar",
      phone: "+91 98765 43210",
      email: "ramesh@techsupply.in",
      address: "B-12, Industrial Area, Delhi, 110001",
      category: "Electronics",
      isActive: true,
    },
    {
      id: "s2",
      name: "Office Essentials Ltd.",
      contactPerson: "Priya Sharma",
      phone: "+91 87654 32109",
      email: "priya@officeessentials.in",
      address: "45, MG Road, Bangalore, 560001",
      category: "Stationery & Office",
      isActive: true,
    },
    {
      id: "s3",
      name: "BulkGoods Warehouse",
      contactPerson: "Suresh Patel",
      phone: "+91 76543 21098",
      email: "suresh@bulkgoods.in",
      address: "Plot 7, GIDC, Ahmedabad, 380015",
      category: "General Merchandise",
      isActive: true,
    },
    {
      id: "s4",
      name: "FastParts Distribution",
      contactPerson: "Anita Singh",
      phone: "+91 65432 10987",
      email: "anita@fastparts.in",
      address: "123, Auto Nagar, Hyderabad, 500018",
      category: "Hardware & Tools",
      isActive: true,
    },
  ];
}

export function saveSuppliers(suppliers: Supplier[]) {
  localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers));
}

export default function SuppliersPage() {
  const { t } = useLanguage();
  const suppliers = getSuppliers().filter((s) => s.isActive);

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
          <Link to="/inventory" data-ocid="suppliers.back_button">
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            {t("item_detail.back_to_inventory")}
          </Link>
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-foreground">
                {t("suppliers.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("suppliers.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {suppliers.length === 0 ? (
          <div
            className="text-center py-20 text-muted-foreground"
            data-ocid="suppliers.empty_state"
          >
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{t("suppliers.no_suppliers")}</p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
            data-ocid="suppliers.list"
          >
            {suppliers.map((supplier, idx) => (
              <motion.div
                key={supplier.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
                data-ocid={`suppliers.item.${idx + 1}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {supplier.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {supplier.contactPerson}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs border-primary/30 text-primary shrink-0"
                  >
                    {supplier.category}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <a
                    href={`tel:${supplier.phone}`}
                    className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                    {supplier.phone}
                  </a>
                  <a
                    href={`mailto:${supplier.email}`}
                    className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                    {supplier.email}
                  </a>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    {supplier.address}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="flex-1 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground text-xs"
                    data-ocid={`suppliers.contact_button.${idx + 1}`}
                  >
                    <a
                      href={`https://wa.me/${supplier.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Contact via WhatsApp
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                  >
                    <a href={`mailto:${supplier.email}`}>Send Email</a>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
