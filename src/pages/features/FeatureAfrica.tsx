import { Globe, Check } from "lucide-react";
import FeaturePageLayout from "./FeaturePageLayout";
import heroImg from "@/assets/feature-africa.jpg";

const benefits = [
  "Discover events in Lagos, Nairobi, Accra, Dakar, Johannesburg, Addis Ababa, and more",
  "Categories tailored for African culture — Afrobeats, Amapiano, Jollof festivals, tech meetups",
  "City-based browsing to find events near you across the continent",
  "Multi-currency pricing so organizers can sell in their local currency",
  "Influencer marketplace focused on African creators with regional reach",
  "Sponsorship tools connecting African brands with event organizers",
  "Growing community of organizers, attendees, and creators across 20+ African countries",
];

const FeatureAfrica = () => (
  <FeaturePageLayout
    icon={<Globe className="h-10 w-10 text-orange-600" />}
    title="Africa-First Platform"
    subtitle="Built by Africans, for Africa. Afritickets is the event platform that understands the continent's vibrant culture, cities, and communities."
    heroColor="bg-orange-500/5"
    heroImage={heroImg}
  >
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-6">Made for the continent</h2>
        <div className="grid gap-4">
          {benefits.map((b) => (
            <div key={b} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="h-3.5 w-3.5 text-orange-600" />
              </div>
              <p className="text-muted-foreground">{b}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-8">
        <h3 className="font-bold text-xl mb-4">Cities we serve</h3>
        <div className="flex flex-wrap gap-3">
          {["Lagos", "Nairobi", "Accra", "Dakar", "Johannesburg", "Cape Town", "Addis Ababa", "Kampala", "Dar es Salaam", "Kigali", "Abidjan", "Casablanca", "Cairo", "Lusaka", "Maputo", "Windhoek"].map((city) => (
            <span key={city} className="px-4 py-2 rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-400 text-sm font-medium">
              {city}
            </span>
          ))}
        </div>
      </div>
    </div>
  </FeaturePageLayout>
);

export default FeatureAfrica;
