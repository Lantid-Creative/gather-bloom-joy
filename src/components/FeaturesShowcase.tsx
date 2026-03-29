import { Link } from "react-router-dom";
import {
  Ticket,
  QrCode,
  BarChart3,
  Users,
  Handshake,
  Tag,
  Link2,
  Globe,
  ShieldCheck,
  Megaphone,
  CreditCard,
  Star,
} from "lucide-react";

const features = [
  {
    icon: Ticket,
    title: "Smart Ticketing",
    desc: "Multiple ticket types, early-bird pricing, hidden tickets with access codes, and donation-based tickets.",
    link: "/features/ticketing",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: QrCode,
    title: "QR Check-In",
    desc: "Scan attendee QR codes at the door with instant sound & vibration feedback. Real-time scan history.",
    link: "/features/check-in",
    color: "bg-green-500/10 text-green-600",
  },
  {
    icon: BarChart3,
    title: "Organizer Dashboard",
    desc: "Track revenue, ticket sales, and attendees with beautiful charts. Export data as CSV anytime.",
    link: "/features/dashboard",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Megaphone,
    title: "Influencer Marketplace",
    desc: "Hire verified influencers across Africa to promote your events and products. Escrow-protected payments.",
    link: "/features/influencers",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: Handshake,
    title: "Sponsorship Management",
    desc: "Create sponsorship tiers, receive proposals from partners, and manage sponsor relationships.",
    link: "/features/sponsorship",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: Tag,
    title: "Promo Codes",
    desc: "Create percentage or fixed-amount discounts with usage limits and expiration dates.",
    link: "/features/promo-codes",
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    desc: "Stripe-powered checkout with escrow for influencer hires. Refund requests built in.",
    link: "/features/payments",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: Globe,
    title: "Africa-First",
    desc: "Built for African events with local cities, multi-currency support, and culturally-relevant categories.",
    link: "/features/africa",
    color: "bg-orange-500/10 text-orange-600",
  },
];

const FeaturesShowcase = () => (
  <section className="py-16 md:py-24">
    <div className="container">
      <div className="text-center mb-12">
        <p className="text-sm font-bold text-primary tracking-wider uppercase mb-2">
          Everything you need
        </p>
        <h2 className="text-3xl md:text-4xl font-black mb-4">
          The Complete Event Platform
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          From ticket sales to influencer marketing — Qantid gives organizers,
          attendees, and creators all the tools they need in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f) => (
          <Link
            key={f.title}
            to={f.link}
            className="group rounded-2xl border bg-card p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
          >
            <div className={`h-12 w-12 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <f.icon className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
              {f.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {f.desc}
            </p>
            <span className="inline-block mt-4 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Learn more →
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesShowcase;
