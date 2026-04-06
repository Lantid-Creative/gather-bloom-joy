import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Wallet, ArrowDownToLine, Clock, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useSearchParams } from "react-router-dom";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  processed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  available: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

const OrganizerWallet = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<{ connected: boolean; onboarding_complete: boolean } | null>(null);
  const [connectingStripe, setConnectingStripe] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    await supabase.rpc("release_pending_funds" as any);

    const [walletRes, txRes, wdRes] = await Promise.all([
      supabase.from("organizer_wallets").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("wallet_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("withdrawal_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);

    if (walletRes.data) setWallet(walletRes.data);
    setTransactions(txRes.data || []);
    setWithdrawals(wdRes.data || []);
    setLoading(false);
  };

  const checkStripeStatus = async () => {
    const { data, error } = await supabase.functions.invoke("stripe-connect", {
      body: { action: "check-status" },
    });
    if (!error && data) {
      setStripeStatus(data);
    }
  };

  useEffect(() => {
    fetchData();
    checkStripeStatus();
  }, [user]);

  // Handle return from Stripe onboarding
  useEffect(() => {
    if (searchParams.get("onboarding") === "complete") {
      checkStripeStatus();
      toast.success("Stripe Connect setup complete! Checking status...");
    }
  }, [searchParams]);

  const handleConnectStripe = async () => {
    setConnectingStripe(true);
    const { data, error } = await supabase.functions.invoke("stripe-connect", {
      body: { action: "onboard" },
    });
    setConnectingStripe(false);
    if (error || !data?.url) {
      toast.error("Failed to start Stripe Connect setup");
      return;
    }
    window.location.href = data.url;
  };

  const handleStripeDashboard = async () => {
    const { data, error } = await supabase.functions.invoke("stripe-connect", {
      body: { action: "dashboard" },
    });
    if (error || !data?.url) {
      toast.error("Failed to open Stripe dashboard");
      return;
    }
    window.open(data.url, "_blank");
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) { toast.error("Enter a valid amount"); return; }
    if (!stripeStatus?.onboarding_complete) {
      toast.error("Please complete Stripe Connect setup first");
      return;
    }
    if (amount > (wallet?.available_balance || 0)) { toast.error("Insufficient balance"); return; }

    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("process-withdrawal", {
      body: { action: "request", amount },
    });
    setSubmitting(false);

    if (error || !data?.success) {
      toast.error(data?.error || "Withdrawal failed");
      return;
    }
    toast.success("Withdrawal request submitted!");
    setWithdrawAmount("");
    fetchData();
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-32 bg-muted rounded-xl" /><div className="h-48 bg-muted rounded-xl" /></div>;

  if (!wallet) return (
    <Card className="p-6 text-center space-y-3">
      <Wallet className="h-10 w-10 text-muted-foreground mx-auto" />
      <p className="text-muted-foreground">No wallet yet. Your wallet will be created automatically when you receive your first sale.</p>
      <p className="text-sm text-muted-foreground">Or connect your Stripe account now to get ready:</p>
      <Button onClick={handleConnectStripe} disabled={connectingStripe}>
        {connectingStripe ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ExternalLink className="h-4 w-4 mr-2" />}
        Connect with Stripe
      </Button>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2"><Wallet className="h-5 w-5" /> Wallet</h2>

      {/* Stripe Connect status */}
      <Card className={`p-4 border-2 ${stripeStatus?.onboarding_complete ? "border-green-500/30 bg-green-50/50 dark:bg-green-950/20" : "border-orange-500/30 bg-orange-50/50 dark:bg-orange-950/20"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {stripeStatus?.onboarding_complete ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-600" />
            )}
            <div>
              <p className="font-medium">
                {stripeStatus?.onboarding_complete ? "Stripe Connected ✓" : "Stripe Connect Required"}
              </p>
              <p className="text-sm text-muted-foreground">
                {stripeStatus?.onboarding_complete
                  ? "Your account is set up to receive automatic payouts."
                  : "Connect your Stripe account to receive automatic payouts when withdrawals are approved."}
              </p>
            </div>
          </div>
          {stripeStatus?.onboarding_complete ? (
            <Button variant="outline" size="sm" onClick={handleStripeDashboard}>
              <ExternalLink className="h-3.5 w-3.5 mr-1" /> Stripe Dashboard
            </Button>
          ) : (
            <Button onClick={handleConnectStripe} disabled={connectingStripe} size="sm">
              {connectingStripe ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5 mr-1" />}
              {stripeStatus?.connected ? "Complete Setup" : "Connect Stripe"}
            </Button>
          )}
        </div>
      </Card>

      {/* Balance cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <p className="text-sm text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Available</p>
          <p className="text-2xl font-bold text-green-600">${wallet.available_balance.toFixed(2)}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Pending (7-day hold)</p>
          <p className="text-2xl font-bold text-yellow-600">${wallet.pending_balance.toFixed(2)}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Total Earned</p>
          <p className="text-2xl font-bold">${wallet.total_earned.toFixed(2)}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Total Withdrawn</p>
          <p className="text-2xl font-bold">${wallet.total_withdrawn.toFixed(2)}</p>
        </Card>
      </div>

      {/* Fee info */}
      <Card className="p-4 bg-muted/50 border-dashed">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>A 10% platform fee is deducted from each sale. Funds become available 7 days after purchase. When your withdrawal is approved, Stripe sends money directly to your connected account.</span>
        </p>
      </Card>

      {/* Withdraw */}
      <Card className="p-5 space-y-4">
        <h3 className="font-semibold flex items-center gap-2"><ArrowDownToLine className="h-4 w-4" /> Request Withdrawal</h3>
        {!stripeStatus?.onboarding_complete ? (
          <p className="text-sm text-muted-foreground">Connect your Stripe account above to enable withdrawals.</p>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Amount ($)</Label>
              <Input type="number" min="1" step="0.01" max={wallet.available_balance} value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0.00" />
              <p className="text-xs text-muted-foreground">Max: ${wallet.available_balance.toFixed(2)}</p>
            </div>
            <Button onClick={handleWithdraw} disabled={submitting || !withdrawAmount} className="w-full">
              {submitting ? "Submitting…" : "Request Withdrawal"}
            </Button>
          </>
        )}
      </Card>

      {/* Withdrawal history */}
      {withdrawals.length > 0 && (
        <Card className="p-5 space-y-3">
          <h3 className="font-semibold">Withdrawal History</h3>
          <div className="space-y-2">
            {withdrawals.map((w) => (
              <div key={w.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium">${w.amount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(w.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
                  {w.admin_note && <p className="text-xs text-muted-foreground mt-1">Note: {w.admin_note}</p>}
                </div>
                <Badge className={statusColors[w.status] || ""}>{w.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Transaction history */}
      <Card className="p-5 space-y-3">
        <h3 className="font-semibold">Transaction History</h3>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(tx.created_at), "MMM d, yyyy")} · Fee: ${tx.fee_amount.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">+${tx.net_amount.toFixed(2)}</p>
                  <Badge className={statusColors[tx.status] || ""} variant="outline">{tx.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default OrganizerWallet;
