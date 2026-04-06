import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Send } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  processed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .order("created_at", { ascending: false });
    setWithdrawals(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleAction = async (id: string, action: "approve" | "reject" | "mark-processed") => {
    setProcessing(id);
    const { data, error } = await supabase.functions.invoke("process-withdrawal", {
      body: { action, withdrawalId: id, adminNote: notes[id] || "" },
    });
    setProcessing(null);
    if (error || !data?.success) {
      toast.error(data?.error || "Action failed");
      return;
    }
    toast.success(`Withdrawal ${action === "mark-processed" ? "marked as processed" : action + "d"}`);
    fetch();
  };

  if (loading) return <div className="animate-pulse h-48 bg-muted rounded-xl" />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Withdrawal Requests</h2>
      {withdrawals.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">No withdrawal requests yet.</Card>
      ) : (
        <div className="space-y-3">
          {withdrawals.map((w) => (
            <Card key={w.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-lg">${w.amount.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(w.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="text-muted-foreground">Bank:</span> {w.bank_name} · {w.account_name} · ****{w.account_number?.slice(-4)}
                  </p>
                  {w.bank_code && <p className="text-xs text-muted-foreground">Code: {w.bank_code}</p>}
                  <p className="text-xs text-muted-foreground">User: {w.user_id.slice(0, 8)}</p>
                </div>
                <Badge className={statusColors[w.status] || ""}>{w.status}</Badge>
              </div>

              {w.status === "pending" && (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Admin note (optional)"
                    value={notes[w.id] || ""}
                    onChange={(e) => setNotes({ ...notes, [w.id]: e.target.value })}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAction(w.id, "approve")}
                    disabled={processing === w.id}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleAction(w.id, "reject")}
                    disabled={processing === w.id}
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>
              )}

              {w.status === "approved" && (
                <Button
                  size="sm"
                  onClick={() => handleAction(w.id, "mark-processed")}
                  disabled={processing === w.id}
                >
                  <Send className="h-4 w-4 mr-1" /> Mark as Sent
                </Button>
              )}

              {w.admin_note && <p className="text-sm text-muted-foreground">Note: {w.admin_note}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawals;
