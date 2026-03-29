import { Link } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";
import QantidHeader from "@/components/QantidHeader";
import QantidFooter from "@/components/QantidFooter";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "per event",
    desc: "Perfect for free events and getting started.",
    features: [
      "Unlimited free events",
      "Up to 100 attendees",
      "Basic event page",
      "Email notifications",
      "Mobile check-in",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    price: "3.5%",
    period: "+ $1.50 per ticket",
    desc: "For organizers who sell tickets and want powerful tools.",
    features: [
      "Unlimited paid events",
      "Up to 5,000 attendees",
      "Custom event pages",
      "Analytics dashboard",
      "Mobile money payments",
      "Promo codes & discounts",
      "Attendee management",
      "Priority support",
    ],
    cta: "Start Selling",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    desc: "For large-scale events and organizations.",
    features: [
      "Unlimited attendees",
      "Dedicated account manager",
      "White-label options",
      "API access",
      "Multi-event management",
      "Advanced analytics",
      "Custom integrations",
      "On-site support",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const Pricing = () => (
  <div className="min-h-screen bg-background">
    <QantidHeader />
    <div className="container max-w-5xl py-16 space-y-16">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold">Simple, Transparent Pricing</h1>
        <p className="text-lg text-muted-foreground">
          No hidden fees. Only pay when you sell tickets.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-7 space-y-6 relative ${
              plan.popular ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Most Popular
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
            </div>
            <div>
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
            </div>
            <ul className="space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              variant={plan.popular ? "hero" : "outline"}
              size="lg"
              className="w-full rounded-full"
              asChild
            >
              <Link to={plan.name === "Enterprise" ? "/contact" : "/create-event"}>
                {plan.cta}
              </Link>
            </Button>
          </div>
        ))}
      </div>

      <div className="text-center p-8 rounded-2xl border bg-surface space-y-3">
        <h3 className="text-lg font-bold">No credit card required to start</h3>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Create free events instantly. Only upgrade when you're ready to sell tickets.
          We support mobile money, cards, and bank transfers across Africa.
        </p>
      </div>
    </div>
    <QantidFooter />
  </div>
);

export default Pricing;
