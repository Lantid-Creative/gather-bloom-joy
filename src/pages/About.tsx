import { Link } from "react-router-dom";
import { ArrowLeft, Users, Globe, Heart, Zap, Target, Award } from "lucide-react";
import EventbriteHeader from "@/components/EventbriteHeader";
import EventbriteFooter from "@/components/EventbriteFooter";
import { Button } from "@/components/ui/button";

const values = [
  { icon: Globe, title: "Pan-African Vision", desc: "We believe Africa's vibrant event culture deserves a world-class platform built for its unique needs." },
  { icon: Heart, title: "Community First", desc: "Every feature we build starts with the community — organizers, attendees, and creators across the continent." },
  { icon: Zap, title: "Seamless Experience", desc: "From discovery to check-in, we make every step of the event journey smooth and delightful." },
  { icon: Target, title: "Empowering Organizers", desc: "We provide tools that help organizers grow their audiences and run successful events at any scale." },
];

const stats = [
  { value: "15+", label: "African Countries" },
  { value: "50K+", label: "Events Hosted" },
  { value: "2M+", label: "Tickets Sold" },
  { value: "10K+", label: "Organizers" },
];

const team = [
  { name: "Amara Okafor", role: "CEO & Co-Founder", icon: Users },
  { name: "Kwame Mensah", role: "CTO & Co-Founder", icon: Zap },
  { name: "Fatima El-Amin", role: "Head of Product", icon: Target },
  { name: "David Kimani", role: "Head of Growth", icon: Award },
];

const About = () => (
  <div className="min-h-screen bg-background">
    <EventbriteHeader />
    <div className="container max-w-5xl py-16 space-y-20">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold">Connecting Africa Through Events</h1>
        <p className="text-lg text-muted-foreground">
          Afritickets is Africa's leading event discovery and ticketing platform, empowering organizers
          and connecting communities across the continent.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/10">
            <p className="text-3xl font-bold text-primary">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Mission */}
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            We're on a mission to democratize event access across Africa. Whether it's a tech
            conference in Lagos, a music festival in Nairobi, a food fair in Accra, or an art
            exhibition in Cape Town — we believe everyone should be able to discover, attend,
            and create memorable experiences.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Founded in 2024, Afritickets has grown from a small idea into the continent's most
            trusted ticketing platform, serving organizers of all sizes from independent creators
            to major entertainment brands.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {values.map((v) => (
            <div key={v.title} className="p-5 rounded-xl border space-y-2">
              <v.icon className="h-6 w-6 text-primary" />
              <h3 className="font-semibold text-sm">{v.title}</h3>
              <p className="text-xs text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Leadership Team</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {team.map((t) => (
            <div key={t.name} className="text-center p-6 rounded-xl border space-y-3">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <t.icon className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center p-10 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
        <h2 className="text-2xl font-bold">Ready to create your next event?</h2>
        <p className="text-muted-foreground">Join thousands of organizers across Africa.</p>
        <Button variant="hero" size="lg" className="rounded-full" asChild>
          <Link to="/create-event">Get Started Free</Link>
        </Button>
      </div>
    </div>
    <EventbriteFooter />
  </div>
);

export default About;
