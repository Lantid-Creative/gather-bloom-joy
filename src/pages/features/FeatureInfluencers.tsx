import { Megaphone, Check } from "lucide-react";
import FeaturePageLayout from "./FeaturePageLayout";
import heroImg from "@/assets/feature-influencers.jpg";

const benefits = [
  "Browse verified influencers across Africa — filter by region, category, and follower count",
  "Influencer profiles with social media stats, proof screenshots, and client reviews",
  "Hire for any marketing service — event promotion, product launches, brand campaigns, social media posts",
  "Predefined service packages with clear pricing and delivery timelines",
  "Custom hire requests with your own budget, description, and deadlines",
  "Escrow payment system — funds held securely until the job is completed and approved",
  "Deliverable submission and approval workflow — like Upwork for African influencer marketing",
  "Post-job review system — rate influencers and read reviews from other clients",
  "Influencer dashboard for managing profiles, services, and incoming orders",
];

const FeatureInfluencers = () => (
  <FeaturePageLayout
    icon={<Megaphone className="h-10 w-10 text-purple-600" />}
    title="Influencer Marketplace"
    subtitle="Find and hire trusted influencers across Africa to amplify your events and products. Escrow-protected payments keep both parties safe."
    heroColor="bg-purple-500/5"
  >
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-6">Marketing made simple</h2>
        <div className="grid gap-4">
          {benefits.map((b) => (
            <div key={b} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <p className="text-muted-foreground">{b}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-8">
        <h3 className="font-bold text-xl mb-4">How the escrow system works</h3>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: "1", title: "Hire", desc: "Choose an influencer and submit your job details with payment." },
            { step: "2", title: "Escrow", desc: "Payment is held securely — the influencer sees the funded order." },
            { step: "3", title: "Deliver", desc: "The influencer completes the work and submits deliverables." },
            { step: "4", title: "Release", desc: "You approve the work and payment is released to the influencer." },
          ].map((s) => (
            <div key={s.step} className="space-y-2">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">{s.step}</div>
              <h4 className="font-semibold">{s.title}</h4>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </FeaturePageLayout>
);

export default FeatureInfluencers;
