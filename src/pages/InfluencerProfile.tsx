import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Star, Users, Instagram, Youtube, Twitter, ExternalLink, Calendar, DollarSign, Clock, Shield } from "lucide-react";
import QantidHeader from "@/components/QantidHeader";
import QantidFooter from "@/components/QantidFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

const formatFollowers = (n: number) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

const InfluencerProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: influencer, isLoading } = useQuery({
    queryKey: ["influencer", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencer_profiles")
        .select("*, influencer_services(*)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ["influencer-reviews", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencer_reviews")
        .select("*")
        .eq("influencer_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <QantidHeader />
        <div className="container max-w-4xl py-20">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-full bg-muted" />
              <div className="space-y-2"><div className="h-6 bg-muted rounded w-48" /><div className="h-4 bg-muted rounded w-32" /></div>
            </div>
            <div className="h-24 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="min-h-screen bg-background">
        <QantidHeader />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold">Influencer not found</h1>
          <Button variant="link" asChild className="mt-4"><Link to="/influencers">← Browse influencers</Link></Button>
        </div>
      </div>
    );
  }

  const services = ((influencer as unknown as Record<string, unknown>).influencer_services as Array<{ id: string; is_active: boolean; title: string; description: string; price: number; delivery_days: number; category: string }>) ?? [];
  const isOwner = user?.id === influencer.user_id;
  const socials = [
    { label: "Instagram", url: influencer.instagram_url, count: influencer.instagram_followers, icon: Instagram },
    { label: "YouTube", url: influencer.youtube_url, count: influencer.youtube_subscribers, icon: Youtube },
    { label: "Twitter/X", url: influencer.twitter_url, count: influencer.twitter_followers, icon: Twitter },
    { label: "TikTok", url: influencer.tiktok_url, count: influencer.tiktok_followers, icon: Users },
    { label: "Facebook", url: influencer.facebook_url, count: influencer.facebook_followers, icon: Users },
  ].filter((s) => s.url);

  return (
    <div className="min-h-screen bg-background">
      <QantidHeader />
      <div className="container max-w-4xl py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile header */}
            <div className="flex items-start gap-5">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                {influencer.avatar_url ? (
                  <img src={influencer.avatar_url} alt={influencer.display_name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-primary">{influencer.display_name[0]}</span>
                )}
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">{influencer.display_name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{influencer.city}{influencer.city && influencer.country ? ", " : ""}{influencer.country}</span>
                  {influencer.region && <Badge variant="secondary" className="rounded-full text-xs">{influencer.region}</Badge>}
                </div>
                <div className="flex items-center gap-3">
                  {influencer.avg_rating > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{Number(influencer.avg_rating).toFixed(1)}</span>
                      <span className="text-muted-foreground">({reviews?.length ?? 0} reviews)</span>
                    </div>
                  )}
                  <span className="text-sm text-muted-foreground">{influencer.total_jobs} jobs completed</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <h2 className="text-lg font-bold">About</h2>
              <p className="text-muted-foreground leading-relaxed">{influencer.bio || "No bio provided yet."}</p>
            </div>

            {/* Categories */}
            {influencer.categories?.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-lg font-bold">Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {influencer.categories.map((cat: string) => (
                    <Badge key={cat} variant="secondary" className="rounded-full">{cat}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Social media */}
            {socials.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold">Social Media</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <s.icon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{s.label}</p>
                        <p className="text-xs text-muted-foreground">{formatFollowers(s.count ?? 0)} followers</p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Proof screenshots */}
            {influencer.proof_screenshots?.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold">Verification Screenshots</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {influencer.proof_screenshots.map((url: string, i: number) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="rounded-lg overflow-hidden border hover:opacity-80 transition-opacity">
                      <img src={url} alt={`Proof ${i + 1}`} className="w-full h-32 object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {services.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold">Services</h2>
                <div className="space-y-3">
                  {services.filter((s) => s.is_active).map((service) => (
                    <div key={service.id} className="border rounded-xl p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{service.title}</h3>
                          <Badge variant="secondary" className="rounded-full text-xs mt-1">{service.category}</Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">${Number(service.price).toFixed(0)}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {service.delivery_days} days
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                      {!isOwner && (
                        <Button
                          size="sm"
                          variant="hero"
                          className="rounded-full mt-2"
                          onClick={() => navigate(`/hire/${influencer.id}?service=${service.id}`)}
                        >
                          Hire for This
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews && reviews.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold">Reviews</h2>
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} className={`h-4 w-4 ${n <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{format(new Date(review.created_at), "MMM d, yyyy")}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="sticky top-20 space-y-4">
              <div className="border rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-medium">Secure Escrow Payment</span>
                </div>
                <p className="text-xs text-muted-foreground">Your payment is held safely until the job is completed and approved.</p>

                {influencer.min_budget > 0 && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm">Starting from <strong>${Number(influencer.min_budget).toFixed(0)}</strong></span>
                  </div>
                )}

                {!isOwner && (
                  <Button
                    variant="hero"
                    className="w-full rounded-full"
                    onClick={() => navigate(`/hire/${influencer.id}`)}
                  >
                    Hire {influencer.display_name.split(" ")[0]}
                  </Button>
                )}

                {isOwner && (
                  <Button
                    variant="outline"
                    className="w-full rounded-full"
                    onClick={() => navigate("/influencer-dashboard")}
                  >
                    Manage Profile
                  </Button>
                )}
              </div>

              <div className="border rounded-xl p-5 space-y-2">
                <h3 className="font-semibold text-sm">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 rounded-lg bg-surface">
                    <p className="text-lg font-bold text-primary">{influencer.total_jobs}</p>
                    <p className="text-[10px] text-muted-foreground">Jobs Done</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-surface">
                    <p className="text-lg font-bold">{influencer.avg_rating > 0 ? Number(influencer.avg_rating).toFixed(1) : "New"}</p>
                    <p className="text-[10px] text-muted-foreground">Rating</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Member since {format(new Date(influencer.created_at), "MMM yyyy")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <QantidFooter />
    </div>
  );
};

export default InfluencerProfile;
