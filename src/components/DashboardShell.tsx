import { Link, Outlet, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import QantidHeader from "@/components/QantidHeader";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: string;
}

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  items: SidebarItem[];
  basePath: string;
  headerActions?: React.ReactNode;
  backTo?: string;
}

const SidebarNav = ({
  items,
  basePath,
  collapsed,
  onNavigate,
}: {
  items: SidebarItem[];
  basePath: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) => {
  const location = useLocation();
  const isActive = (path: string) => {
    if (path === basePath) return location.pathname === basePath;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
      {items.map((item) => {
        const active = isActive(item.path);
        return (
          <Link
            key={item.id}
            to={item.path}
            onClick={onNavigate}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
              active
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
            {!collapsed && (
              <>
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[10px] font-semibold bg-primary/15 text-primary rounded-full px-1.5 py-0.5">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

const DashboardShell = ({
  title,
  subtitle,
  items,
  basePath,
  headerActions,
  backTo = "/",
}: DashboardShellProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Find active item label for mobile header
  const isActive = (path: string) => {
    if (path === basePath) return location.pathname === basePath;
    return location.pathname.startsWith(path);
  };
  const activeItem = items.find((i) => isActive(i.path));

  return (
    <div className="min-h-screen bg-background">
      <QantidHeader />
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "hidden md:flex sticky top-0 h-[calc(100vh-64px)] border-r bg-sidebar flex-col transition-all duration-300 ease-in-out shrink-0",
            collapsed ? "w-16" : "w-64"
          )}
        >
          <div className="p-4 border-b border-sidebar-border">
            {!collapsed && (
              <div className="mb-1">
                <h2 className="text-sm font-bold text-sidebar-foreground truncate">{title}</h2>
                {subtitle && (
                  <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
                )}
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          <SidebarNav items={items} basePath={basePath} collapsed={collapsed} />

          <div className="p-2 border-t border-sidebar-border">
            <Link
              to={backTo}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Back to Site</span>}
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-auto">
          {/* Mobile Dashboard Header */}
          <div className="md:hidden sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-2.5 flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <div className="p-4 border-b">
                  <h2 className="text-sm font-bold">{title}</h2>
                  {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                </div>
                <ScrollArea className="h-[calc(100vh-120px)]">
                  <SidebarNav items={items} basePath={basePath} collapsed={false} onNavigate={() => setMobileOpen(false)} />
                </ScrollArea>
                <div className="p-2 border-t">
                  <Link
                    to={backTo}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 shrink-0" />
                    <span>Back to Site</span>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{activeItem?.label || title}</p>
            </div>
            {headerActions && <div className="flex items-center gap-2 shrink-0">{headerActions}</div>}
          </div>

          {/* Desktop header actions */}
          {headerActions && (
            <div className="hidden md:flex sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b px-6 py-3 items-center justify-between">
              <h1 className="text-lg font-bold">{title}</h1>
              <div className="flex items-center gap-2">{headerActions}</div>
            </div>
          )}
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;
