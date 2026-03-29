import { useState } from "react";
import { Share2, Plus, Trash2, Loader2, Clock, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface Props {
  eventId: string;
  eventTitle: string;
}

const PLATFORMS = [
  { value: "twitter", label: "𝕏 (Twitter)", icon: "𝕏" },
  { value: "instagram", label: "Instagram", icon: "📸" },
  { value: "facebook", label: "Facebook", icon: "📘" },
  { value: "linkedin", label: "LinkedIn", icon: "💼" },
  { value: "whatsapp", label: "WhatsApp", icon: "💬" },
  { value: "tiktok", label: "TikTok", icon: "🎵" },
];

const SocialPostScheduler = ({ eventId, eventTitle }: Props) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({
    platform: "twitter",
    content: "",
    scheduled_at: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts } = useQuery({
    queryKey: ["scheduled-posts", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_posts")
        .select("*")
        .eq("event_id", eventId)
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const handleCreate = async () => {
    if (!form.content || !form.scheduled_at) {
      toast({ title: "Fill in all fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("scheduled_posts").insert({
        event_id: eventId,
        user_id: user!.id,
        platform: form.platform,
        content: form.content,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
      });
      if (error) throw error;
      toast({ title: "Post scheduled! 📅" });
      setShowForm(false);
      setForm({ platform: "twitter", content: "", scheduled_at: "" });
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts", eventId] });
    } catch (err: any) {
      toast({ title: "Failed to schedule", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (id: string) => {
    await supabase.from("scheduled_posts").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["scheduled-posts", eventId] });
    toast({ title: "Post deleted" });
  };

  const copyContent = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: "Copied to clipboard!" });
  };

  const getStatusBadge = (post: any) => {
    if (post.status === "posted") return <Badge className="bg-green-500/10 text-green-600 text-[10px]">Posted</Badge>;
    if (post.status === "failed") return <Badge className="bg-red-500/10 text-red-600 text-[10px]">Failed</Badge>;
    const scheduled = new Date(post.scheduled_at);
    if (scheduled < new Date()) return <Badge className="bg-yellow-500/10 text-yellow-600 text-[10px]">Ready to Post</Badge>;
    return <Badge className="bg-blue-500/10 text-blue-600 text-[10px]"><Clock className="h-2.5 w-2.5 mr-0.5" /> Scheduled</Badge>;
  };

  const getPlatformInfo = (platform: string) => PLATFORMS.find((p) => p.value === platform) || { icon: "📱", label: platform };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Social Media Scheduler</h3>
        </div>
        <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-3 w-3 mr-1" /> Schedule Post
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Schedule and organize your social media posts. Copy the content and post at the scheduled time, or use with the AI Promo Copy Generator for auto-generated content.
      </p>

      {showForm && (
        <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Platform</Label>
              <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.icon} {p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Schedule For</Label>
              <Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} className="h-8 text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Post Content</Label>
            <Textarea
              placeholder={`Write your ${getPlatformInfo(form.platform).label} post for "${eventTitle}"...`}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="text-sm min-h-[80px]"
            />
            <p className="text-[10px] text-muted-foreground mt-1">{form.content.length} characters</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="rounded-full text-xs" onClick={handleCreate} disabled={saving}>
              {saving ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Scheduling...</> : "Schedule Post"}
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full text-xs" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {posts && posts.length > 0 && (
        <div className="space-y-2">
          {posts.map((post) => {
            const platformInfo = getPlatformInfo(post.platform);
            return (
              <div key={post.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{platformInfo.icon}</span>
                    <span className="text-xs font-medium">{platformInfo.label}</span>
                    {getStatusBadge(post)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyContent(post.content, post.id)}>
                      {copied === post.id ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deletePost(post.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{post.content}</p>
                <p className="text-[10px] text-muted-foreground">
                  📅 {format(new Date(post.scheduled_at), "MMM d, yyyy 'at' HH:mm")}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SocialPostScheduler;
