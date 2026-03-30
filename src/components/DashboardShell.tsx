import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import QantidHeader from "@/components/QantidHeader";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  items: SidebarItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  backTo?: string;
}

const DashboardShell = ({
  title,
  subtitle,
  items,
  activeItem,
  onItemClick,
  headerActions,
  children,
  backTo = "/",
}: DashboardShellProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <QantidHeader />
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "sticky top-0 h-[calc(100vh-64px)] border-r bg-sidebar flex flex-col transition-all duration-300 ease-in-out shrink-0",
            collapsed ? "w-16" : "w-64"
          )}
        >
          {/* Sidebar Header */}
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

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
            {items.map((item) => {
              const isActive = activeItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onItemClick(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
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
                </button>
              );
            })}
          </nav>

          {/* Back link */}
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
          {/* Content Header */}
          {headerActions && (
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b px-6 py-3 flex items-center justify-between">
              <h1 className="text-lg font-bold">{title}</h1>
              <div className="flex items-center gap-2">{headerActions}</div>
            </div>
          )}
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;
