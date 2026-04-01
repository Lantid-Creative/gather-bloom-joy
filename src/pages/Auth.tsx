import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import QantidHeader from "@/components/QantidHeader";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, User, ArrowRight, Ticket, MapPin, Music, Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "signup" && !agreedTerms) {
      toast({ title: "Please agree to the Terms of Service", variant: "destructive" });
      setLoading(false);
      return;
    }

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setResetSent(true);
        toast({ title: "Reset link sent! Check your email." });
      } else if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({ title: "Welcome back! 🎉" });
        navigate("/");
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        toast({
          title: "Check your email ✉️",
          description: "We've sent a confirmation link. Please verify your email before signing in.",
        });
        setMode("login");
      }
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const floatingIcons = [
    { icon: Ticket, top: "12%", left: "15%", delay: "0s", size: "h-6 w-6" },
    { icon: MapPin, top: "25%", right: "20%", delay: "1s", size: "h-5 w-5" },
    { icon: Music, top: "55%", left: "10%", delay: "2s", size: "h-7 w-7" },
    { icon: Star, top: "70%", right: "15%", delay: "0.5s", size: "h-5 w-5" },
    { icon: Ticket, top: "85%", left: "25%", delay: "1.5s", size: "h-4 w-4" },
    { icon: Music, top: "40%", right: "10%", delay: "2.5s", size: "h-6 w-6" },
  ];

  if (mode === "forgot" && resetSent) {
    return (
      <div className="min-h-screen bg-background">
        <QantidHeader />
        <div className="container flex items-center justify-center py-20">
          <div className="w-full max-w-md space-y-6 text-center p-8 rounded-2xl border bg-card shadow-lg">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
            </p>
            <Button variant="outline" className="rounded-full" onClick={() => { setMode("login"); setResetSent(false); }}>
              Back to Sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <QantidHeader />
      <div className="container flex items-center justify-center py-8 md:py-16 px-4">
        <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-3xl overflow-hidden border shadow-2xl bg-card">

          {/* Left panel — decorative */}
          <div className="relative hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground overflow-hidden">
            {/* Floating icons */}
            {floatingIcons.map((item, i) => (
              <item.icon
                key={i}
                className={`absolute ${item.size} text-white/20 animate-pulse`}
                style={{
                  top: item.top,
                  left: item.left,
                  right: item.right,
                  animationDelay: item.delay,
                  animationDuration: "3s",
                }}
              />
            ))}

            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/5 border border-white/10" />

            <div className="relative z-10 space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Qantid</h2>
              <p className="text-white/70 text-sm">Africa's premier event platform</p>
            </div>

            <div className="relative z-10 space-y-6">
              <div className="space-y-4">
                {[
                  { label: "Discover Events", desc: "Find the best events across Africa" },
                  { label: "Secure Tickets", desc: "Book and manage your tickets easily" },
                  { label: "Connect", desc: "Join a vibrant community of event lovers" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold">{i + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{item.label}</p>
                      <p className="text-white/60 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-xs text-white/50">Trusted by 10,000+ event-goers across Africa</p>
            </div>
          </div>

          {/* Right panel — form */}
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <div className="space-y-1.5 mb-8">
              <h1 className="text-2xl font-bold tracking-tight">
                {mode === "login" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset password"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {mode === "login"
                  ? "Sign in to manage your tickets and events"
                  : mode === "signup"
                  ? "Join thousands discovering events across Africa"
                  : "Enter your email and we'll send you a reset link"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="pl-10 h-12 rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-colors"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="pl-10 h-12 rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-colors"
                  />
                </div>
              </div>
              {mode !== "forgot" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Password
                    </Label>
                    {mode === "login" && (
                      <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline font-medium">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="pl-10 h-12 rounded-xl border-border/50 bg-secondary/30 focus:bg-background transition-colors"
                    />
                  </div>
                </div>
              )}

              {mode === "signup" && (
                <div className="flex items-start gap-2 mt-2">
                  <Checkbox
                    id="terms"
                    checked={agreedTerms}
                    onCheckedChange={(v) => setAgreedTerms(v === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="terms" className="text-xs text-muted-foreground leading-snug cursor-pointer">
                    I agree to the{" "}
                    <a href="/terms" target="_blank" className="text-primary underline">Terms of Service</a>{" "}
                    and{" "}
                    <a href="/privacy" target="_blank" className="text-primary underline">Privacy Policy</a>
                  </label>
                </div>
              )}

              <Button
                variant="hero"
                size="lg"
                type="submit"
                className="w-full rounded-xl h-12 text-base font-semibold mt-2 group"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Please wait...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {mode === "login" ? "Log in" : mode === "signup" ? "Create account" : "Send reset link"}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-4 text-muted-foreground">
                  {mode === "forgot" ? "or" : mode === "login" ? "New to Qantid?" : "Already have an account?"}
                </span>
              </div>
            </div>

            <div className="mt-4 text-center">
              {mode === "forgot" ? (
                <Button variant="ghost" className="rounded-xl text-sm font-medium" onClick={() => setMode("login")}>
                  Back to sign in
                </Button>
              ) : mode === "login" ? (
                <Button variant="ghost" className="rounded-xl text-sm font-medium text-primary hover:text-primary" onClick={() => setMode("signup")}>
                  Create a free account
                </Button>
              ) : (
                <Button variant="ghost" className="rounded-xl text-sm font-medium text-primary hover:text-primary" onClick={() => setMode("login")}>
                  Log in instead
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
