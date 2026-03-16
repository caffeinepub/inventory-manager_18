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
import { Download, Settings, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import SplashScreen from "./components/SplashScreen";
import { usePwaInstall } from "./hooks/use-pwa-install";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useUnreadMessageCount } from "./hooks/useQueries";
import AdminPage from "./pages/AdminPage";
import InventoryListPage from "./pages/InventoryListPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import LandingPage from "./pages/LandingPage";
import SettingsPage from "./pages/SettingsPage";

function NavAdminLink() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: unreadCount } = useUnreadMessageCount(isAuthenticated);

  return (
    <Button variant="ghost" size="sm" asChild>
      <Link to="/admin" data-ocid="nav.admin_link" className="relative">
        <Shield className="w-3.5 h-3.5 mr-1.5" />
        Admin
        {isAuthenticated && unreadCount != null && unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
        )}
      </Link>
    </Button>
  );
}

function RootLayout() {
  const { isInstallable, promptInstall } = usePwaInstall();

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
                Download App
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link to="/inventory" data-ocid="nav.inventory_link">
                Browse
              </Link>
            </Button>
            <NavAdminLink />
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <Link
                to="/settings"
                data-ocid="nav.settings_link"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
                <span className="sr-only">Settings</span>
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
          <p className="text-sm font-medium text-foreground tracking-wide">
            Developed by{" "}
            <span className="text-primary font-semibold">Ayush Rai</span>
            <span className="mx-2 text-muted-foreground">|</span>
            <span className="text-muted-foreground">
              BBA Student at BBS Group of Institutions
            </span>
          </p>
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

const routeTree = rootRoute.addChildren([
  indexRoute,
  inventoryRoute,
  itemDetailRoute,
  adminRoute,
  settingsRoute,
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

  return (
    <>
      {showSplash && <SplashScreen fading={fadingOut} />}
      <RouterProvider router={router} />
    </>
  );
}
