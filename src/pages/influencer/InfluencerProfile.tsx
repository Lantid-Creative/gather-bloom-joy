import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const serviceCategories = [
  "Event Promotion", "Product Review", "Social Media Campaign",
  "Brand Ambassador", "Content Creation", "Live Streaming",
  "Photography", "Video Production",
];
const regions = ["West Africa", "East Africa", "Southern Africa", "North Africa", "Central Africa"];

const InfluencerProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile } = useQuery({
    queryKey: ["my-influencer-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("influencer_profiles").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

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

  const toggleCategory = (cat: string) => setSelectedCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);

  const handleSaveProfile = async () => {
    if (!user || !displayName.trim()) { toast({ title: "Display name is required", variant: "destructive" }); return; }
    const profileData = {
      user_id: user.id, display_name: displayName.trim(), bio: bio.trim(), city: city.trim(), country: country.trim(), region, categories: selectedCategories,
      instagram_url: instagramUrl.trim(), instagram_followers: parseInt(instagramFollowers) || 0,
      tiktok_url: tiktokUrl.trim(), tiktok_followers: parseInt(tiktokFollowers) || 0,
      twitter_url: twitterUrl.trim(), twitter_followers: parseInt(twitterFollowers) || 0,
      youtube_url: youtubeUrl.trim(), youtube_subscribers: parseInt(youtubeSubscribers) || 0,
      min_budget: parseFloat(minBudget) || 0, updated_at: new Date().toISOString(),
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

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold">Your Profile</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Display Name *</Label><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your stage/brand name" /></div>
        <div className="space-y-2"><Label>Minimum Budget ($)</Label><Input type="number" value={minBudget} onChange={(e) => setMinBudget(e.target.value)} placeholder="50" /></div>
      </div>
      <div className="space-y-2"><Label>Bio</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell brands about yourself..." rows={4} /></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2"><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Lagos" /></div>
        <div className="space-y-2"><Label>Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Nigeria" /></div>
        <div className="space-y-2"><Label>Region</Label><select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Select region</option>{regions.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
      </div>
      <div className="space-y-2">
        <Label>Specialties</Label>
        <div className="flex flex-wrap gap-2">{serviceCategories.map((cat) => (<Badge key={cat} variant={selectedCategories.includes(cat) ? "default" : "outline"} className="cursor-pointer rounded-full" onClick={() => toggleCategory(cat)}>{cat}</Badge>))}</div>
      </div>

      <h3 className="text-lg font-semibold pt-2">Social Media</h3>
      {[
        { label: "Instagram", url: instagramUrl, setUrl: setInstagramUrl, followers: instagramFollowers, setFollowers: setInstagramFollowers },
        { label: "TikTok", url: tiktokUrl, setUrl: setTiktokUrl, followers: tiktokFollowers, setFollowers: setTiktokFollowers },
        { label: "Twitter/X", url: twitterUrl, setUrl: setTwitterUrl, followers: twitterFollowers, setFollowers: setTwitterFollowers },
        { label: "YouTube", url: youtubeUrl, setUrl: setYoutubeUrl, followers: youtubeSubscribers, setFollowers: setYoutubeSubscribers },
      ].map((s) => (
        <div key={s.label} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1"><Label>{s.label} Profile URL</Label><Input value={s.url} onChange={(e) => s.setUrl(e.target.value)} placeholder={`https://${s.label.toLowerCase()}.com/yourname`} /></div>
          <div className="space-y-1"><Label>Followers</Label><Input type="number" value={s.followers} onChange={(e) => s.setFollowers(e.target.value)} placeholder="10000" /></div>
        </div>
      ))}

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Verification Screenshots</h3>
        <p className="text-sm text-muted-foreground">Upload screenshots of your social media analytics.</p>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadScreenshot(f); }} />
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4 mr-1" /> Upload Screenshot</Button>
        {profile?.proof_screenshots?.length > 0 && (
          <div className="grid grid-cols-3 gap-3">{profile.proof_screenshots.map((url: string, i: number) => (<div key={i} className="rounded-lg overflow-hidden border"><img src={url} alt={`Proof ${i + 1}`} className="w-full h-24 object-cover" /></div>))}</div>
        )}
      </div>

      <Button variant="hero" size="lg" className="w-full rounded-full" onClick={handleSaveProfile}>{profile ? "Save Profile" : "Create Profile"}</Button>
    </div>
  );
};

export default InfluencerProfile;
