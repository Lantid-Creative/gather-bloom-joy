import { Link } from "react-router-dom";
import { Globe, Heart, Zap, Target } from "lucide-react";
import QantidHeader from "@/components/QantidHeader";
import QantidFooter from "@/components/QantidFooter";
import { Button } from "@/components/ui/button";

const values = [
  { icon: Globe, title: "Pan-African Vision", desc: "We believe Africa's vibrant event culture deserves a world-class platform built for its unique needs." },
  { icon: Heart, title: "Community First", desc: "Every feature we build starts with the community — organizers, attendees, and creators across the continent." },
  { icon: Zap, title: "Seamless Experience", desc: "From discovery to check-in, we make every step of the event journey smooth and delightful." },
  { icon: Target, title: "Empowering Organizers", desc: "We provide tools that help organizers grow their audiences and run successful events at any scale." },
];

const About = () => (
  <div className="min-h-screen bg-background">
    <QantidHeader />
    <div className="container max-w-5xl py-16 space-y-20">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold">Connecting Africa Through Events</h1>
        <p className="text-lg text-muted-foreground">
          Qantid is Africa's leading event discovery and ticketing platform, empowering organizers
          and connecting communities across the continent.
        </p>
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
            Qantid is growing into the continent's most trusted ticketing platform, serving
            organizers of all sizes from independent creators to major entertainment brands.
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

      {/* CTA */}
      <div className="text-center p-10 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
        <h2 className="text-2xl font-bold">Ready to create your next event?</h2>
        <p className="text-muted-foreground">Join organizers across Africa building amazing experiences.</p>
        <Button variant="hero" size="lg" className="rounded-full" asChild>
          <Link to="/create-event">Get Started Free</Link>
        </Button>
      </div>
    </div>
    <QantidFooter />
  </div>
);

export default About;
