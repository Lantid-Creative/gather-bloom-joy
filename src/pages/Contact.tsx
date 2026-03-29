import { useState } from "react";
import { Mail, MessageSquare, MapPin, Phone } from "lucide-react";
import EventbriteHeader from "@/components/EventbriteHeader";
import EventbriteFooter from "@/components/EventbriteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const contactCards = [
  { icon: Mail, title: "Email Us", detail: "support@qantid.com", sub: "We reply within 24 hours" },
  { icon: MessageSquare, title: "Live Chat", detail: "Available 9am - 6pm WAT", sub: "Mon - Fri" },
  { icon: MapPin, title: "Visit Us", detail: "14 Adeola Hopewell St", sub: "Victoria Island, Lagos" },
  { icon: Phone, title: "Call Us", detail: "+234 800 TICKETS", sub: "Toll-free in Nigeria" },
];

const Contact = () => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast({ title: "Message sent! 📨", description: "We'll get back to you within 24 hours." });
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <EventbriteHeader />
      <div className="container max-w-5xl py-16 space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold">Get in Touch</h1>
          <p className="text-lg text-muted-foreground">
            Have a question or need help? We'd love to hear from you.
          </p>
        </div>

        {/* Contact cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {contactCards.map((c) => (
            <div key={c.title} className="p-5 rounded-xl border text-center space-y-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <c.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">{c.title}</h3>
              <p className="text-sm">{c.detail}</p>
              <p className="text-xs text-muted-foreground">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5 border rounded-2xl p-8">
            <h2 className="text-xl font-bold">Send us a message</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="c-name">Name</Label>
                <Input id="c-name" placeholder="Your name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-email">Email</Label>
                <Input id="c-email" type="email" placeholder="you@example.com" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-subject">Subject</Label>
              <Input id="c-subject" placeholder="How can we help?" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-message">Message</Label>
              <Textarea id="c-message" placeholder="Tell us more..." rows={5} required />
            </div>
            <Button variant="hero" size="lg" className="w-full rounded-full" disabled={sending}>
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
      <EventbriteFooter />
    </div>
  );
};

export default Contact;
