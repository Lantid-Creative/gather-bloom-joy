import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Upload, X, Star, Clock, DollarSign, Package, CheckCircle2, XCircle, Send } from "lucide-react";
import EventbriteHeader from "@/components/EventbriteHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const serviceCategories = [
  "Event Promotion", "Product Review", "Social Media Campaign",
  "Brand Ambassador", "Content Creation", "Live Streaming",
  "Photography", "Video Production",
];

const regions = ["West Africa", "East Africa", "Southern Africa", "North Africa", "Central Africa"];

const InfluencerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-influencer-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("influencer_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: services } = useQuery({
    queryKey: ["my-influencer-services", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase
        .from("influencer_services")
        .select("*")
        .eq("influencer_id", profile!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["my-influencer-orders", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase
        .from("influencer_orders")
        .select("*")
        .eq("influencer_id", profile!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  // Profile form state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [instagramUrl, setInstagramUrl] = useState("");
  const [instagramFollowers, setInstagramFollowers] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [tiktokFollowers, setTiktokFollowers] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [twitterFollowers, setTwitterFollowers] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeSubscribers, setYoutubeSubscribers] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Service form
  const [serviceTitle, setServiceTitle] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDeliveryDays, setServiceDeliveryDays] = useState("7");

  // Load profile into form
  if (profile && !profileLoaded) {
    setDisplayName(profile.display_name || "");
    setBio(profile.bio || "");
    setCity(profile.city || "");
    setCountry(profile.country || "");
    setRegion(profile.region || "");
    setSelectedCategories(profile.categories || []);
    setInstagramUrl(profile.instagram_url || "");
    setInstagramFollowers(String(profile.instagram_followers || ""));
    setTiktokUrl(profile.tiktok_url || "");
    setTiktokFollowers(String(profile.tiktok_followers || ""));
    setTwitterUrl(profile.twitter_url || "");
    setTwitterFollowers(String(profile.twitter_followers || ""));
    setYoutubeUrl(profile.youtube_url || "");
    setYoutubeSubscribers(String(profile.youtube_subscribers || ""));
    setMinBudget(String(profile.min_budget || ""));
    setProfileLoaded(true);
  }

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSaveProfile = async () => {
    if (!user || !displayName.trim()) {
      toast({ title: "Display name is required", variant: "destructive" });
      return;
    }

    const profileData = {
      user_id: user.id,
      display_name: displayName.trim(),
      bio: bio.trim(),
      city: city.trim(),
      country: country.trim(),
      region,
      categories: selectedCategories,
      instagram_url: instagramUrl.trim(),
      instagram_followers: parseInt(instagramFollowers) || 0,
      tiktok_url: tiktokUrl.trim(),
      tiktok_followers: parseInt(tiktokFollowers) || 0,
      twitter_url: twitterUrl.trim(),
      twitter_followers: parseInt(twitterFollowers) || 0,
      youtube_url: youtubeUrl.trim(),
      youtube_subscribers: parseInt(youtubeSubscribers) || 0,
      min_budget: parseFloat(minBudget) || 0,
      updated_at: new Date().toISOString(),
    };

    if (profile) {
      const { error } = await supabase.from("influencer_profiles").update(profileData).eq("id", profile.id);
      if (error) { toast({ title: "Error saving", variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("influencer_profiles").insert(profileData);
      if (error) { toast({ title: "Error creating profile", variant: "destructive" }); return; }
    }

    queryClient.invalidateQueries({ queryKey: ["my-influencer-profile"] });
    toast({ title: "Profile saved! ✅" });
  };

  const handleUploadScreenshot = async (file: File) => {
    if (!user || !profile) return;
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("influencer-proofs").upload(path, file);
    if (error) { toast({ title: "Upload failed", variant: "destructive" }); return; }
    const { data: urlData } = supabase.storage.from("influencer-proofs").getPublicUrl(path);
    const newScreenshots = [...(profile.proof_screenshots || []), urlData.publicUrl];
    await supabase.from("influencer_profiles").update({ proof_screenshots: newScreenshots }).eq("id", profile.id);
    queryClient.invalidateQueries({ queryKey: ["my-influencer-profile"] });
    toast({ title: "Screenshot uploaded! 📸" });
  };

  const handleAddService = async () => {
    if (!profile || !serviceTitle.trim()) {
      toast({ title: "Service title is required", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("influencer_services").insert({
      influencer_id: profile.id,
      title: serviceTitle.trim(),
      description: serviceDesc.trim(),
      category: serviceCategory,
      price: parseFloat(servicePrice) || 0,
      delivery_days: parseInt(serviceDeliveryDays) || 7,
    });
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

  const handleSubmitDeliverable = async (orderId: string, note: string) => {
    await supabase.from("influencer_orders").update({
      influencer_submitted: true,
      deliverables_note: note,
      status: "delivered",
      updated_at: new Date().toISOString(),
    }).eq("id", orderId);
    queryClient.invalidateQueries({ queryKey: ["my-influencer-orders"] });
    toast({ title: "Deliverables submitted! 📦" });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <EventbriteHeader />
        <div className="container max-w-lg py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold">Sign in to manage your influencer profile</h1>
          <Button variant="hero" className="rounded-full" onClick={() => navigate("/auth")}>Sign in</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <EventbriteHeader />
      <div className="container max-w-3xl py-10">
        <h1 className="text-3xl font-bold mb-2">Influencer Dashboard</h1>
        <p className="text-muted-foreground mb-8">Manage your profile, services, and orders</p>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          {/* PROFILE TAB */}
          <TabsContent value="profile" className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Your Profile</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Display Name *</Label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your stage/brand name" />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Budget ($)</Label>
                  <Input type="number" value={minBudget} onChange={(e) => setMinBudget(e.target.value)} placeholder="50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell brands about yourself, your audience, and what you're great at..." rows={4} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Lagos" />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Nigeria" />
                </div>
                <div className="space-y-2">
                  <Label>Region</Label>
                  <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select region</option>
                    {regions.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Specialties</Label>
                <div className="flex flex-wrap gap-2">
                  {serviceCategories.map((cat) => (
                    <Badge
                      key={cat}
                      variant={selectedCategories.includes(cat) ? "default" : "outline"}
                      className="cursor-pointer rounded-full"
                      onClick={() => toggleCategory(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Social media */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Social Media</h2>
              {[
                { label: "Instagram", url: instagramUrl, setUrl: setInstagramUrl, followers: instagramFollowers, setFollowers: setInstagramFollowers },
                { label: "TikTok", url: tiktokUrl, setUrl: setTiktokUrl, followers: tiktokFollowers, setFollowers: setTiktokFollowers },
                { label: "Twitter/X", url: twitterUrl, setUrl: setTwitterUrl, followers: twitterFollowers, setFollowers: setTwitterFollowers },
                { label: "YouTube", url: youtubeUrl, setUrl: setYoutubeUrl, followers: youtubeSubscribers, setFollowers: setYoutubeSubscribers },
              ].map((s) => (
                <div key={s.label} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <Label>{s.label} Profile URL</Label>
                    <Input value={s.url} onChange={(e) => s.setUrl(e.target.value)} placeholder={`https://${s.label.toLowerCase()}.com/yourname`} />
                  </div>
                  <div className="space-y-1">
                    <Label>Followers</Label>
                    <Input type="number" value={s.followers} onChange={(e) => s.setFollowers(e.target.value)} placeholder="10000" />
                  </div>
                </div>
              ))}
            </div>

            {/* Proof screenshots */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold">Verification Screenshots</h2>
              <p className="text-sm text-muted-foreground">Upload screenshots of your social media analytics to verify your follower counts.</p>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadScreenshot(f); }} />
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-1" /> Upload Screenshot
              </Button>
              {profile?.proof_screenshots?.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {profile.proof_screenshots.map((url: string, i: number) => (
                    <div key={i} className="rounded-lg overflow-hidden border">
                      <img src={url} alt={`Proof ${i + 1}`} className="w-full h-24 object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button variant="hero" size="lg" className="w-full rounded-full" onClick={handleSaveProfile}>
              {profile ? "Save Profile" : "Create Profile"}
            </Button>
          </TabsContent>

          {/* SERVICES TAB */}
          <TabsContent value="services" className="space-y-6">
            {!profile ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Create your profile first before adding services.</p>
              </div>
            ) : (
              <>
                <div className="border rounded-xl p-5 space-y-4">
                  <h2 className="text-lg font-bold">Add a Service</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Title</Label>
                      <Input value={serviceTitle} onChange={(e) => setServiceTitle(e.target.value)} placeholder="e.g. Instagram Story Promotion" />
                    </div>
                    <div className="space-y-1">
                      <Label>Category</Label>
                      <select value={serviceCategory} onChange={(e) => setServiceCategory(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="">Select</option>
                        {serviceCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label>Price ($)</Label>
                      <Input type="number" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} placeholder="100" />
                    </div>
                    <div className="space-y-1">
                      <Label>Delivery (days)</Label>
                      <Input type="number" value={serviceDeliveryDays} onChange={(e) => setServiceDeliveryDays(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <Textarea value={serviceDesc} onChange={(e) => setServiceDesc(e.target.value)} placeholder="What exactly will you deliver?" rows={3} />
                  </div>
                  <Button variant="hero" className="rounded-full" onClick={handleAddService}>
                    <Plus className="h-4 w-4 mr-1" /> Add Service
                  </Button>
                </div>

                <div className="space-y-3">
                  <h2 className="text-lg font-bold">Your Services</h2>
                  {services?.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No services yet. Add one above!</p>
                  ) : (
                    services?.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-4 border rounded-xl">
                        <div>
                          <p className="font-semibold text-sm">{s.title}</p>
                          <p className="text-xs text-muted-foreground">{s.category} · ${Number(s.price).toFixed(0)} · {s.delivery_days} days</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteService(s.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* ORDERS TAB */}
          <TabsContent value="orders" className="space-y-4">
            <h2 className="text-lg font-bold">Incoming Orders</h2>
            {orders?.length === 0 ? (
              <p className="text-muted-foreground text-sm">No orders yet. Share your profile to start getting hired!</p>
            ) : (
              orders?.map((order) => (
                <div key={order.id} className="border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{order.title}</h3>
                    <div className="flex gap-2">
                      <Badge variant={
                        order.status === "completed" ? "default" :
                        order.status === "delivered" ? "secondary" :
                        order.status === "in_progress" ? "outline" : "secondary"
                      } className="rounded-full">{order.status}</Badge>
                      <Badge variant={order.escrow_status === "funded" ? "default" : "secondary"} className="rounded-full">
                        {order.escrow_status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> ${Number(order.amount).toFixed(0)}</span>
                    {order.deadline && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Due {format(new Date(order.deadline), "MMM d")}</span>}
                  </div>
                  {order.status === "in_progress" && !order.influencer_submitted && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Describe what you delivered, add links..."
                        id={`deliverable-${order.id}`}
                      />
                      <Button
                        size="sm"
                        variant="hero"
                        className="rounded-full"
                        onClick={() => {
                          const note = (document.getElementById(`deliverable-${order.id}`) as HTMLTextAreaElement)?.value || "";
                          handleSubmitDeliverable(order.id, note);
                        }}
                      >
                        <Send className="h-3.5 w-3.5 mr-1" /> Submit Deliverables
                      </Button>
                    </div>
                  )}
                  {order.influencer_submitted && order.status === "delivered" && (
                    <p className="text-sm text-primary flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Deliverables submitted — awaiting client approval</p>
                  )}
                  {order.status === "completed" && (
                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Completed & payment released</p>
                  )}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InfluencerDashboard;
