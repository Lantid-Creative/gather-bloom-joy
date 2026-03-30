import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Globe, Briefcase, FileText, CheckCircle, XCircle, Clock, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardShell from "@/components/DashboardShell";

const sidebarItems = [
  { id: "profile", label: "Company Profile", icon: Building2, path: "/partner-dashboard" },
  { id: "requests", label: "My Sponsorships", icon: FileText, path: "/partner-dashboard/sponsorships" },
  { id: "browse", label: "Browse Events", icon: Search, path: "/partner-dashboard/browse" },
];

const PartnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Sign in to access Partner Dashboard</h1>
          <Button variant="hero" className="rounded-full" onClick={() => navigate("/auth")}>Sign in</Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell
      title="Partner Dashboard"
      subtitle="Sponsorships & company profile"
      items={sidebarItems}
      basePath="/partner-dashboard"
      backTo="/"
    />
  );
};

export default PartnerDashboard;
