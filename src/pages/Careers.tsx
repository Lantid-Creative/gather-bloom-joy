import { Link } from "react-router-dom";
import { Rocket, Heart, Globe, Coffee } from "lucide-react";
import QantidHeader from "@/components/QantidHeader";
import QantidFooter from "@/components/QantidFooter";
import { Button } from "@/components/ui/button";

const perks = [
  { icon: Globe, title: "Remote First", desc: "Work from anywhere across Africa and beyond." },
  { icon: Heart, title: "Health & Wellness", desc: "Comprehensive health insurance for you and your family." },
  { icon: Coffee, title: "Learning Budget", desc: "Annual budget for courses, conferences, and books." },
  { icon: Rocket, title: "Equity Options", desc: "Share in the company's success as we grow." },
];

const Careers = () => (
  <div className="min-h-screen bg-background">
    <QantidHeader />
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

      {/* No open roles */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Open Positions</h2>
        <div className="text-center py-12 rounded-xl border border-dashed">
          <p className="text-muted-foreground">No open positions at the moment. Check back soon!</p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center p-10 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
        <h2 className="text-2xl font-bold">Interested in joining?</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We're always looking for talented people. Send us your resume and we'll keep you in mind.
        </p>
        <Button variant="hero" size="lg" className="rounded-full" asChild>
          <Link to="/contact">Get in Touch</Link>
        </Button>
      </div>
    </div>
    <QantidFooter />
  </div>
);

export default Careers;
