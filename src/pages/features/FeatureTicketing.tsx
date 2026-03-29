import { Ticket, Check } from "lucide-react";
import FeaturePageLayout from "./FeaturePageLayout";
import heroImg from "@/assets/feature-ticketing.jpg";

const benefits = [
  "Create unlimited ticket types per event — VIP, General, Early Bird, Student, and more",
  "Set per-ticket capacity limits with real-time availability tracking",
  "Hidden tickets with access codes for exclusive pre-sale or invite-only access",
  "Donation-based tickets with customizable minimum prices",
  "Max-per-order limits to prevent scalping and ensure fair access",
  "Sales windows with automatic start/end dates for each ticket type",
  "Multi-currency support — sell in USD, NGN, KES, GHS, XOF and more",
  "Automatic PDF ticket generation with unique QR codes for each purchase",
];

const FeatureTicketing = () => (
  <FeaturePageLayout
    icon={<Ticket className="h-10 w-10 text-primary" />}
    title="Smart Ticketing"
    subtitle="Flexible ticket types, pricing, and access controls built for every kind of African event — from intimate meetups to massive festivals."
    heroColor="bg-primary/5"
    heroImage={heroImg}
  >
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-6">Everything you need to sell tickets</h2>
        <div className="grid gap-4">
          {benefits.map((b) => (
            <div key={b} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-muted-foreground">{b}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-8">
        <h3 className="font-bold text-xl mb-3">How it works</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">1</div>
            <h4 className="font-semibold">Create your event</h4>
            <p className="text-sm text-muted-foreground">Add event details, choose a category, set date, time and venue.</p>
          </div>
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">2</div>
            <h4 className="font-semibold">Configure tickets</h4>
            <p className="text-sm text-muted-foreground">Add multiple ticket types with custom pricing, quantities, and access rules.</p>
          </div>
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">3</div>
            <h4 className="font-semibold">Start selling</h4>
            <p className="text-sm text-muted-foreground">Share your event link and watch sales come in through your dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  </FeaturePageLayout>
);

export default FeatureTicketing;
