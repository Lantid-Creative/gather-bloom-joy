import { Handshake, Check } from "lucide-react";
import FeaturePageLayout from "./FeaturePageLayout";
import heroImg from "@/assets/feature-sponsorship.jpg";

const benefits = [
  "Create tiered sponsorship packages — Gold, Silver, Bronze or custom names",
  "Define benefits per tier: logo placement, booth space, speaking slots, and more",
  "Set pricing in any currency with optional sponsor limits per tier",
  "Partners can browse events seeking sponsors and submit proposals",
  "Accept, reject, or negotiate sponsorship requests from your dashboard",
  "Partner profiles with company info, industry, and website for credibility",
  "Partner dashboard to track all sponsorship requests and their statuses",
  "Toggle sponsorship on/off per event — only show when you're ready",
];

const FeatureSponsorship = () => (
  <FeaturePageLayout
    icon={<Handshake className="h-10 w-10 text-amber-600" />}
    title="Sponsorship Management"
    subtitle="Connect with brands and sponsors who want to support your events. Create tiers, receive proposals, and manage partnerships."
    heroColor="bg-amber-500/5"
    heroImage={heroImg}
  >
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-6">Attract the right sponsors</h2>
        <div className="grid gap-4">
          {benefits.map((b) => (
            <div key={b} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <p className="text-muted-foreground">{b}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-bold mb-2">For Organizers</h3>
          <p className="text-sm text-muted-foreground">Create sponsorship tiers with clear benefits and pricing. Toggle sponsor-seeking on when you're ready to receive proposals. Manage everything from your organizer dashboard.</p>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-bold mb-2">For Partners & Brands</h3>
          <p className="text-sm text-muted-foreground">Browse events seeking sponsors, review tier options, and submit proposals. Track your requests and build relationships with event organizers across Africa.</p>
        </div>
      </div>
    </div>
  </FeaturePageLayout>
);

export default FeatureSponsorship;
