import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import QantidHeader from "@/components/QantidHeader";
import QantidFooter from "@/components/QantidFooter";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type Status = "loading" | "valid" | "already_unsubscribed" | "invalid" | "success" | "error";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const validate = async () => {
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/handle-email-unsubscribe?token=${token}`,
          { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
        );
        const data = await res.json();
        if (!res.ok) {
          setStatus("invalid");
        } else if (data.valid === false && data.reason === "already_unsubscribed") {
          setStatus("already_unsubscribed");
        } else if (data.valid) {
          setStatus("valid");
        } else {
          setStatus("invalid");
        }
      } catch {
        setStatus("error");
      }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    setProcessing(true);
    try {
      const { error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <QantidHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center space-y-6">
          {status === "loading" && (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Validating your request…</p>
            </div>
          )}

          {status === "valid" && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">Unsubscribe from emails</h1>
              <p className="text-muted-foreground">
                Are you sure you want to unsubscribe? You'll stop receiving app emails from Qantid.
              </p>
              <Button
                onClick={handleUnsubscribe}
                disabled={processing}
                className="w-full"
                variant="destructive"
              >
                {processing ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing…</>
                ) : (
                  "Confirm Unsubscribe"
                )}
              </Button>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <h1 className="text-2xl font-bold text-foreground">Unsubscribed</h1>
              <p className="text-muted-foreground">
                You've been successfully unsubscribed from Qantid app emails.
              </p>
            </div>
          )}

          {status === "already_unsubscribed" && (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto" />
              <h1 className="text-2xl font-bold text-foreground">Already unsubscribed</h1>
              <p className="text-muted-foreground">
                You've already unsubscribed from these emails.
              </p>
            </div>
          )}

          {(status === "invalid" || status === "error") && (
            <div className="space-y-4">
              <XCircle className="h-12 w-12 text-destructive mx-auto" />
              <h1 className="text-2xl font-bold text-foreground">
                {status === "invalid" ? "Invalid link" : "Something went wrong"}
              </h1>
              <p className="text-muted-foreground">
                {status === "invalid"
                  ? "This unsubscribe link is invalid or has expired."
                  : "We couldn't process your request. Please try again later."}
              </p>
            </div>
          )}
        </div>
      </main>
      <QantidFooter />
    </div>
  );
};

export default Unsubscribe;
