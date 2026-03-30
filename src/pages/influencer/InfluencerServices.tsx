import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const serviceCategories = [
  "Event Promotion", "Product Review", "Social Media Campaign",
  "Brand Ambassador", "Content Creation", "Live Streaming",
  "Photography", "Video Production",
];

const InfluencerServices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const [serviceTitle, setServiceTitle] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDeliveryDays, setServiceDeliveryDays] = useState("7");

  const handleAddService = async () => {
    if (!profile || !serviceTitle.trim()) { toast({ title: "Service title is required", variant: "destructive" }); return; }
    const { error } = await supabase.from("influencer_services").insert({ influencer_id: profile.id, title: serviceTitle.trim(), description: serviceDesc.trim(), category: serviceCategory, price: parseFloat(servicePrice) || 0, delivery_days: parseInt(serviceDeliveryDays) || 7 });
    if (error) { toast({ title: "Error adding service", variant: "destructive" }); return; }
    queryClient.invalidateQueries({ queryKey: ["my-influencer-services"] });
    setServiceTitle(""); setServiceDesc(""); setServiceCategory(""); setServicePrice(""); setServiceDeliveryDays("7");
    toast({ title: "Service added! 🎉" });
  };

  const handleDeleteService = async (id: string) => {
    await supabase.from("influencer_services").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["my-influencer-services"] });
    toast({ title: "Service removed" });
  };

  if (!profile) return <div className="text-center py-10"><p className="text-muted-foreground">Create your profile first before adding services.</p></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Services</h2>
      <div className="border rounded-xl p-5 space-y-4">
        <h3 className="text-lg font-bold">Add a Service</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1"><Label>Title</Label><Input value={serviceTitle} onChange={(e) => setServiceTitle(e.target.value)} placeholder="e.g. Instagram Story Promotion" /></div>
          <div className="space-y-1"><Label>Category</Label><select value={serviceCategory} onChange={(e) => setServiceCategory(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Select</option>{serviceCategories.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          <div className="space-y-1"><Label>Price ($)</Label><Input type="number" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} placeholder="100" /></div>
          <div className="space-y-1"><Label>Delivery (days)</Label><Input type="number" value={serviceDeliveryDays} onChange={(e) => setServiceDeliveryDays(e.target.value)} /></div>
        </div>
        <div className="space-y-1"><Label>Description</Label><Textarea value={serviceDesc} onChange={(e) => setServiceDesc(e.target.value)} placeholder="What exactly will you deliver?" rows={3} /></div>
        <Button variant="hero" className="rounded-full" onClick={handleAddService}><Plus className="h-4 w-4 mr-1" /> Add Service</Button>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-bold">Your Services</h3>
        {services?.length === 0 ? (
          <p className="text-muted-foreground text-sm">No services yet. Add one above!</p>
        ) : (
          services?.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-4 border rounded-xl">
              <div><p className="font-semibold text-sm">{s.title}</p><p className="text-xs text-muted-foreground">{s.category} · ${Number(s.price).toFixed(0)} · {s.delivery_days} days</p></div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteService(s.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InfluencerServices;
