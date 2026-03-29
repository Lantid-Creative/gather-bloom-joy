import { Tag, Check } from "lucide-react";
import FeaturePageLayout from "./FeaturePageLayout";
import heroImg from "@/assets/feature-promocodes.jpg";

const benefits = [
  "Create percentage-based or fixed-amount discount codes",
  "Set usage limits to control how many times a code can be redeemed",
  "Add expiration dates for time-limited promotions and flash sales",
  "Track usage count in real-time from your organizer dashboard",
  "Assign promo codes to specific events for targeted promotions",
  "Attendees apply codes at checkout for instant discounts",
  "Perfect for early-bird offers, group discounts, influencer partnerships, and VIP access",
];

const FeaturePromoCodes = () => (
  <FeaturePageLayout
    icon={<Tag className="h-10 w-10 text-pink-600" />}
    title="Promo Codes"
    subtitle="Drive ticket sales with flexible discount codes. Create time-limited offers, group discounts, and influencer-specific promotions."
    heroColor="bg-pink-500/5"
  >
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-6">Boost your sales</h2>
        <div className="grid gap-4">
          {benefits.map((b) => (
            <div key={b} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="h-3.5 w-3.5 text-pink-600" />
              </div>
              <p className="text-muted-foreground">{b}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-8">
        <h3 className="font-bold text-xl mb-4">Common promo code strategies</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-semibold">🎯 Early Bird</h4>
            <p className="text-sm text-muted-foreground">Offer 20% off for the first 50 buyers to create urgency and reward early supporters.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">👥 Group Discount</h4>
            <p className="text-sm text-muted-foreground">Share a code that gives 15% off when people buy 5+ tickets to encourage group attendance.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">📱 Influencer Codes</h4>
            <p className="text-sm text-muted-foreground">Give each influencer a unique code to track which ones drive the most sales.</p>
          </div>
        </div>
      </div>
    </div>
  </FeaturePageLayout>
);

export default FeaturePromoCodes;
