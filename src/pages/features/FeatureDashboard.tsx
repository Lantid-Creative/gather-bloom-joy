import { BarChart3, Check } from "lucide-react";
import FeaturePageLayout from "./FeaturePageLayout";

const benefits = [
  "Real-time revenue, ticket sales, and order tracking across all your events",
  "Beautiful bar charts showing revenue breakdown per event",
  "Expandable event cards with full attendee lists — names, emails, dates, and amounts",
  "One-click CSV export of all sales data for your records or accounting",
  "Per-event attendee email export for your email marketing campaigns",
  "Mailchimp integration — sync attendee lists directly to your email campaigns",
  "Sponsorship management — toggle sponsor-seeking, create tiers with benefits",
  "Promo code creation with percentage/fixed discounts, usage limits, and expiry dates",
  "Tracking links to measure which marketing channels drive the most ticket sales",
];

const FeatureDashboard = () => (
  <FeaturePageLayout
    icon={<BarChart3 className="h-10 w-10 text-blue-600" />}
    title="Organizer Dashboard"
    subtitle="Your command center for event management. Track every sale, manage attendees, and grow your events with data-driven insights."
    heroColor="bg-blue-500/5"
  >
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-6">Complete event intelligence</h2>
        <div className="grid gap-4">
          {benefits.map((b) => (
            <div key={b} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <p className="text-muted-foreground">{b}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-bold mb-2">📊 Revenue Analytics</h3>
          <p className="text-sm text-muted-foreground">See exactly how much each event is earning with interactive charts. Compare performance across events to understand what works.</p>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-bold mb-2">📧 Email Marketing</h3>
          <p className="text-sm text-muted-foreground">Export attendee emails or sync directly to Mailchimp. Build your audience with every event you run.</p>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-bold mb-2">🏷️ Promo Codes</h3>
          <p className="text-sm text-muted-foreground">Create discount codes to incentivize early purchases, reward loyal attendees, or run flash sales.</p>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-bold mb-2">🔗 Tracking Links</h3>
          <p className="text-sm text-muted-foreground">Generate unique links for each marketing channel and measure which ones drive the most ticket sales.</p>
        </div>
      </div>
    </div>
  </FeaturePageLayout>
);

export default FeatureDashboard;
