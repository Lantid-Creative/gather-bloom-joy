import { useState } from "react";
import { Search, BookOpen, Ticket, Settings, CreditCard, Shield, ChevronDown, ChevronUp } from "lucide-react";
import EventbriteHeader from "@/components/EventbriteHeader";
import EventbriteFooter from "@/components/EventbriteFooter";
import { Input } from "@/components/ui/input";

const categories = [
  { icon: BookOpen, title: "Getting Started", desc: "Create your account and first event", count: 12 },
  { icon: Ticket, title: "Tickets & Orders", desc: "Selling, pricing, and managing tickets", count: 18 },
  { icon: Settings, title: "Event Management", desc: "Edit, update, and manage your events", count: 15 },
  { icon: CreditCard, title: "Payments & Payouts", desc: "Mobile money, cards, and bank transfers", count: 10 },
  { icon: Shield, title: "Account & Security", desc: "Profile, password, and privacy settings", count: 8 },
];

const faqs = [
  { q: "How do I create an event?", a: "Sign in to your account, click 'Create Event' in the navigation bar, fill in your event details including title, date, location, and description, add ticket types, then publish. Your event will be live and discoverable immediately." },
  { q: "What payment methods do you support?", a: "We support mobile money (M-Pesa, MTN MoMo, Airtel Money), debit/credit cards (Visa, Mastercard), and bank transfers. Payment methods vary by country to ensure maximum accessibility across Africa." },
  { q: "How do I get my payout?", a: "Payouts are processed automatically after your event ends. Funds are sent to your registered bank account or mobile money wallet within 3-5 business days. You can track payout status from your organizer dashboard." },
  { q: "Can I offer free tickets?", a: "Yes! You can create events with free tickets at no cost to you. There are no platform fees for free events. Simply set the ticket price to $0 when creating your ticket types." },
  { q: "How do I cancel or reschedule an event?", a: "Go to My Events, find the event you want to modify, and click Edit. You can update the date, time, and other details. To cancel, click the Delete button. If tickets have been sold, attendees will be notified automatically." },
  { q: "Is there a mobile app?", a: "Yes! The Qantid mobile app is available for both iOS and Android. Attendees can use it to discover events and store digital tickets, while organizers can use it for on-site check-in with QR code scanning." },
  { q: "What's the maximum event capacity?", a: "On the Free plan, events can have up to 100 attendees. Professional plans support up to 5,000 attendees, and Enterprise plans have no capacity limits. Contact us for large-scale events." },
  { q: "Can I issue refunds?", a: "Yes, you can issue full or partial refunds through your organizer dashboard. Refunds are processed within 5-7 business days. Platform fees on refunded tickets are also returned." },
];

const HelpCenter = () => {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <EventbriteHeader />
      <div className="container max-w-4xl py-16 space-y-16">
        {/* Hero */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">How can we help?</h1>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for answers..."
              className="pl-10 h-12 rounded-full text-base"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.title} className="p-5 rounded-xl border hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer space-y-2">
              <cat.icon className="h-7 w-7 text-primary" />
              <h3 className="font-semibold">{cat.title}</h3>
              <p className="text-sm text-muted-foreground">{cat.desc}</p>
              <p className="text-xs text-primary font-medium">{cat.count} articles</p>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {filteredFaqs.map((faq, i) => (
              <div key={i} className="border rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <EventbriteFooter />
    </div>
  );
};

export default HelpCenter;
