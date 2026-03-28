import { useState } from "react";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PromoCodeInputProps {
  eventIds: string[];
  onDiscount: (discount: { type: string; value: number }) => void;
}

const PromoCodeInput = ({ eventIds, onDiscount }: PromoCodeInputProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const { toast } = useToast();

  const applyCode = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      // Try each event ID
      for (const eventId of eventIds) {
        const { data, error } = await supabase.rpc("use_promo_code", {
          p_event_id: eventId,
          p_code: code.trim(),
        });
        if (!error && data && data.length > 0) {
          const { discount_type, discount_value } = data[0];
          onDiscount({ type: discount_type, value: Number(discount_value) });
          setApplied(true);
          toast({
            title: "Promo code applied! 🎉",
            description: discount_type === "percentage" ? `${discount_value}% off` : `$${discount_value} off`,
          });
          return;
        }
      }
      toast({ title: "Invalid promo code", variant: "destructive" });
    } catch (err: any) {
      toast({ title: err.message || "Invalid promo code", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (applied) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success text-sm">
        <Tag className="h-4 w-4" />
        <span>Promo code <strong>{code.toUpperCase()}</strong> applied!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Promo code"
        className="flex-1"
      />
      <Button variant="outline" onClick={applyCode} disabled={loading || !code.trim()}>
        {loading ? "..." : "Apply"}
      </Button>
    </div>
  );
};

export default PromoCodeInput;
