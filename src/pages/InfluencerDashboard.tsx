import { useNavigate } from "react-router-dom";
import { User, Package, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardShell from "@/components/DashboardShell";

const sidebarItems = [
  { id: "profile", label: "Profile", icon: User, path: "/influencer-dashboard" },
  { id: "services", label: "Services", icon: Package, path: "/influencer-dashboard/services" },
  { id: "orders", label: "Orders", icon: ShoppingBag, path: "/influencer-dashboard/orders" },
];

const InfluencerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["my-influencer-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("influencer_profiles").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: services } = useQuery({
    queryKey: ["my-influencer-services", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase.from("influencer_services").select("*").eq("influencer_id", profile!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["my-influencer-orders", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase.from("influencer_orders").select("*").eq("influencer_id", profile!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Sign in to manage your influencer profile</h1>
          <Button variant="hero" className="rounded-full" onClick={() => navigate("/auth")}>Sign in</Button>
        </div>
      </div>
    );
  }

  const dynamicItems = sidebarItems.map((item) => {
    if (item.id === "orders" && orders) return { ...item, badge: String(orders.length) };
    if (item.id === "services" && services) return { ...item, badge: String(services.length) };
    return item;
  });

  return (
    <DashboardShell
      title="Influencer Dashboard"
      subtitle="Profile, services & orders"
      items={dynamicItems}
      basePath="/influencer-dashboard"
      backTo="/"
    />
  );
};

export default InfluencerDashboard;
