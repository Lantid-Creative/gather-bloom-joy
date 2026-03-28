import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EventbriteHeader from "@/components/EventbriteHeader";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
        toast({ title: "Account created! Welcome to Afritickets 🎉" });
        navigate("/");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (mode === "forgot" && resetSent) {
    return (
      <div className="min-h-screen bg-background">
        <EventbriteHeader />
        <div className="container flex items-center justify-center py-20">
          <div className="w-full max-w-sm space-y-6 text-center">
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
      <EventbriteHeader />
      <div className="container flex items-center justify-center py-20">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">
              {mode === "login" ? "Welcome back" : mode === "signup" ? "Join Afritickets" : "Reset Password"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login"
                ? "Sign in to manage your tickets and events"
                : mode === "signup"
                ? "Discover and book the best events across Africa"
                : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            {mode !== "forgot" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "login" && (
                    <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
              </div>
            )}
            <Button variant="hero" size="lg" type="submit" className="w-full rounded-full" disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Log in" : mode === "signup" ? "Sign up" : "Send Reset Link"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "forgot" ? (
              <>
                Remember your password?{" "}
                <button onClick={() => setMode("login")} className="font-medium text-primary hover:underline">
                  Sign in
                </button>
              </>
            ) : mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button onClick={() => setMode("signup")} className="font-medium text-primary hover:underline">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => setMode("login")} className="font-medium text-primary hover:underline">
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
