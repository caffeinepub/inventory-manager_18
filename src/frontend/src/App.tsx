import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Award, BarChart2, Download, Settings, Shield } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SplashScreen from "./components/SplashScreen";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { usePwaInstall } from "./hooks/use-pwa-install";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useRecordVisit,
  useUnreadMessageCount,
  useVisitCount,
} from "./hooks/useQueries";
import AdminPage from "./pages/AdminPage";
import CertificatePage from "./pages/CertificatePage";
import InventoryListPage from "./pages/InventoryListPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import LandingPage from "./pages/LandingPage";
import SettingsPage from "./pages/SettingsPage";

function NavAdminLink() {
  const { identity } = useInternetIdentity();
  const { t } = useLanguage();
  const isAuthenticated = !!identity;
  const { data: unreadCount } = useUnreadMessageCount(isAuthenticated);

  return (
    <Button variant="ghost" size="sm" asChild>
      <Link to="/admin" data-ocid="nav.admin_link" className="relative">
        <Shield className="w-3.5 h-3.5 mr-1.5" />
        {t("nav.admin")}
        {isAuthenticated && unreadCount != null && unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
        )}
      </Link>
    </Button>
  );
}

function LangToggle() {
  const { language, setLanguage } = useLanguage();
  return (
    <button
      type="button"
      onClick={() => setLanguage(language === "en" ? "hi" : "en")}
      className="flex items-center gap-0 rounded-full border border-border bg-muted/50 hover:bg-muted overflow-hidden text-xs font-semibold transition-colors"
      title="Switch language"
      data-ocid="nav.lang_toggle"
    >
      <span
        className={`px-2.5 py-1 transition-colors ${
          language === "en"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </span>
      <span
        className={`px-2.5 py-1 transition-colors ${
          language === "hi"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        हि
      </span>
    </button>
  );
}

function PlatformReachCounter() {
  const { data: count } = useVisitCount();

  return (
    <div
      className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-3"
      data-ocid="footer.platform_reach_section"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span className="text-green-600 font-semibold">Live</span>
      <BarChart2 className="w-3.5 h-3.5 text-primary" />
      <span className="font-medium text-foreground">Platform Reach:</span>
      <span className="font-bold text-primary">
        {count !== undefined ? count.toLocaleString() : 0}
      </span>
    </div>
  );
}

function AppVisitRecorder() {
  const recordVisit = useRecordVisit();
  const recorded = useRef(false);

  useEffect(() => {
    if (!recorded.current) {
      recorded.current = true;
      recordVisit.mutate();
    }
  }, [recordVisit.mutate]);

  return null;
}

function RootLayout() {
  const { isInstallable, promptInstall } = usePwaInstall();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppVisitRecorder />
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center group"
            data-ocid="nav.logo_link"
          >
            <img
              src="/assets/generated/stockvault-logo-transparent.dim_400x100.png"
              alt="StockVault"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <nav className="flex items-center gap-2">
            {isInstallable && (
              <Button
                variant="outline"
                size="sm"
                onClick={promptInstall}
                data-ocid="nav.install_button"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                {t("nav.download_app")}
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link to="/inventory" data-ocid="nav.inventory_link">
                {t("nav.browse")}
              </Link>
            </Button>
            <NavAdminLink />
            <LangToggle />
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <Link
                to="/settings"
                data-ocid="nav.settings_link"
                title={t("nav.settings")}
              >
                <Settings className="w-4 h-4" />
                <span className="sr-only">{t("nav.settings")}</span>
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border py-6 mt-auto">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <PlatformReachCounter />
          <p className="text-sm font-medium text-foreground tracking-wide mt-3">
            {t("footer.developed_by")}{" "}
            <span className="text-primary font-semibold">
              {t("footer.developer_name")}
            </span>
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {t("footer.trust_badge")}
          </p>
          <div className="mt-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              data-ocid="footer.certificate_button"
              className="border-yellow-500/50 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500 hover:text-yellow-800 gap-1.5 text-xs"
            >
              <Link to="/certificate">
                <Award className="w-3.5 h-3.5" />
                View Certificate
              </Link>
            </Button>
          </div>
        </div>
      </footer>

      <Toaster richColors position="top-right" />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inventory",
  component: InventoryListPage,
});

const itemDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/item/$id",
  component: ItemDetailPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

const certificateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/certificate",
  component: CertificatePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  inventoryRoute,
  itemDetailRoute,
  adminRoute,
  settingsRoute,
  certificateRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 2000);

    const hideTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Apply dark mode from localStorage on first render
  useEffect(() => {
    const dark = localStorage.getItem("stockvault_dark_mode");
    if (dark === "true") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <LanguageProvider>
      {showSplash && <SplashScreen fading={fadingOut} />}
      <RouterProvider router={router} />
    </LanguageProvider>
  );
}
