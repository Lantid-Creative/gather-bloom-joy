import { useState } from "react";
import { Building2, Globe, Briefcase, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PartnerProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["partner-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("partner_profiles").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({ company_name: "", website: "", industry: "", description: "" });
  const [editing, setEditing] = useState(false);

  if (profile && form.company_name === "" && !editing) {
    setForm({ company_name: profile.company_name, website: profile.website || "", industry: profile.industry || "", description: profile.description || "" });
  }

  const saveProfile = useMutation({
    mutationFn: async () => {
      if (profile) {
        const { error } = await supabase.from("partner_profiles").update({ ...form, updated_at: new Date().toISOString() }).eq("id", profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("partner_profiles").insert({ ...form, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["partner-profile"] }); setEditing(false); toast({ title: "Profile saved" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const showProfileForm = !profile || editing;

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Company Profile</h2>
      {showProfileForm ? (
        <div className="border rounded-xl p-6 space-y-5 max-w-lg">
          <h3 className="text-lg font-semibold">{profile ? "Edit" : "Create"} Company Profile</h3>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Company Name *</label><Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Acme Corp" /></div>
            <div><label className="text-sm font-medium mb-1 block">Website</label><div className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" /><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://example.com" /></div></div>
            <div><label className="text-sm font-medium mb-1 block">Industry</label><div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" /><Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="Technology, Finance, FMCG..." /></div></div>
            <div><label className="text-sm font-medium mb-1 block">About your company</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell organizers about your brand..." rows={4} /></div>
          </div>
          <div className="flex gap-3">
            <Button variant="hero" className="rounded-full" onClick={() => saveProfile.mutate()} disabled={!form.company_name || saveProfile.isPending}>
              {saveProfile.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {profile ? "Update Profile" : "Create Profile"}
            </Button>
            {profile && <Button variant="outline" className="rounded-full" onClick={() => setEditing(false)}>Cancel</Button>}
          </div>
        </div>
      ) : (
        <div className="border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Building2 className="h-6 w-6 text-primary" /></div>
              <div><h3 className="font-bold text-lg">{profile.company_name}</h3>{profile.industry && <p className="text-sm text-muted-foreground">{profile.industry}</p>}</div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => setEditing(true)}>Edit</Button>
          </div>
          {profile.website && <p className="text-sm"><Globe className="inline h-3.5 w-3.5 mr-1 text-muted-foreground" /><a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{profile.website}</a></p>}
          {profile.description && <p className="text-sm text-muted-foreground">{profile.description}</p>}
        </div>
      )}
    </div>
  );
};

export default PartnerProfile;
