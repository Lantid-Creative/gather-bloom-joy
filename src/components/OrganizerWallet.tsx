import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Wallet, ArrowDownToLine, Clock, CheckCircle2, AlertCircle, Banknote } from "lucide-react";
import { format } from "date-fns";
import { getCurrencySymbol } from "@/lib/currencies";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  processed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  available: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

const OrganizerWallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bankForm, setBankForm] = useState({ bank_name: "", account_number: "", account_name: "", bank_code: "" });
  const [editingBank, setEditingBank] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    await supabase.rpc("release_pending_funds" as any);

    const [walletRes, txRes, wdRes] = await Promise.all([
      supabase.from("organizer_wallets").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("wallet_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("withdrawal_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);

    if (walletRes.data) {
      setWallet(walletRes.data);
      setBankForm({
        bank_name: walletRes.data.bank_name || "",
        account_number: walletRes.data.account_number || "",
        account_name: walletRes.data.account_name || "",
        bank_code: walletRes.data.bank_code || "",
      });
    }
    setTransactions(txRes.data || []);
    setWithdrawals(wdRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const currency = wallet?.currency || "NGN";
  const sym = getCurrencySymbol(currency);

  const handleUpdateBank = async () => {
    if (!wallet) return;
    const { error } = await supabase
      .from("organizer_wallets")
      .update(bankForm)
      .eq("id", wallet.id);
    if (error) { toast.error("Failed to update bank details"); return; }
    toast.success("Bank details updated");
    setEditingBank(false);
    fetchData();
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) { toast.error("Enter a valid amount"); return; }
    if (!wallet?.bank_name || !wallet?.account_number || !wallet?.bank_code) {
      toast.error("Please add your bank details first");
      setEditingBank(true);
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
    </Card>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2"><Wallet className="h-5 w-5" /> Wallet <Badge variant="outline" className="text-xs font-normal">{currency}</Badge></h2>

      {/* Balance cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <p className="text-sm text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Available</p>
          <p className="text-2xl font-bold text-green-600">{sym}{wallet.available_balance.toLocaleString()}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Pending (7-day hold)</p>
          <p className="text-2xl font-bold text-yellow-600">{sym}{wallet.pending_balance.toLocaleString()}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Total Earned</p>
          <p className="text-2xl font-bold">{sym}{wallet.total_earned.toLocaleString()}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Total Withdrawn</p>
          <p className="text-2xl font-bold">{sym}{wallet.total_withdrawn.toLocaleString()}</p>
        </Card>
      </div>

      {/* Fee info */}
      <Card className="p-4 bg-muted/50 border-dashed">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>A 10% platform fee is deducted from each sale. Funds become available 7 days after purchase. When your withdrawal is approved, funds are sent directly to your bank account.</span>
        </p>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Withdraw */}
        <Card className="p-5 space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><ArrowDownToLine className="h-4 w-4" /> Request Withdrawal</h3>
          <div className="space-y-2">
            <Label>Amount ({sym})</Label>
            <Input type="number" min="1" step="0.01" max={wallet.available_balance} value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0.00" />
            <p className="text-xs text-muted-foreground">Max: {sym}{wallet.available_balance.toLocaleString()}</p>
          </div>
          <Button onClick={handleWithdraw} disabled={submitting || !withdrawAmount} className="w-full">
            {submitting ? "Submitting…" : "Request Withdrawal"}
          </Button>
        </Card>

        {/* Bank details */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2"><Banknote className="h-4 w-4" /> Bank Details</h3>
            {!editingBank && <Button variant="outline" size="sm" onClick={() => setEditingBank(true)}>Edit</Button>}
          </div>
          {editingBank ? (
            <div className="space-y-3">
              <div><Label>Bank Name</Label><Input value={bankForm.bank_name} onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })} placeholder="e.g. GTBank" /></div>
              <div><Label>Account Name</Label><Input value={bankForm.account_name} onChange={(e) => setBankForm({ ...bankForm, account_name: e.target.value })} placeholder="Full name on account" /></div>
              <div><Label>Account Number</Label><Input value={bankForm.account_number} onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })} placeholder="10-digit number" /></div>
              <div><Label>Bank Code</Label><Input value={bankForm.bank_code} onChange={(e) => setBankForm({ ...bankForm, bank_code: e.target.value })} placeholder="e.g. 058" /></div>
              <p className="text-xs text-muted-foreground">Your bank code is used for automatic transfers. Common: GTBank (058), Access (044), First Bank (011), UBA (033), Zenith (057).</p>
              <div className="flex gap-2">
                <Button onClick={handleUpdateBank} className="flex-1">Save</Button>
                <Button variant="outline" onClick={() => setEditingBank(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-1 text-sm">
              <p><span className="text-muted-foreground">Bank:</span> {wallet.bank_name || "—"}</p>
              <p><span className="text-muted-foreground">Name:</span> {wallet.account_name || "—"}</p>
              <p><span className="text-muted-foreground">Account:</span> {wallet.account_number ? `****${wallet.account_number.slice(-4)}` : "—"}</p>
              <p><span className="text-muted-foreground">Bank Code:</span> {wallet.bank_code || "—"}</p>
              {(!wallet.bank_name || !wallet.bank_code) && <p className="text-orange-500 text-xs mt-2">⚠️ Add bank details before requesting withdrawals</p>}
            </div>
          )}
        </Card>
      </div>

      {/* Withdrawal history */}
      {withdrawals.length > 0 && (
        <Card className="p-5 space-y-3">
          <h3 className="font-semibold">Withdrawal History</h3>
          <div className="space-y-2">
            {withdrawals.map((w) => {
              const wSym = getCurrencySymbol(w.currency || currency);
              return (
                <div key={w.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{wSym}{w.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(w.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
                    {w.admin_note && <p className="text-xs text-muted-foreground mt-1">Note: {w.admin_note}</p>}
                  </div>
                  <Badge className={statusColors[w.status] || ""}>{w.status}</Badge>
                </div>
              );
            })}
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
            {transactions.map((tx) => {
              const txSym = getCurrencySymbol(tx.currency || currency);
              return (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(tx.created_at), "MMM d, yyyy")} · Fee: {txSym}{tx.fee_amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">+{txSym}{tx.net_amount.toLocaleString()}</p>
                    <Badge className={statusColors[tx.status] || ""} variant="outline">{tx.status}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default OrganizerWallet;
