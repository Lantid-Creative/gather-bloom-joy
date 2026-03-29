import { CreditCard, Check } from "lucide-react";
import FeaturePageLayout from "./FeaturePageLayout";

const benefits = [
  "Stripe-powered payment processing with support for cards and mobile money",
  "Secure checkout flow with order confirmation and PDF ticket delivery",
  "Escrow payments for influencer marketplace — funds held until work is approved",
  "Built-in refund request system for attendees with organizer approval workflow",
  "Multi-currency support — price events in the local currency of your audience",
  "Order history for attendees with downloadable tickets and receipts",
  "Real-time payment tracking in the organizer dashboard",
];

const FeaturePayments = () => (
  <FeaturePageLayout
    icon={<CreditCard className="h-10 w-10 text-emerald-600" />}
    title="Secure Payments"
    subtitle="Trusted payment processing with Stripe. Multi-currency support, escrow for influencer hires, and built-in refund handling."
    heroColor="bg-emerald-500/5"
  >
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-6">Payments you can trust</h2>
        <div className="grid gap-4">
          {benefits.map((b) => (
            <div key={b} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <p className="text-muted-foreground">{b}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-8">
        <h3 className="font-bold text-xl mb-3">Built for African markets</h3>
        <p className="text-muted-foreground leading-relaxed">
          We understand that African event organizers need flexible payment options. With multi-currency
          support, you can price your events in NGN, KES, GHS, ZAR, XOF, or USD — whatever makes sense
          for your audience. Our Stripe integration ensures secure, reliable payments with industry-standard
          fraud protection.
        </p>
      </div>
    </div>
  </FeaturePageLayout>
);

export default FeaturePayments;
