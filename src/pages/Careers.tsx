import { Link } from "react-router-dom";
import { Rocket, Heart, Globe, Coffee, Users, Zap, MapPin } from "lucide-react";
import EventbriteHeader from "@/components/EventbriteHeader";
import EventbriteFooter from "@/components/EventbriteFooter";
import { Button } from "@/components/ui/button";

const perks = [
  { icon: Globe, title: "Remote First", desc: "Work from anywhere across Africa and beyond." },
  { icon: Heart, title: "Health & Wellness", desc: "Comprehensive health insurance for you and your family." },
  { icon: Coffee, title: "Learning Budget", desc: "$2,000/year for courses, conferences, and books." },
  { icon: Rocket, title: "Equity Options", desc: "Share in the company's success as we grow." },
];

const roles = [
  { title: "Senior Frontend Engineer", team: "Engineering", location: "Remote (Africa)", type: "Full-time" },
  { title: "Product Designer", team: "Design", location: "Lagos, Nigeria", type: "Full-time" },
  { title: "Growth Marketing Manager", team: "Marketing", location: "Nairobi, Kenya", type: "Full-time" },
  { title: "Customer Success Lead", team: "Operations", location: "Remote (Africa)", type: "Full-time" },
  { title: "Backend Engineer", team: "Engineering", location: "Remote (Africa)", type: "Full-time" },
  { title: "Data Analyst", team: "Product", location: "Accra, Ghana", type: "Full-time" },
];

const Careers = () => (
  <div className="min-h-screen bg-background">
    <EventbriteHeader />
    <div className="container max-w-5xl py-16 space-y-20">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold">Join Our Team</h1>
        <p className="text-lg text-muted-foreground">
          Help us build the future of events in Africa. We're looking for passionate people
          who want to make a difference.
        </p>
      </div>

      {/* Why join */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Why Qantid?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {perks.map((p) => (
            <div key={p.title} className="p-5 rounded-xl border text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <p.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">{p.title}</h3>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Open roles */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Open Positions</h2>
        <div className="space-y-3">
          {roles.map((role) => (
            <div key={role.title} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border hover:border-primary/30 hover:bg-primary/5 transition-colors gap-3">
              <div>
                <h3 className="font-semibold">{role.title}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {role.team}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {role.location}
                  </span>
                  <span>·</span>
                  <span>{role.type}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-full shrink-0">
                Apply Now
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center p-10 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
        <h2 className="text-2xl font-bold">Don't see the right role?</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We're always looking for talented people. Send us your resume and we'll keep you in mind.
        </p>
        <Button variant="hero" size="lg" className="rounded-full" asChild>
          <Link to="/contact">Get in Touch</Link>
        </Button>
      </div>
    </div>
    <EventbriteFooter />
  </div>
);

export default Careers;
