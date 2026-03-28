import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const WaitlistButton = ({ eventId }: { eventId: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState(user?.email ?? "");
  const [loading, setLoading] = useState(false);

  const { data: onWaitlist } = useQuery({
    queryKey: ["waitlist", eventId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("waitlist_entries")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", user!.id)
        .maybeSingle();
      return !!data;
    },
  });

  const joinWaitlist = async () => {
    if (!user) {
      toast({ title: "Sign in to join the waitlist", variant: "destructive" });
      return;
    }
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("waitlist_entries").insert({
      event_id: eventId,
      user_id: user.id,
      email: email.trim(),
    });
    if (error) {
      toast({ title: "Already on the waitlist", variant: "destructive" });
    } else {
      toast({ title: "You're on the waitlist! 🎉", description: "We'll notify you when spots open up." });
    }
    setLoading(false);
  };

  if (onWaitlist) {
    return (
      <div className="border rounded-xl p-5 text-center space-y-2 bg-primary/5">
        <Bell className="h-6 w-6 text-primary mx-auto" />
        <p className="font-semibold text-sm">You're on the waitlist!</p>
        <p className="text-xs text-muted-foreground">We'll notify you when spots open up.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl p-5 space-y-3">
      <p className="font-semibold text-sm">Join the waitlist</p>
      <p className="text-xs text-muted-foreground">Get notified when tickets become available.</p>
      <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        type="email"
      />
      <Button variant="hero" className="w-full rounded-full" onClick={joinWaitlist} disabled={loading}>
        {loading ? "Joining..." : "Join Waitlist"}
      </Button>
    </div>
  );
};

export default WaitlistButton;
