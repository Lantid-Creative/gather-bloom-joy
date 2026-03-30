import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, Sparkles, Megaphone, Tag, LinkIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardShell from "@/components/DashboardShell";
import { format } from "date-fns";

const sidebarItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  { id: "events", label: "Events", icon: Calendar, path: "/dashboard/events" },
  { id: "ai-insights", label: "AI Insights", icon: Sparkles, path: "/dashboard/ai-insights" },
  { id: "promo-copy", label: "AI Promo Copy", icon: Megaphone, path: "/dashboard/promo-copy" },
  { id: "promo-codes", label: "Promo Codes", icon: Tag, path: "/dashboard/promo-codes" },
  { id: "tracking", label: "Tracking Links", icon: LinkIcon, path: "/dashboard/tracking" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { orders, orderItems, events } = useDashboardData();

  if (!user) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Sign in to view your dashboard</h1>
        <Button variant="hero" className="rounded-full" onClick={() => navigate("/auth")}>Sign in</Button>
      </div>
    </div>
  );

  const exportCSV = () => {
    if (!orders || !orderItems) return;
    const rows = [["Order ID", "Name", "Email", "Event", "Ticket", "Qty", "Price", "Date"]];
    orderItems.forEach((item) => {
      const order = orders.find((o) => o.id === item.order_id);
      rows.push([item.order_id.slice(0, 8), order?.customer_name ?? "", order?.customer_email ?? "", item.event_title, item.ticket_name, String(item.quantity), String(item.ticket_price), format(new Date(item.created_at), "yyyy-MM-dd")]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "qantid-sales.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const dynamicItems = sidebarItems.map((item) => {
    if (item.id === "events") return { ...item, badge: String(events?.length ?? 0) };
    return item;
  });

  return (
    <DashboardShell
      title="Organizer Dashboard"
      subtitle="Track sales & manage events"
      items={dynamicItems}
      basePath="/dashboard"
      backTo="/"
      headerActions={
        <Button variant="outline" size="sm" className="rounded-full" onClick={exportCSV}>
          <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
        </Button>
      }
    />
  );
};

export default Dashboard;
